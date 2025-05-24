import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  currentUserId: null,
  currentRoomId: null,
  reconnectAttempts: 0,
  lastConnectionTime: null,
  onlineUsers: [],
  socketEvents: [], // For debugging
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    // Connection state management
    setConnecting: (state) => {
      state.isConnecting = true;
      state.connectionError = null;
    },
    
    setConnected: (state, action) => {
      state.isConnected = true;
      state.isConnecting = false;
      state.connectionError = null;
      state.reconnectAttempts = 0;
      state.lastConnectionTime = action.payload.timestamp || new Date().toISOString();
    },
    
    setDisconnected: (state, action) => {
      state.isConnected = false;
      state.isConnecting = false;
      state.connectionError = action.payload?.error || null;
      state.currentUserId = null;
      state.currentRoomId = null;
    },
    
    setConnectionError: (state, action) => {
      state.isConnected = false;
      state.isConnecting = false;
      state.connectionError = action.payload;
      state.reconnectAttempts += 1;
    },
    
    // User management
    setCurrentUser: (state, action) => {
      state.currentUserId = action.payload;
    },
    
    setCurrentRoom: (state, action) => {
      state.currentRoomId = action.payload;
    },
    
    // Online users management
    addOnlineUser: (state, action) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    
    removeOnlineUser: (state, action) => {
      const userId = action.payload;
      state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
    },
    
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    
    // Event tracking for debugging
    addSocketEvent: (state, action) => {
      const event = {
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      state.socketEvents.push(event);
      
      // Keep only last 50 events for memory management
      if (state.socketEvents.length > 50) {
        state.socketEvents = state.socketEvents.slice(-50);
      }
    },
    
    clearSocketEvents: (state) => {
      state.socketEvents = [];
    },
    
    // Reset state
    resetSocketState: (state) => {
      return { ...initialState };
    }
  }
});

export const {
  setConnecting,
  setConnected,
  setDisconnected,
  setConnectionError,
  setCurrentUser,
  setCurrentRoom,
  addOnlineUser,
  removeOnlineUser,
  setOnlineUsers,
  addSocketEvent,
  clearSocketEvents,
  resetSocketState
} = socketSlice.actions;

export default socketSlice.reducer; 