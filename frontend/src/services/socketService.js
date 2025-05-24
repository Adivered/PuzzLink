import { io } from 'socket.io-client';
import ChatSocketHandler from './socket/chatSocketHandler';
import UserSocketHandler from './socket/userSocketHandler';
import RoomSocketHandler from './socket/roomSocketHandler';
import GameSocketHandler from './socket/gameSocketHandler';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import store from '../store';
import { setActiveRoom, setRoomDetails } from '../store/chatSlice';
import { 
  setConnecting, 
  setConnected, 
  setDisconnected, 
  setConnectionError, 
  setCurrentUser, 
  setCurrentRoom,
  addSocketEvent
} from '../store/socketSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = {};
    this.connectionPromise = null;
    this.reconnectInterval = null;
    this.maxReconnectAttempts = 5;
    this._isConnecting = false;
    this.backoffDelay = 1000; // Start with 1 second
    this.maxBackoffDelay = 30000; // Max 30 seconds
    this.connectionAttempts = 0;
    this.lastConnectionAttempt = 0;
    this.minRetryInterval = 5000; // Minimum 5 seconds between attempts
  }

  get isConnecting() {
    return this._isConnecting || this.reconnectInterval !== null;
  }

  async connect() {
    // Prevent multiple connection attempts
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    const state = store.getState();
    
    // If already connected and socket is working, return
    if (state.socket.isConnected && this.socket?.connected) {
      return Promise.resolve();
    }

    // If already connecting, wait for current attempt
    if (this._isConnecting) {
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (!this._isConnecting) {
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    // Implement rate limiting to prevent spam
    const now = Date.now();
    const timeSinceLastAttempt = now - this.lastConnectionAttempt;
    if (timeSinceLastAttempt < this.minRetryInterval) {
      const waitTime = this.minRetryInterval - timeSinceLastAttempt;
      console.log(`⏳ Rate limiting connection attempts. Waiting ${waitTime}ms before retry...`);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.connect().then(resolve).catch(reject);
        }, waitTime);
      });
    }

    this.lastConnectionAttempt = now;
    this.connectionAttempts++;

    console.log(`🔌 Connecting to socket server... (attempt ${this.connectionAttempts})`);
    this._isConnecting = true;
    store.dispatch(setConnecting());

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
          timeout: 10000,
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          console.log('✅ Connected to socket server');
          this._isConnecting = false;
          // Reset connection tracking on successful connection
          this.connectionAttempts = 0;
          this.backoffDelay = 1000;
          store.dispatch(setConnected({ timestamp: new Date().toISOString() }));
          this.setupHandlers();
          this.connectionPromise = null;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('❌ Disconnected from server:', reason);
          this._isConnecting = false;
          store.dispatch(setDisconnected({ error: reason }));
          this.connectionPromise = null;
          
          // Auto-reconnect for certain disconnect reasons
          if (reason !== 'io server disconnect' && reason !== 'io client disconnect') {
            this.attemptReconnect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error(`❌ Connection error (attempt ${this.connectionAttempts}):`, error.message);
          this._isConnecting = false;
          store.dispatch(setConnectionError(error.message));
          this.connectionPromise = null;
          
          // Don't immediately reject - schedule a retry with backoff
          if (this.connectionAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
            // Don't reject here - let the scheduled reconnect handle it
          } else {
            console.error('❌ Max connection attempts reached. Giving up.');
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts: ${error.message}`));
          }
        });

      } catch (error) {
        this._isConnecting = false;
        store.dispatch(setConnectionError(error.message));
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  setupHandlers() {
    if (!this.socket) return;

    // Clean up existing handlers
    this.destroyHandlers();

    // Initialize handlers
    this.handlers = {
      chat: new ChatSocketHandler(this.socket),
      user: new UserSocketHandler(this.socket),
      room: new RoomSocketHandler(this.socket),
      game: new GameSocketHandler(this.socket)
    };
    
    console.log('🔧 Socket handlers initialized');
  }

  scheduleReconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }

    // Calculate exponential backoff delay
    const delay = Math.min(this.backoffDelay, this.maxBackoffDelay);
    this.backoffDelay = Math.min(this.backoffDelay * 2, this.maxBackoffDelay);
    
    console.log(`🔄 Scheduling reconnection in ${delay}ms... (attempt ${this.connectionAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null;
      this.connect().catch((error) => {
        console.error('Scheduled reconnection failed:', error.message);
      });
    }, delay);
  }

  attemptReconnect() {
    // Reset connection attempts counter for disconnect-triggered reconnects
    this.connectionAttempts = 0;
    this.scheduleReconnect();
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    this._isConnecting = false;
    this.connectionPromise = null;
    
    // Reset connection tracking
    this.connectionAttempts = 0;
    this.backoffDelay = 1000;

    if (this.socket) {
      console.log('🔌 Disconnecting from socket server');
      this.destroyHandlers();
      this.socket.disconnect();
      this.socket = null;
    }

    store.dispatch(setDisconnected());
  }

  get isConnected() {
    const state = store.getState();
    return state.socket.isConnected && this.socket?.connected;
  }

  // Enhanced authentication method that sets up user for Home chat
  authenticateUser(userId) {
    if (!this.isConnected || !userId) {
      console.warn('⚠️ Cannot authenticate: not connected or no userId');
      return;
    }
    
    console.log('🔐 Authenticating user for chat:', userId);
    
    store.dispatch(setCurrentUser(userId));
    
    // Join user room - this will automatically join Home room chat on backend
    this.joinUser(userId);
    
    // Get user's Home room from state and set as active
    const state = store.getState();
    const homeRoomId = state.auth.user?.homeRoomId;
    
    if (homeRoomId) {
      console.log('🏠 Setting Home room as active chat:', homeRoomId);
      store.dispatch(setActiveRoom(homeRoomId));
      
      // Ensure Home room details are available for the chat UI
      store.dispatch(setRoomDetails({
        roomId: homeRoomId,
        roomData: {
          name: 'Home',
          description: 'Global community chat',
          isHomeRoom: true
        }
      }));
      
      // Request room users for accurate online count
      this.getRoomUsers(homeRoomId);
      
      console.log('✅ Home chat ready for user');
    }
  }

  // Unified room switching method
  switchRoom(newRoomId, leaveRoomId = null) {
    if (!this.isConnected) return;
    
    const state = store.getState();
    const currentUserId = state.socket.currentUserId;
    
    if (!currentUserId) return;
    
    this.socket.emit(SOCKET_EVENTS.SWITCH_ROOM, {
      userId: currentUserId,
      newRoomId,
      leaveRoomId: leaveRoomId || state.socket.currentRoomId
    });
    
    store.dispatch(setCurrentRoom(newRoomId));
    store.dispatch(setActiveRoom(newRoomId));
  }

  // Delegate methods to handlers
  joinUser(userId) {
    this.handlers.user?.joinUser(userId);
  }

  joinConversation(conversationId) {
    if (!this.isConnected) {
      console.warn('⚠️ Cannot join conversation: socket not connected');
      return;
    }
    this.handlers.chat?.joinConversation(conversationId);
  }

  leaveConversation(conversationId) {
    if (!this.isConnected) {
      console.warn('⚠️ Cannot leave conversation: socket not connected');
      return;
    }
    this.handlers.chat?.leaveConversation(conversationId);
  }

  sendMessage(messageData) {
    if (!this.isConnected) {
      console.error('❌ Cannot send message: not connected to server');
      return null;
    }
    
    return this.handlers.chat?.sendMessage(messageData);
  }

  startTyping(data) {
    if (!this.isConnected) return;
    this.handlers.chat?.startTyping(data);
  }

  stopTyping(data) {
    if (!this.isConnected) return;
    this.handlers.chat?.stopTyping(data);
  }

  joinRoom(roomId) {
    if (!this.isConnected) {
      console.warn('⚠️ Cannot join room: socket not connected');
      return;
    }
    this.handlers.room?.joinRoom(roomId);
  }

  leaveRoom(roomId) {
    if (!this.isConnected) {
      console.warn('⚠️ Cannot leave room: socket not connected');
      return;
    }
    this.handlers.room?.leaveRoom(roomId);
  }

  getRoomUsers(roomId) {
    if (!this.isConnected) {
      console.warn('⚠️ Cannot get room users: socket not connected');
      return;
    }
    this.handlers.room?.getRoomUsers(roomId);
  }

  joinGame(gameId) {
    this.handlers.game?.joinGame(gameId);
  }

  leaveGame(gameId) {
    this.handlers.game?.leaveGame(gameId);
  }

  // Cleanup method
  destroyHandlers() {
    Object.values(this.handlers).forEach(handler => {
      if (handler && typeof handler.destroy === 'function') {
        handler.destroy();
      }
    });
    this.handlers = {};
  }
}

// Export singleton instance
const socketService = new SocketService();

// Make it available globally for debugging in development
if (process.env.NODE_ENV === 'development') {
  window.socketService = socketService;
}

export default socketService; 