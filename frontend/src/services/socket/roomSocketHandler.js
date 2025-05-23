import { SOCKET_EVENTS } from '../../constants/socketEvents';

class RoomSocketHandler {
  constructor(socket) {
    this.socket = socket;
    this.initializeListeners();
    this.eventCallbacks = new Map();
  }

  initializeListeners() {
    // Room membership events
    this.socket.on(SOCKET_EVENTS.USER_JOINED_ROOM, (data) => {
      this.notifyCallbacks('userJoinedRoom', data);
    });

    this.socket.on(SOCKET_EVENTS.USER_LEFT_ROOM, (data) => {
      this.notifyCallbacks('userLeftRoom', data);
    });

    // Room updates
    this.socket.on(SOCKET_EVENTS.ROOM_UPDATE, (data) => {
      this.notifyCallbacks('roomUpdate', data);
    });

    // Player events
    this.socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
      this.notifyCallbacks('playerJoined', data);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_LEFT, (data) => {
      this.notifyCallbacks('playerLeft', data);
    });

    // Game events
    this.socket.on(SOCKET_EVENTS.GAME_STARTING, (data) => {
      this.notifyCallbacks('gameStarting', data);
    });

    this.socket.on(SOCKET_EVENTS.GAME_STARTED, (data) => {
      this.notifyCallbacks('gameStarted', data);
    });

    // Invitation events
    this.socket.on(SOCKET_EVENTS.ROOM_INVITATION, (data) => {
      this.notifyCallbacks('roomInvitation', data);
    });

    this.socket.on(SOCKET_EVENTS.INVITATION_ACCEPTED, (data) => {
      this.notifyCallbacks('invitationAccepted', data);
    });
  }

  // Event callback system for components to subscribe to room events
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
          console.error(`Error in room event callback for ${event}:`, error);
        }
      });
    }
  }

  // Room-specific emit methods
  joinRoom(roomId) {
    this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId);
  }

  leaveRoom(roomId) {
    this.socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId);
  }

  roomUpdated({ roomId, updateData }) {
    this.socket.emit(SOCKET_EVENTS.ROOM_UPDATED, { roomId, updateData });
  }

  playerJoined({ roomId, player }) {
    this.socket.emit(SOCKET_EVENTS.PLAYER_JOINED, { roomId, player });
  }

  playerLeft({ roomId, playerId }) {
    this.socket.emit(SOCKET_EVENTS.PLAYER_LEFT, { roomId, playerId });
  }

  gameStarting({ roomId, countdown }) {
    this.socket.emit(SOCKET_EVENTS.GAME_STARTING, { roomId, countdown });
  }

  gameStarted({ roomId, gameId }) {
    this.socket.emit(SOCKET_EVENTS.GAME_STARTED, { roomId, gameId });
  }

  sendRoomInvitation({ recipientId, roomId, inviterName }) {
    this.socket.emit(SOCKET_EVENTS.SEND_ROOM_INVITATION, { recipientId, roomId, inviterName });
  }

  roomInvitationResponse({ roomId, accepted }) {
    this.socket.emit(SOCKET_EVENTS.ROOM_INVITATION_RESPONSE, { roomId, accepted });
  }

  // Cleanup method
  destroy() {
    // Remove all listeners
    this.socket.off(SOCKET_EVENTS.USER_JOINED_ROOM);
    this.socket.off(SOCKET_EVENTS.USER_LEFT_ROOM);
    this.socket.off(SOCKET_EVENTS.ROOM_UPDATE);
    this.socket.off(SOCKET_EVENTS.PLAYER_JOINED);
    this.socket.off(SOCKET_EVENTS.PLAYER_LEFT);
    this.socket.off(SOCKET_EVENTS.GAME_STARTING);
    this.socket.off(SOCKET_EVENTS.GAME_STARTED);
    this.socket.off(SOCKET_EVENTS.ROOM_INVITATION);
    this.socket.off(SOCKET_EVENTS.INVITATION_ACCEPTED);
    
    // Clear all callbacks
    this.eventCallbacks.clear();
  }
}

export default RoomSocketHandler; 