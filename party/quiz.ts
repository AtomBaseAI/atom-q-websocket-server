import type * as Party from 'partykit/server';
import { QuizStore } from '../store/quizStore';
import { TimerService } from '../utils/timer';
import { 
  Message, 
  User, 
  JoinLobbyMessage,
  SubmitAnswerMessage,
  StartQuizMessage,
  UserInfo
} from '../types';

export default class QuizServer implements Party.Server {
  private quizStore: QuizStore;
  private timerService: TimerService;
  private connections: Map<string, Party.Connection> = new Map();
  
  // Fix: Use Party.Room (it exists, TypeScript might just need to recognize it)
  constructor(public room: Party.Room) {
    this.quizStore = new QuizStore();
    this.timerService = new TimerService();
  }

  /**
   * Handle new connections
   */
  onConnect(connection: Party.Connection, ctx: Party.ConnectionContext): void {
    console.log(`Connected: ${connection.id}`);
    this.connections.set(connection.id, connection);
    
    // Send initial sync time
    this.sendSyncTime(connection);
  }

  /**
   * Handle incoming messages
   */
  async onMessage(message: string, sender: Party.Connection): Promise<void> {
    try {
      const data: Message = JSON.parse(message);
      console.log('Received message:', data.type);
      
      switch (data.type) {
        case 'JOIN_LOBBY':
          this.handleJoinLobby(data as JoinLobbyMessage, sender);
          break;
          
        case 'LEAVE_LOBBY':
          this.handleLeaveLobby(data, sender);
          break;
          
        case 'START_QUIZ':
          await this.handleStartQuiz(data as StartQuizMessage, sender);
          break;
          
        case 'SUBMIT_ANSWER':
          this.handleSubmitAnswer(data as SubmitAnswerMessage, sender);
          break;
          
        case 'SYNC_TIME':
          this.sendSyncTime(sender);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendError(sender, 'INVALID_MESSAGE', 'Invalid message format');
    }
  }

  /**
   * Handle user joining lobby
   */
  private handleJoinLobby(data: JoinLobbyMessage, connection: Party.Connection): void {
    const { userId, nickname, avatar, activityKey, role } = data.payload;
    
    // Create user
    const user: User = {
      id: userId,
      nickname,
      avatar,
      role,
      status: 'ONLINE',
      joinedAt: Date.now(),
      totalScore: 0,
      answers: [],
    };
    
    // Add to store
    this.quizStore.addUser(activityKey, user);
    
    // Store connection with user info
    (connection as any).userId = userId;
    (connection as any).activityKey = activityKey;
    (connection as any).role = role;
    
    // Broadcast updated user list
    this.broadcastUserUpdate(activityKey);
    
    // If user is admin, send admin status
    if (role === 'ADMIN') {
      this.sendToConnection(connection, {
        type: 'ADMIN_CONFIRMED',
        payload: { activityKey }
      });
    }
    
    console.log(`User ${nickname} (${role}) joined room ${activityKey}`);
  }

  /**
   * Handle user leaving
   */
  private handleLeaveLobby(data: any, connection: Party.Connection): void {
    const { userId, activityKey } = data.payload;
    
    this.quizStore.removeUser(activityKey, userId);
    this.broadcastUserUpdate(activityKey);
    
    console.log(`User ${userId} left room ${activityKey}`);
  }

  /**
   * Handle quiz start
   */
  private async handleStartQuiz(data: StartQuizMessage, connection: Party.Connection): Promise<void> {
    const { activityKey, questions } = data.payload;
    
    // Verify admin
    if (!this.quizStore.isAdmin(activityKey, (connection as any).userId)) {
      this.sendError(connection, 'UNAUTHORIZED', 'Only admin can start the quiz');
      return;
    }
    
    console.log(`Starting quiz in room ${activityKey} with ${questions.length} questions`);
    
    // Start quiz
    this.quizStore.startQuiz(activityKey, questions);
    
    // Begin quiz flow
    await this.runQuizFlow(activityKey);
  }

  /**
   * Main quiz flow controller
   */
  private async runQuizFlow(activityKey: string): Promise<void> {
    const room = this.quizStore.getRoom(activityKey);
    if (!room) return;
    
    const totalQuestions = room.questions.length;
    
    for (let i = 0; i < totalQuestions; i++) {
      // Get Ready Screen (5 seconds)
      await this.getReadyPhase(activityKey, i);
      
      // Question Loader (5 seconds)
      await this.questionLoaderPhase(activityKey, i);
      
      // Active Question (15 seconds)
      await this.questionActivePhase(activityKey, i);
      
      // Show Answer
      await this.showAnswerPhase(activityKey, i);
    }
    
    // Show final leaderboard
    await this.showLeaderboard(activityKey);
    
    // Waiting screen for next quiz
    await this.waitingScreen(activityKey);
  }

  /**
   * Get Ready Phase - 5 seconds
   */
  private async getReadyPhase(activityKey: string, questionIndex: number): Promise<void> {
    const room = this.quizStore.getRoom(activityKey);
    if (!room) return;
    
    this.quizStore.setQuizState(activityKey, 'GET_READY');
    
    this.room.broadcast(JSON.stringify({
      type: 'GET_READY',
      payload: {
        duration: 5,
        questionIndex: questionIndex + 1,
        totalQuestions: room.questions.length
      }
    }));
    
    await this.timerService.sleep(5000);
  }

  /**
   * Question Loader Phase - 5 seconds
   */
  private async questionLoaderPhase(activityKey: string, questionIndex: number): Promise<void> {
    this.quizStore.setQuizState(activityKey, 'QUESTION_LOADER');
    
    this.room.broadcast(JSON.stringify({
      type: 'QUESTION_LOADER',
      payload: {
        duration: 5,
        questionIndex: questionIndex + 1
      }
    }));
    
    await this.timerService.sleep(5000);
  }

  /**
   * Question Active Phase - 15 seconds with real-time stats
   */
  private async questionActivePhase(activityKey: string, questionIndex: number): Promise<void> {
    const room = this.quizStore.getRoom(activityKey);
    if (!room) return;
    
    const question = room.questions[questionIndex];
    const duration = question.duration || 15;
    
    // Update room state
    this.quizStore.setQuizState(activityKey, 'QUESTION_ACTIVE');
    
    // Broadcast question start
    this.room.broadcast(JSON.stringify({
      type: 'QUESTION_START',
      payload: {
        questionId: question.id,
        question: question.text,
        options: question.options,
        duration,
        questionIndex: questionIndex + 1,
        totalQuestions: room.questions.length
      }
    }));
    
    // Send real-time stats every second
    const statsInterval = setInterval(() => {
      const stats = this.quizStore.getQuestionStats(activityKey, question.id);
      if (stats) {
        this.room.broadcast(JSON.stringify({
          type: 'QUESTION_STATS_UPDATE',
          payload: {
            questionId: question.id,
            totalResponses: stats.totalResponses,
            optionCounts: stats.optionCounts,
            totalUsers: this.quizStore.getUserCount(activityKey)
          }
        }));
      }
    }, 1000);
    
    // Wait for question duration
    await this.timerService.sleep(duration * 1000);
    
    // Clear interval
    clearInterval(statsInterval);
  }

  /**
   * Show Answer Phase
   */
  private async showAnswerPhase(activityKey: string, questionIndex: number): Promise<void> {
    const room = this.quizStore.getRoom(activityKey);
    if (!room) return;
    
    const question = room.questions[questionIndex];
    const stats = this.quizStore.getQuestionStats(activityKey, question.id);
    
    this.quizStore.setQuizState(activityKey, 'SHOW_ANSWER');
    
    // Broadcast answer with stats
    this.room.broadcast(JSON.stringify({
      type: 'SHOW_ANSWER',
      payload: {
        questionId: question.id,
        correctAnswer: question.correctAnswer,
        questionStats: stats || {
          questionId: question.id,
          totalResponses: 0,
          optionCounts: [0, 0, 0, 0],
          responseTimeline: []
        }
      }
    }));
    
    // Show answer for 3 seconds
    await this.timerService.sleep(3000);
    
    // Update leaderboard after each question
    await this.updateLeaderboard(activityKey);
  }

  /**
   * Handle answer submission
   */
  private handleSubmitAnswer(data: SubmitAnswerMessage, connection: Party.Connection): void {
    const { userId, questionId, answer, timeSpent, activityKey } = data.payload;
    
    // Verify user exists in room
    if (!this.quizStore.userExists(activityKey, userId)) {
      this.sendError(connection, 'USER_NOT_FOUND', 'User not found in room');
      return;
    }
    
    // Calculate score
    const score = this.quizStore.submitAnswer(
      activityKey,
      userId,
      questionId,
      answer,
      timeSpent
    );
    
    // Send confirmation to user
    this.sendToConnection(connection, {
      type: 'ANSWER_CONFIRMED',
      payload: {
        questionId,
        score,
        timeSpent
      }
    });
    
    console.log(`User ${userId} answered question ${questionId} in ${timeSpent}s, score: ${score}`);
  }

  /**
   * Update and broadcast leaderboard
   */
  private async updateLeaderboard(activityKey: string): Promise<void> {
    const leaderboard = this.quizStore.getLeaderboard(activityKey);
    
    this.quizStore.setQuizState(activityKey, 'LEADERBOARD');
    
    this.room.broadcast(JSON.stringify({
      type: 'LEADERBOARD_UPDATE',
      payload: {
        leaderboard,
        activityKey
      }
    }));
    
    // Show leaderboard for 5 seconds
    await this.timerService.sleep(5000);
  }

  /**
   * Show final leaderboard
   */
  private async showLeaderboard(activityKey: string): Promise<void> {
    const leaderboard = this.quizStore.getLeaderboard(activityKey);
    
    this.quizStore.setQuizState(activityKey, 'LEADERBOARD');
    
    this.room.broadcast(JSON.stringify({
      type: 'QUIZ_END',
      payload: {
        finalLeaderboard: leaderboard
      }
    }));
    
    // Show leaderboard for 10 seconds
    await this.timerService.sleep(10000);
  }

  /**
   * Waiting screen for next quiz
   */
  private async waitingScreen(activityKey: string): Promise<void> {
    const room = this.quizStore.getRoom(activityKey);
    if (!room) return;
    
    this.quizStore.setQuizState(activityKey, 'WAITING');
    
    // Get users for waiting screen
    const users = this.quizStore.getUsers(activityKey);
    
    this.room.broadcast(JSON.stringify({
      type: 'WAITING_SCREEN',
      payload: {
        users,
        activityKey
      }
    }));
  }

  /**
   * Broadcast user count update
   */
  private broadcastUserUpdate(activityKey: string): void {
    const count = this.quizStore.getUserCount(activityKey);
    const users = this.quizStore.getUsers(activityKey);
    
    this.room.broadcast(JSON.stringify({
      type: 'USER_UPDATE',
      payload: {
        count,
        users,
        activityKey
      }
    }));
  }

  /**
   * Send sync time to client
   */
  private sendSyncTime(connection: Party.Connection): void {
    this.sendToConnection(connection, {
      type: 'SYNC_TIME',
      payload: {
        serverTime: Date.now()
      }
    });
  }

  /**
   * Send error to specific connection
   */
  private sendError(connection: Party.Connection, code: string, message: string): void {
    this.sendToConnection(connection, {
      type: 'ERROR',
      payload: { code, message }
    });
  }

  /**
   * Send message to specific connection
   */
  private sendToConnection(connection: Party.Connection, message: any): void {
    try {
      connection.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message to connection:', error);
    }
  }

  /**
   * Handle connection close
   */
  onClose(connection: Party.Connection): void {
    const userId = (connection as any).userId;
    const activityKey = (connection as any).activityKey;
    
    if (userId && activityKey) {
      this.quizStore.removeUser(activityKey, userId);
      this.broadcastUserUpdate(activityKey);
      console.log(`User ${userId} disconnected from room ${activityKey}`);
    }
    
    this.connections.delete(connection.id);
  }

  /**
   * Handle room deletion/cleanup
   */
  onRemove(): void {
    console.log(`Room ${this.room.id} is being removed`);
    this.timerService.clearAll();
  }
}