/**
 * Automated Admin Test Script
 * Tests the complete quiz flow without interactive input
 */

import { WebSocket } from 'ws';
import { randomBytes } from 'crypto';

const WS_URL = 'http://127.0.0.1:1999/party';

const QUESTIONS = [
  {
    id: 'q1',
    text: 'What is the capital of Japan?',
    options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
    correctAnswer: 2,
  },
  {
    id: 'q2',
    text: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
  },
  {
    id: 'q3',
    text: 'What is the largest mammal in the world?',
    options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'],
    correctAnswer: 1,
  },
];

console.log('='.repeat(70));
console.log('🎮 AUTOMATED ADMIN TEST');
console.log('='.repeat(70));

const activityKey = 'quiz-' + randomBytes(4).toString('hex').toLowerCase();
console.log(`Activity Key: ${activityKey}\n`);

let ws: WebSocket | null = null;
let users: any[] = [];
let currentQuestionIndex = 0;
let quizState = 'LOBBY';
let questionStartTime = 0;

function connect() {
  const wsUrl = `${WS_URL}/${activityKey}`;
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
      users = message.payload.users || [];
      console.log(`\n👥 Users: ${users.length}`);
      users.forEach((u: any) => {
        if (u.role !== 'ADMIN') {
          console.log(`  • ${u.nickname} (${u.avatar})`);
        }
      });
      break;

    case 'ADMIN_CONFIRMED':
      console.log('\n✓ Admin privileges confirmed');
      setTimeout(() => {
        console.log('\n🚀 Starting quiz...');
        startQuiz();
      }, 3000);
      break;

    case 'GET_READY':
      console.log(`\n🎯 Get Ready! Question ${message.payload.questionIndex}/${message.payload.totalQuestions}`);
      break;

    case 'QUESTION_LOADER':
      console.log('\n⏳ Loading next question...');
      break;

    case 'QUESTION_START':
      currentQuestionIndex = message.payload.questionIndex - 1;
      quizState = 'QUESTION_ACTIVE';
      questionStartTime = Date.now();
      console.log(`\n${'='.repeat(70)}`);
      console.log(`❓ Question ${message.payload.questionIndex}/${message.payload.totalQuestions}`);
      console.log('='.repeat(70));
      console.log(message.payload.question);
      console.log('\nOptions:');
      message.payload.options.forEach((opt: string, idx: number) => {
        console.log(`  ${idx + 1}. ${opt}`);
      });
      console.log(`\n⏱️  Time: ${message.payload.duration} seconds`);
      console.log('='.repeat(70));
      break;

    case 'QUESTION_STATS_UPDATE':
      const stats = message.payload;
      console.log(`\n📊 Stats: ${stats.totalResponses}/${stats.totalUsers} responses`);
      console.log(`   Options: [${stats.optionCounts.join(' | ')}]`);
      break;

    case 'SHOW_ANSWER':
      quizState = 'SHOW_ANSWER';
      const question = QUESTIONS.find(q => q.id === message.payload.questionId);
      if (question) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`💡 Answer Revealed`);
        console.log('='.repeat(70));
        console.log(`Correct: ${question.options[question.correctAnswer]} (Option ${question.correctAnswer + 1})`);
        console.log(`Responses: ${message.payload.questionStats?.totalResponses || 0}`);
        console.log('='.repeat(70));
      }
      console.log('\n⏳ Waiting 2 seconds then showing leaderboard...');
      setTimeout(() => {
        showLeaderboard();
      }, 2000);
      break;

    case 'LEADERBOARD_UPDATE':
      quizState = 'LEADERBOARD';
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🏆 LEADERBOARD`);
      console.log('='.repeat(70));
      message.payload.leaderboard.forEach((entry: any, idx: number) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
        console.log(`  ${medal} ${idx + 1}. ${entry.nickname} - ${entry.score || 0} pts`);
      });
      console.log('='.repeat(70));
      console.log('\n⏳ Waiting 3 seconds then moving to next question...');
      setTimeout(() => {
        nextQuestion();
      }, 3000);
      break;

    case 'QUIZ_END':
      quizState = 'ENDED';
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🏁 QUIZ COMPLETED!`);
      console.log('='.repeat(70));
      console.log('\n🏆 FINAL LEADERBOARD:');
      message.payload.finalLeaderboard.forEach((entry: any, idx: number) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
        console.log(`  ${medal} ${idx + 1}. ${entry.nickname} - ${entry.score || 0} pts`);
      });
      console.log('='.repeat(70));
      console.log('\n✅ Test completed successfully!');
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
      userId: 'admin',
      nickname: 'Game Master',
      avatar: '👑',
      activityKey,
      role: 'ADMIN',
    },
  };
  ws?.send(JSON.stringify(message));
  console.log('✓ Joined as admin');
}

function startQuiz() {
  const questionsWithDuration = QUESTIONS.map(q => ({
    ...q,
    duration: 15,
  }));

  const message = {
    type: 'START_QUIZ',
    payload: {
      activityKey,
      questions: questionsWithDuration,
    },
  };

  ws?.send(JSON.stringify(message));
}

function showLeaderboard() {
  const message = {
    type: 'SHOW_LEADERBOARD',
    payload: {
      activityKey,
    },
  };
  ws?.send(JSON.stringify(message));
  console.log('➡️  Sent: SHOW_LEADERBOARD');
}

function nextQuestion() {
  if (currentQuestionIndex < QUESTIONS.length - 1) {
    const message = {
      type: 'NEXT_QUESTION',
      payload: {
        activityKey,
      },
    };
    ws?.send(JSON.stringify(message));
    console.log('➡️  Sent: NEXT_QUESTION');
  } else {
    console.log('\n🏁 All questions completed!');
    console.log('Sending NEXT_QUESTION will end quiz...');
    const message = {
      type: 'NEXT_QUESTION',
      payload: {
        activityKey,
      },
    };
    ws?.send(JSON.stringify(message));
  }
}

// Start the test
connect();
