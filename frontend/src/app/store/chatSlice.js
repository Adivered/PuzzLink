import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Keep only essential API calls - most data will come from socket events
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ content, conversationId, roomId, messageType = 'text' }, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const user = state.auth.user;
      
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      const senderId = user.id;
      const senderName = user.name;
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      
      // Add optimistic message immediately
      dispatch(addOptimisticMessage({
        tempId,
        content,
        senderId,
        senderName,
        conversationId,
        roomId,
        messageType
      }));
      
      return {
        content,
        conversationId,
        roomId,
        messageType,
        senderId,
        senderName,
        tempId
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

const initialState = {
  conversations: [],
  messages: {},
  activeConversation: null,
  activeRoom: null,
  roomDetails: {},
  isOpen: false,
  isMinimized: false,
  onlineUsers: [],
  unreadCounts: {},
  loading: {
    conversations: false,
    messages: false,
    sending: false
  },
  error: null,
  // Add socket-driven state
  isInitialized: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // UI state management
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
      if (state.isOpen) {
        state.isMinimized = false;
      }
    },
    
    minimizeChat: (state) => {
      state.isMinimized = true;
      state.isOpen = false;
    },
    
    openChat: (state) => {
      state.isOpen = true;
      state.isMinimized = false;
    },
    
    closeChat: (state) => {
      state.isOpen = false;
      state.isMinimized = false;
    },
    
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      // OPTIMIZATION: Don't clear activeRoom when switching to conversations
      // This allows users to stay in their room while browsing chat
    },
    
    // OPTIMIZATION: Enhanced room handling to prevent interference with room state
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
      state.activeConversation = null;
    },

    // OPTIMIZATION: New action for chat-only room switching (doesn't affect room state)
    setActiveChatRoom: (state, action) => {
      state.activeRoom = action.payload;
      state.activeConversation = null;
      // This action is specifically for chat navigation and doesn't trigger room switching
    },

    // Socket-driven data updates (replace API calls)
    initializeChatData: (state, action) => {
      const { conversations, roomDetails, messages } = action.payload;
      state.conversations = conversations || [];
      state.roomDetails = roomDetails || {};
      state.messages = messages || {};
      state.isInitialized = true;
      state.loading.conversations = false;
    },

    updateConversationsFromSocket: (state, action) => {
      state.conversations = action.payload;
    },

    updateMessagesFromSocket: (state, action) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },

    addConversationFromSocket: (state, action) => {
      const conversation = action.payload;
      const exists = state.conversations.find(c => c._id === conversation._id);
      if (!exists) {
        state.conversations.unshift(conversation);
      }
    },
    
    setRoomDetails: (state, action) => {
      const { roomId, roomData } = action.payload;
      state.roomDetails[roomId] = roomData;
    },
    
    setRoomUsers: (state, action) => {
      const { roomId, users, onlineCount } = action.payload;
      
      if (!state.roomDetails[roomId]) {
        state.roomDetails[roomId] = {};
      }
      
      state.roomDetails[roomId] = {
        ...state.roomDetails[roomId],
        onlineUsers: users,
        onlineCount: onlineCount || users?.length || 0
      };
    },

    updateRoomFromSocket: (state, action) => {
      const { roomId, roomData } = action.payload;
      
      if (!state.roomDetails[roomId]) {
        state.roomDetails[roomId] = {};
      }
      
      state.roomDetails[roomId] = {
        ...state.roomDetails[roomId],
        ...roomData
      };
    },

    removeRoomFromChat: (state, action) => {
      const { roomId } = action.payload;
      
      // Remove room from roomDetails
      if (state.roomDetails[roomId]) {
        delete state.roomDetails[roomId];
      }
      
      // Remove messages for this room
      if (state.messages[roomId]) {
        delete state.messages[roomId];
      }
      
      // Clear active room if it's the removed room
      if (state.activeRoom === roomId) {
        state.activeRoom = null;
      }
      
      // Remove unread count for this room
      if (state.unreadCounts[roomId]) {
        delete state.unreadCounts[roomId];
      }
    },
    
    addMessage: (state, action) => {
      const message = action.payload;
      const key = message.conversation || message.room;
      
      if (!state.messages[key]) {
        state.messages[key] = [];
      }
      
      // Check if message already exists to avoid duplicates
      const exists = state.messages[key].some(m => 
        m._id === message._id || (message.tempId && m.tempId === message.tempId)
      );
      
      if (!exists) {
        state.messages[key].push(message);
        // Sort messages by creation time
        state.messages[key].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
    },
    
    addOptimisticMessage: (state, action) => {
      const { tempId, content, senderId, senderName, conversationId, roomId, messageType = 'text' } = action.payload;
      const key = conversationId || roomId;
      
      if (!state.messages[key]) {
        state.messages[key] = [];
      }
      
      const optimisticMessage = {
        tempId,
        _id: tempId,
        content,
        sender: {
          _id: senderId,
          name: senderName
        },
        conversation: conversationId,
        room: roomId,
        messageType,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };
      
      state.messages[key].push(optimisticMessage);
    },
    
    markMessageAsSent: (state, action) => {
      const { tempId, messageId } = action.payload;
      
      for (const key in state.messages) {
        const messages = state.messages[key];
        const index = messages.findIndex(m => m.tempId === tempId);
        if (index !== -1) {
          state.messages[key][index] = {
            ...state.messages[key][index],
            _id: messageId,
            isOptimistic: false,
            isSent: true
          };
          break;
        }
      }
    },
    
    removeOptimisticMessage: (state, action) => {
      const { tempId, conversationId, roomId } = action.payload;
      const key = conversationId || roomId;
      
      if (state.messages[key]) {
        state.messages[key] = state.messages[key].filter(m => m.tempId !== tempId);
      }
    },
    
    updateConversationLastMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(c => c._id === conversationId);
      if (conversation) {
        conversation.lastMessage = message;
        conversation.updatedAt = message.createdAt;
      }
    },
    
    setUserOnline: (state, action) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    
    setUserOffline: (state, action) => {
      const userId = action.payload;
      state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
    },
    
    incrementUnreadCount: (state, action) => {
      const { conversationId, roomId } = action.payload;
      const key = conversationId || roomId;
      state.unreadCounts[key] = (state.unreadCounts[key] || 0) + 1;
    },
    
    resetUnreadCount: (state, action) => {
      const { conversationId, roomId } = action.payload;
      const key = conversationId || roomId;
      state.unreadCounts[key] = 0;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Send message (only for optimistic updates)
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sending = false;
        state.error = action.payload;
      });
  }
});

export const {
  toggleChat,
  minimizeChat,
  openChat,
  closeChat,
  setActiveConversation,
  setActiveRoom,
  setActiveChatRoom,
  initializeChatData,
  updateConversationsFromSocket,
  updateMessagesFromSocket,
  addConversationFromSocket,
  setRoomDetails,
  setRoomUsers,
  updateRoomFromSocket,
  removeRoomFromChat,
  addMessage,
  addOptimisticMessage,
  markMessageAsSent,
  removeOptimisticMessage,
  updateConversationLastMessage,
  setUserOnline,
  setUserOffline,
  incrementUnreadCount,
  resetUnreadCount,
  clearError
} = chatSlice.actions;

export default chatSlice.reducer; 