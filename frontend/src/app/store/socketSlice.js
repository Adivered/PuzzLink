import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';

// Socket instance (singleton)
let socketInstance = null;

// Async thunks for socket operations
export const connectSocket = createAsyncThunk(
  'socket/connect',
  async (_, { dispatch, getState }) => {
    const state = getState();
    
    if (state.socket.isConnected && socketInstance?.connected) {
      return { alreadyConnected: true };
    }

    if (socketInstance) {
      socketInstance.disconnect();
    }

    socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      timeout: 10000,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      maxHttpBufferSize: 1e6
    });

    return new Promise((resolve, reject) => {
      socketInstance.on('connect', () => {
        dispatch(setupSocketListeners());
        resolve({ timestamp: new Date().toISOString() });
      });

      socketInstance.on('connect_error', (error) => {
        reject(error.message || 'Connection failed');
      });

      setTimeout(() => {
        reject('Connection timeout');
      }, 10000);
    });
  }
);

export const disconnectSocket = createAsyncThunk(
  'socket/disconnect',
  async () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return {};
  }
);

export const joinRoom = createAsyncThunk(
  'socket/joinRoom',
  async (roomId, { getState }) => {
    if (socketInstance?.connected) {
      socketInstance.emit('join_room', { roomId });
      return { roomId };
    }
    throw new Error('Socket not connected');
  }
);

export const leaveRoom = createAsyncThunk(
  'socket/leaveRoom',
  async (roomId) => {
    if (socketInstance?.connected) {
      socketInstance.emit('leave_room', { roomId });
      return { roomId };
    }
    throw new Error('Socket not connected');
  }
);

export const sendMessage = createAsyncThunk(
  'socket/sendMessage',
  async (messageData) => {
    if (socketInstance?.connected) {
      socketInstance.emit('send_message', messageData);
      return messageData;
    }
    throw new Error('Socket not connected');
  }
);

export const sendRoomInvitation = createAsyncThunk(
  'socket/sendRoomInvitation',
  async (invitationData) => {
    if (socketInstance?.connected) {
      socketInstance.emit('room_invitation', invitationData);
      return invitationData;
    }
    throw new Error('Socket not connected');
  }
);

export const joinHomeRoom = createAsyncThunk(
  'socket/joinHomeRoom',
  async (homeRoomId, { getState, dispatch }) => {
    if (socketInstance?.connected && homeRoomId) {
      // Use switch_room to join Home room
      socketInstance.emit('switch_room', { 
        userId: getState().auth.user?.id,
        newRoomId: homeRoomId 
      });
      
      // Update current room in socket state
      dispatch(setCurrentRoom(homeRoomId));
      
      return { roomId: homeRoomId };
    }
    throw new Error('Socket not connected or no home room ID');
  }
);

export const switchRoom = createAsyncThunk(
  'socket/switchRoom',
  async ({ newRoomId, leaveRoomId }, { getState, dispatch }) => {
    return new Promise((resolve, reject) => {
      if (!socketInstance?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      
      const userId = getState().auth.user?.id;
      if (!userId) {
        reject(new Error('User not authenticated'));
        return;
      }
      
      // OPTIMIZATION: Set up one-time listeners for room switch confirmation
      const handleRoomDataUpdate = (data) => {
        if (data.roomId === newRoomId) {
          // Remove the listener once we get the expected room data
          socketInstance.off('room_data_update', handleRoomDataUpdate);
          
          // Update current room in socket state
          dispatch(setCurrentRoom(newRoomId));
          
          console.log(`✅ Successfully switched to room ${newRoomId}`);
          resolve({ newRoomId, leaveRoomId });
        }
      };
      
      const handleError = (error) => {
        socketInstance.off('room_data_update', handleRoomDataUpdate);
        socketInstance.off('error', handleError);
        reject(new Error(error.message || 'Failed to switch room'));
      };
      
      // Set up temporary listeners
      socketInstance.on('room_data_update', handleRoomDataUpdate);
      socketInstance.on('error', handleError);
      
      // OPTIMIZATION: Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        socketInstance.off('room_data_update', handleRoomDataUpdate);
        socketInstance.off('error', handleError);
        reject(new Error('Room switch timeout'));
      }, 10000); // 10 second timeout
      
      // Emit the room switch event
      socketInstance.emit('switch_room', { 
        userId,
        newRoomId,
        leaveRoomId 
      });
      
      // Clear timeout when promise resolves/rejects
      Promise.race([
        new Promise(resolve => setTimeout(resolve, 10000))
      ]).then(() => {
        clearTimeout(timeout);
      });
    });
  }
);

const initialState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  currentUserId: null,
  currentRoomId: null,
  lastConnectionTime: null,
  onlineUsers: [],
  pendingInvitations: [],
  sentInvitations: [],
  roomUsers: {},
  loading: {
    connecting: false,
    joiningRoom: false,
    sendingMessage: false,
  },
  error: null
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    // Setup socket event listeners
    setupSocketListeners: (state) => {
      if (!socketInstance) return;

      // Note: Socket event listeners should NOT directly mutate Redux state
      // All socket events are handled by useSocketEventHandlers hook
      // This just sets up the basic connection listeners

      socketInstance.on('disconnect', (reason) => {
        // Only handle disconnect here as it's a connection-level event
        state.isConnected = false;
        state.connectionError = reason;
        state.currentUserId = null;
        state.currentRoomId = null;
        state.pendingInvitations = [];
        state.sentInvitations = [];
        state.onlineUsers = [];
        state.roomUsers = {};
      });
    },

    // Connection state management
    setCurrentUser: (state, action) => {
      state.currentUserId = action.payload;
    },

    setCurrentRoom: (state, action) => {
      state.currentRoomId = action.payload;
    },

    // Online users management
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    // Invitation management
    addPendingInvitation: (state, action) => {
      console.log('🔔 Redux: addPendingInvitation called with:', action.payload);
      
      const invitation = {
        id: `${action.payload.roomId}_${action.payload.inviterName}_${Date.now()}`,
        roomId: action.payload.roomId,
        inviterName: action.payload.inviterName,
        timestamp: action.payload.timestamp || new Date().toISOString(),
        status: 'pending'
      };
      
      console.log('🔔 Redux: Created invitation object:', invitation);
      
      // Check if invitation already exists
      const existingIndex = state.pendingInvitations.findIndex(
        inv => inv.roomId === invitation.roomId && inv.inviterName === invitation.inviterName
      );
      
      if (existingIndex >= 0) {
        console.log('🔔 Redux: Updating existing invitation at index:', existingIndex);
        // Update existing invitation
        state.pendingInvitations[existingIndex] = invitation;
      } else {
        console.log('🔔 Redux: Adding new invitation. Current count:', state.pendingInvitations.length);
        // Add new invitation
        state.pendingInvitations.push(invitation);
      }
      
      console.log('🔔 Redux: Final pending invitations:', state.pendingInvitations);
    },

    removePendingInvitation: (state, action) => {
      const { roomId, inviterName } = action.payload;
      state.pendingInvitations = state.pendingInvitations.filter(
        inv => !(inv.roomId === roomId && inv.inviterName === inviterName)
      );
    },

    updateInvitationStatus: (state, action) => {
      const { roomId, inviterName, status } = action.payload;
      const invitation = state.pendingInvitations.find(
        inv => inv.roomId === roomId && inv.inviterName === inviterName
      );
      if (invitation) {
        invitation.status = status;
      }
    },

    clearAllInvitations: (state) => {
      state.pendingInvitations = [];
      state.sentInvitations = [];
    },

    // Room users management
    setRoomUsers: (state, action) => {
      const { roomId, users } = action.payload;
      state.roomUsers[roomId] = users;
    },

    // Reset state
    resetSocketState: () => initialState,

    // Error handling
    clearError: (state) => {
      state.error = null;
      state.connectionError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Connect socket
      .addCase(connectSocket.pending, (state) => {
        state.isConnecting = true;
        state.loading.connecting = true;
        state.connectionError = null;
      })
      .addCase(connectSocket.fulfilled, (state, action) => {
        state.isConnected = true;
        state.isConnecting = false;
        state.loading.connecting = false;
        state.connectionError = null;
        state.lastConnectionTime = action.payload.timestamp || new Date().toISOString();
      })
      .addCase(connectSocket.rejected, (state, action) => {
        state.isConnected = false;
        state.isConnecting = false;
        state.loading.connecting = false;
        state.connectionError = action.payload;
      })
      
      // Disconnect socket
      .addCase(disconnectSocket.fulfilled, (state) => {
        state.isConnected = false;
        state.isConnecting = false;
        state.connectionError = null;
        state.currentUserId = null;
        state.currentRoomId = null;
        state.pendingInvitations = [];
        state.sentInvitations = [];
        state.onlineUsers = [];
        state.roomUsers = {};
      })
      
      // Join room
      .addCase(joinRoom.pending, (state) => {
        state.loading.joiningRoom = true;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.loading.joiningRoom = false;
        state.currentRoomId = action.payload.roomId;
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loading.joiningRoom = false;
        state.error = action.error.message;
      })
      
      // Leave room
      .addCase(leaveRoom.fulfilled, (state) => {
        state.currentRoomId = null;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.loading.sendingMessage = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sendingMessage = false;
        state.error = action.error.message;
      })
      
      // Send room invitation
      .addCase(sendRoomInvitation.fulfilled, (state, action) => {
        const invitation = {
          id: `${action.payload.roomId}_${action.payload.recipientId}_${Date.now()}`,
          roomId: action.payload.roomId,
          recipientId: action.payload.recipientId,
          recipientName: action.payload.recipientName,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        
        const existingIndex = state.sentInvitations.findIndex(
          inv => inv.roomId === invitation.roomId && inv.recipientId === invitation.recipientId
        );
        
        if (existingIndex >= 0) {
          state.sentInvitations[existingIndex] = invitation;
        } else {
          state.sentInvitations.push(invitation);
        }
      })
      
      // Join Home room
      .addCase(joinHomeRoom.pending, (state) => {
        state.loading.joiningRoom = true;
      })
      .addCase(joinHomeRoom.fulfilled, (state, action) => {
        state.loading.joiningRoom = false;
        state.currentRoomId = action.payload.roomId;
      })
      .addCase(joinHomeRoom.rejected, (state, action) => {
        state.loading.joiningRoom = false;
        state.error = action.error.message;
      })
      
      // Switch room
      .addCase(switchRoom.pending, (state) => {
        state.loading.joiningRoom = true;
      })
      .addCase(switchRoom.fulfilled, (state, action) => {
        state.loading.joiningRoom = false;
        state.currentRoomId = action.payload.newRoomId;
      })
      .addCase(switchRoom.rejected, (state, action) => {
        state.loading.joiningRoom = false;
        state.error = action.error.message;
      });
  }
});

// Export socket instance for direct access when needed
export const getSocketInstance = () => socketInstance;

// Utility functions for socket operations
export const emitSocketEvent = (event, data) => {
  if (socketInstance?.connected) {
    socketInstance.emit(event, data);
    return true;
  }
  return false;
};

export const { 
  setupSocketListeners, 
  setCurrentUser, 
  setCurrentRoom, 
  setOnlineUsers, 
  addPendingInvitation, 
  removePendingInvitation, 
  updateInvitationStatus, 
  clearAllInvitations, 
  setRoomUsers, 
  resetSocketState, 
  clearError 
} = socketSlice.actions;

export default socketSlice.reducer; 