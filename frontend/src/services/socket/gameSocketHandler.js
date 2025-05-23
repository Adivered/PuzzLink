import { SOCKET_EVENTS } from '../../constants/socketEvents';

class GameSocketHandler {
  constructor(socket) {
    this.socket = socket;
    this.initializeListeners();
    this.eventCallbacks = new Map();
  }

  initializeListeners() {
    // Player events
    this.socket.on(SOCKET_EVENTS.PLAYER_JOINED_GAME, (data) => {
      this.notifyCallbacks('playerJoinedGame', data);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_LEFT_GAME, (data) => {
      this.notifyCallbacks('playerLeftGame', data);
    });

    // Puzzle events
    this.socket.on(SOCKET_EVENTS.PIECE_MOVED, (data) => {
      this.notifyCallbacks('pieceMoved', data);
    });

    this.socket.on(SOCKET_EVENTS.PIECE_PLACED_CORRECTLY, (data) => {
      this.notifyCallbacks('piecePlacedCorrectly', data);
    });

    // Game progress
    this.socket.on(SOCKET_EVENTS.GAME_PROGRESS_UPDATE, (data) => {
      this.notifyCallbacks('gameProgressUpdate', data);
    });

    this.socket.on(SOCKET_EVENTS.HINT_USED, (data) => {
      this.notifyCallbacks('hintUsed', data);
    });

    this.socket.on(SOCKET_EVENTS.GAME_COMPLETED, (data) => {
      this.notifyCallbacks('gameCompleted', data);
    });

    // Collaborative features
    this.socket.on(SOCKET_EVENTS.PLAYER_CURSOR, (data) => {
      this.notifyCallbacks('playerCursor', data);
    });

    // Turn-based events
    this.socket.on(SOCKET_EVENTS.TURN_STARTED, (data) => {
      this.notifyCallbacks('turnStarted', data);
    });

    this.socket.on(SOCKET_EVENTS.TURN_ENDED, (data) => {
      this.notifyCallbacks('turnEnded', data);
    });

    // Game state events
    this.socket.on(SOCKET_EVENTS.GAME_PAUSED, (data) => {
      this.notifyCallbacks('gamePaused', data);
    });

    this.socket.on(SOCKET_EVENTS.GAME_RESUMED, (data) => {
      this.notifyCallbacks('gameResumed', data);
    });

    this.socket.on(SOCKET_EVENTS.GAME_STATE_SYNC, (data) => {
      this.notifyCallbacks('gameStateSync', data);
    });
  }

  // Event callback system for components to subscribe to game events
  on(event, callback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    this.eventCallbacks.get(event).add(callback);
  }

  off(event, callback) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).delete(callback);
    }
  }

  notifyCallbacks(event, data) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in game event callback for ${event}:`, error);
        }
      });
    }
  }

  // Game-specific emit methods
  joinGame(gameId) {
    this.socket.emit(SOCKET_EVENTS.JOIN_GAME, gameId);
  }

  leaveGame(gameId) {
    this.socket.emit(SOCKET_EVENTS.LEAVE_GAME, gameId);
  }

  pieceMoved({ gameId, pieceId, fromPosition, toPosition, playerId }) {
    this.socket.emit(SOCKET_EVENTS.PIECE_MOVED, { gameId, pieceId, fromPosition, toPosition, playerId });
  }

  piecePlacedCorrectly({ gameId, pieceId, position, playerId }) {
    this.socket.emit(SOCKET_EVENTS.PIECE_PLACED_CORRECTLY, { gameId, pieceId, position, playerId });
  }

  gameProgress({ gameId, progress, playerId }) {
    this.socket.emit(SOCKET_EVENTS.GAME_PROGRESS, { gameId, progress, playerId });
  }

  hintUsed({ gameId, hintType, playerId }) {
    this.socket.emit(SOCKET_EVENTS.HINT_USED, { gameId, hintType, playerId });
  }

  gameCompleted({ gameId, completionTime, playerId }) {
    this.socket.emit(SOCKET_EVENTS.GAME_COMPLETED, { gameId, completionTime, playerId });
  }

  cursorPosition({ gameId, x, y, playerId }) {
    this.socket.emit(SOCKET_EVENTS.CURSOR_POSITION, { gameId, x, y, playerId });
  }

  turnStarted({ gameId, playerId, turnNumber }) {
    this.socket.emit(SOCKET_EVENTS.TURN_STARTED, { gameId, playerId, turnNumber });
  }

  turnEnded({ gameId, playerId, turnNumber }) {
    this.socket.emit(SOCKET_EVENTS.TURN_ENDED, { gameId, playerId, turnNumber });
  }

  gamePaused({ gameId, playerId }) {
    this.socket.emit(SOCKET_EVENTS.GAME_PAUSED, { gameId, playerId });
  }

  gameResumed({ gameId, playerId }) {
    this.socket.emit(SOCKET_EVENTS.GAME_RESUMED, { gameId, playerId });
  }

  joinAsSpectator({ gameId }) {
    this.socket.emit(SOCKET_EVENTS.JOIN_AS_SPECTATOR, { gameId });
  }

  requestGameState({ gameId }) {
    this.socket.emit(SOCKET_EVENTS.REQUEST_GAME_STATE, { gameId });
  }

  // Cleanup method
  destroy() {
    // Remove all listeners
    this.socket.off(SOCKET_EVENTS.PLAYER_JOINED_GAME);
    this.socket.off(SOCKET_EVENTS.PLAYER_LEFT_GAME);
    this.socket.off(SOCKET_EVENTS.PIECE_MOVED);
    this.socket.off(SOCKET_EVENTS.PIECE_PLACED_CORRECTLY);
    this.socket.off(SOCKET_EVENTS.GAME_PROGRESS_UPDATE);
    this.socket.off(SOCKET_EVENTS.HINT_USED);
    this.socket.off(SOCKET_EVENTS.GAME_COMPLETED);
    this.socket.off(SOCKET_EVENTS.PLAYER_CURSOR);
    this.socket.off(SOCKET_EVENTS.TURN_STARTED);
    this.socket.off(SOCKET_EVENTS.TURN_ENDED);
    this.socket.off(SOCKET_EVENTS.GAME_PAUSED);
    this.socket.off(SOCKET_EVENTS.GAME_RESUMED);
    this.socket.off(SOCKET_EVENTS.GAME_STATE_SYNC);
    
    // Clear all callbacks
    this.eventCallbacks.clear();
  }
}

export default GameSocketHandler; 