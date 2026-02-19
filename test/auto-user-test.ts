/**
 * Automated User Test Script
 * Tests the complete user flow without interactive input
 */

import { WebSocket } from 'ws';

const WS_URL = 'http://127.0.0.1:1999/party';

const args = process.argv.slice(2);
const ACTIVITY_KEY = args[0];
const NICKNAME = args[1] || 'TestUser';
const USER_ID = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

if (!ACTIVITY_KEY) {
  console.log('Usage: bun run auto-user-test.ts <activity-key> [nickname]');
  process.exit(1);
}

console.log('='.repeat(70));
console.log('🎮 AUTOMATED USER TEST');
console.log('='.repeat(70));
console.log(`Activity Key: ${ACTIVITY_KEY}`);
console.log(`User: ${NICKNAME}`);
console.log(`User ID: ${USER_ID}\n`);

let ws: WebSocket | null = null;
let currentQuestion: any = null;
let currentQuestionStartTime: number = 0;
let canAnswer: boolean = false;
let hasAnswered: boolean = false;
let totalScore: number = 0;
let questionCount: number = 0;
const AVATAR = '🎮';

function connect() {
  const wsUrl = `${WS_URL}/${ACTIVITY_KEY}`;
  console.log(`Connecting to ${wsUrl}...`);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('✓ Connected to quiz server');
    joinLobby();
  };

  ws.onerror = (error) => {
    console.error('✗ Connection error:', error);
  };

  ws.onmessage = (event) => {
    handleMessage(JSON.parse(event.data.toString()));
  };

  ws.onclose = () => {
    console.log('\n⚠️  Disconnected from server');
  };
}

function handleMessage(message: any) {
  switch (message.type) {
    case 'USER_UPDATE':
      console.log(`👥 Users: ${message.payload.users?.length || 0}`);
      break;

    case 'GET_READY':
      console.log(`\n🎯 GET READY! Question ${message.payload.questionIndex}/${message.payload.totalQuestions}`);
      console.log(`   Starting in ${message.payload.duration} seconds...`);
      canAnswer = false;
      hasAnswered = false;
      break;

    case 'QUESTION_LOADER':
      console.log('\n⏳ Loading question...');
      break;

    case 'QUESTION_START':
      currentQuestion = message.payload;
      currentQuestionStartTime = Date.now();
      canAnswer = true;
      hasAnswered = false;
      console.log(`\n${'='.repeat(70)}`);
      console.log(`❓ Question ${currentQuestion.questionIndex}/${currentQuestion.totalQuestions}`);
      console.log('='.repeat(70));
      console.log(currentQuestion.question);
      console.log('\nOptions:');
      currentQuestion.options.forEach((opt: string, idx: number) => {
        console.log(`  ${idx + 1}. ${opt}`);
      });
      console.log(`\n⏱️  Time Limit: ${currentQuestion.duration} seconds`);
      console.log('='.repeat(70));

      // Auto-answer after 3 seconds
      setTimeout(() => {
        if (canAnswer && !hasAnswered) {
          const randomAnswer = Math.floor(Math.random() * currentQuestion.options.length);
          submitAnswer(randomAnswer);
        }
      }, 3000);
      break;

    case 'QUESTION_STATS_UPDATE':
      if (hasAnswered) {
        const stats = message.payload;
        const responseRate = ((stats.totalResponses / stats.totalUsers) * 100).toFixed(1);
        console.log(`\n📊 Responses: ${stats.totalResponses}/${stats.totalUsers} (${responseRate}%)`);
      }
      break;

    case 'ANSWER_CONFIRMED':
      hasAnswered = true;
      console.log(`\n✓ Answer confirmed!`);
      console.log(`   Score: ${message.payload.score} points`);
      console.log(`   Time taken: ${message.payload.timeSpent.toFixed(2)} seconds`);
      totalScore += message.payload.score;
      questionCount++;
      console.log(`   Total Score: ${totalScore} points`);
      break;

    case 'SHOW_ANSWER':
      canAnswer = false;
      console.log(`\n${'='.repeat(70)}`);
      console.log(`💡 ANSWER REVEALED`);
      console.log('='.repeat(70));
      console.log(`Correct Answer: Option ${message.payload.correctAnswer + 1}`);

      const stats = message.payload.questionStats;
      if (stats) {
        console.log(`\n📊 Question Statistics:`);
        console.log(`   Total Responses: ${stats.totalResponses}`);
        if (stats.optionCounts) {
          stats.optionCounts.forEach((count: number, idx: number) => {
            const percentage = stats.totalResponses > 0
              ? ((count / stats.totalResponses) * 100).toFixed(1)
              : '0.0';
            console.log(`   Option ${idx + 1}: ${count} votes (${percentage}%)`);
          });
        }
      }
      console.log('='.repeat(70));
      console.log('\n⏳ Waiting for admin to show leaderboard...');
      break;

    case 'LEADERBOARD_UPDATE':
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🏆 LEADERBOARD UPDATE`);
      console.log('='.repeat(70));

      // Show only user's score
      const userEntry = message.payload.leaderboard.find((entry: any) => entry.userId === USER_ID);
      if (userEntry) {
        const rank = message.payload.leaderboard.findIndex((entry: any) => entry.userId === USER_ID) + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
        console.log(`  ${medal} Rank ${rank}: ${userEntry.nickname} (YOU) - ${userEntry.score || 0} pts`);
      }
      console.log('='.repeat(70));
      console.log('\n⏳ Waiting for admin to proceed to next question...');
      break;

    case 'QUIZ_END':
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🏁 QUIZ COMPLETED!`);
      console.log('='.repeat(70));
      console.log(`\n📊 Your Final Score: ${totalScore} points`);
      console.log(`   Questions Answered: ${questionCount}`);
      console.log('\n🎉 Thanks for playing!');
      console.log('='.repeat(70));
      console.log('\n✅ User test completed successfully!');
      ws?.close();
      setTimeout(() => process.exit(0), 2000);
      break;

    default:
      console.log(`\n📩 ${message.type}`);
  }
}

function joinLobby() {
  const message = {
    type: 'JOIN_LOBBY',
    payload: {
      userId: USER_ID,
      nickname: NICKNAME,
      avatar: AVATAR,
      activityKey: ACTIVITY_KEY,
      role: 'USER',
    },
  };
  ws?.send(JSON.stringify(message));
  console.log('✓ Joined lobby');
}

function submitAnswer(answer: number) {
  if (!currentQuestion || !canAnswer) return;

  canAnswer = false;
  hasAnswered = true;

  const questionId = currentQuestion.questionId || currentQuestion.id;
  const timeSpent = (Date.now() - currentQuestionStartTime) / 1000;

  const message = {
    type: 'SUBMIT_ANSWER',
    payload: {
      userId: USER_ID,
      questionId: questionId,
      answer: answer,
      timeSpent: timeSpent,
      activityKey: ACTIVITY_KEY,
    },
  };

  ws?.send(JSON.stringify(message));

  console.log(`\n🎯 Submitted answer: Option ${answer + 1}`);
}

// Start the test
connect();
