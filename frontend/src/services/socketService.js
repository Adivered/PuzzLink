import { io } from 'socket.io-client';
import ChatSocketHandler from './socket/chatSocketHandler';
import UserSocketHandler from './socket/userSocketHandler';
import RoomSocketHandler from './socket/roomSocketHandler';
import GameSocketHandler from './socket/gameSocketHandler';
import { SOCKET_EVENTS } from '../constants/socketEvents';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.handlers = {};
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Initialize handlers
    this.initializeHandlers();

    // Core connection events
    this.socket.on(SOCKET_EVENTS.CONNECTION, () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });
  }

  initializeHandlers() {
    // Initialize all modular handlers
    this.handlers.chat = new ChatSocketHandler(this.socket);
    this.handlers.user = new UserSocketHandler(this.socket);
    this.handlers.room = new RoomSocketHandler(this.socket);
    this.handlers.game = new GameSocketHandler(this.socket);
  }

  disconnect() {
    if (this.socket) {
      // Cleanup all handlers
      Object.values(this.handlers).forEach(handler => {
        if (handler.destroy) {
          handler.destroy();
        }
      });
      
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.handlers = {};
    }
  }

  // User methods (delegated to UserSocketHandler)
  joinUser(userId) {
    this.handlers.user?.joinUser(userId);
  }

  userGoingOffline(userId) {
    this.handlers.user?.userGoingOffline(userId);
  }

  updateUserActivity(userId) {
    this.handlers.user?.updateUserActivity(userId);
  }

  // Chat methods (delegated to ChatSocketHandler)
  joinConversation(conversationId) {
    this.handlers.chat?.joinConversation(conversationId);
  }

  leaveConversation(conversationId) {
    this.handlers.chat?.leaveConversation(conversationId);
  }

  sendMessage(messageData) {
    this.handlers.chat?.sendMessage(messageData);
  }

  startTyping({ roomId, conversationId, userId, userName }) {
    this.handlers.chat?.startTyping({ roomId, conversationId, userId, userName });
  }

  stopTyping({ roomId, conversationId, userId }) {
    this.handlers.chat?.stopTyping({ roomId, conversationId, userId });
  }

  markMessagesAsRead({ messageIds, userId }) {
    this.handlers.chat?.markMessagesAsRead({ messageIds, userId });
  }

  addReaction({ messageId, reaction, userId }) {
    this.handlers.chat?.addReaction({ messageId, reaction, userId });
  }

  // Room methods (delegated to RoomSocketHandler)
  joinRoom(roomId) {
    this.handlers.room?.joinRoom(roomId);
  }

  leaveRoom(roomId) {
    this.handlers.room?.leaveRoom(roomId);
  }

  roomUpdated({ roomId, updateData }) {
    this.handlers.room?.roomUpdated({ roomId, updateData });
  }

  playerJoined({ roomId, player }) {
    this.handlers.room?.playerJoined({ roomId, player });
  }

  playerLeft({ roomId, playerId }) {
    this.handlers.room?.playerLeft({ roomId, playerId });
  }

  gameStarting({ roomId, countdown }) {
    this.handlers.room?.gameStarting({ roomId, countdown });
  }

  gameStarted({ roomId, gameId }) {
    this.handlers.room?.gameStarted({ roomId, gameId });
  }

  sendRoomInvitation({ recipientId, roomId, inviterName }) {
    this.handlers.room?.sendRoomInvitation({ recipientId, roomId, inviterName });
  }

  roomInvitationResponse({ roomId, accepted }) {
    this.handlers.room?.roomInvitationResponse({ roomId, accepted });
  }

  // Game methods (delegated to GameSocketHandler)
  joinGame(gameId) {
    this.handlers.game?.joinGame(gameId);
  }

  leaveGame(gameId) {
    this.handlers.game?.leaveGame(gameId);
  }

  pieceMoved({ gameId, pieceId, fromPosition, toPosition, playerId }) {
    this.handlers.game?.pieceMoved({ gameId, pieceId, fromPosition, toPosition, playerId });
  }

  piecePlacedCorrectly({ gameId, pieceId, position, playerId }) {
    this.handlers.game?.piecePlacedCorrectly({ gameId, pieceId, position, playerId });
  }

  gameProgress({ gameId, progress, playerId }) {
    this.handlers.game?.gameProgress({ gameId, progress, playerId });
  }

  hintUsed({ gameId, hintType, playerId }) {
    this.handlers.game?.hintUsed({ gameId, hintType, playerId });
  }

  gameCompleted({ gameId, completionTime, playerId }) {
    this.handlers.game?.gameCompleted({ gameId, completionTime, playerId });
  }

  cursorPosition({ gameId, x, y, playerId }) {
    this.handlers.game?.cursorPosition({ gameId, x, y, playerId });
  }

  turnStarted({ gameId, playerId, turnNumber }) {
    this.handlers.game?.turnStarted({ gameId, playerId, turnNumber });
  }

  turnEnded({ gameId, playerId, turnNumber }) {
    this.handlers.game?.turnEnded({ gameId, playerId, turnNumber });
  }

  gamePaused({ gameId, playerId }) {
    this.handlers.game?.gamePaused({ gameId, playerId });
  }

  gameResumed({ gameId, playerId }) {
    this.handlers.game?.gameResumed({ gameId, playerId });
  }

  joinAsSpectator({ gameId }) {
    this.handlers.game?.joinAsSpectator({ gameId });
  }

  requestGameState({ gameId }) {
    this.handlers.game?.requestGameState({ gameId });
  }

  // Event subscription methods for components
  onRoomEvent(event, callback) {
    this.handlers.room?.on(event, callback);
  }

  offRoomEvent(event, callback) {
    this.handlers.room?.off(event, callback);
  }

  onGameEvent(event, callback) {
    this.handlers.game?.on(event, callback);
  }

  offGameEvent(event, callback) {
    this.handlers.game?.off(event, callback);
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  getSocket() {
    return this.socket;
  }

  getHandler(type) {
    return this.handlers[type];
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService; 