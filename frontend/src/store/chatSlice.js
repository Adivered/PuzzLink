import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for API calls
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/chat/conversations');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, roomId, page = 1 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (conversationId) params.append('conversationId', conversationId);
      if (roomId) params.append('roomId', roomId);
      params.append('page', page);

      const response = await axios.get(`/api/chat/messages?${params}`);
      return { 
        messages: response.data.data, 
        conversationId, 
        roomId,
        page 
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ content, conversationId, roomId, messageType = 'text' }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/chat/messages', {
        content,
        conversationId,
        roomId,
        messageType
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async ({ participantId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/chat/conversations', {
        participantId
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation');
    }
  }
);

const initialState = {
  conversations: [],
  messages: {},
  activeConversation: null,
  activeRoom: null,
  isOpen: false,
  isMinimized: false,
  typingUsers: {},
  onlineUsers: [],
  unreadCounts: {},
  loading: {
    conversations: false,
    messages: false,
    sending: false
  },
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
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
      state.activeRoom = null;
    },
    
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
      state.activeConversation = null;
    },
    
    addMessage: (state, action) => {
      const message = action.payload;
      const key = message.conversation || message.room;
      
      if (!state.messages[key]) {
        state.messages[key] = [];
      }
      
      // Check if message already exists to avoid duplicates
      const exists = state.messages[key].some(m => m._id === message._id);
      if (!exists) {
        state.messages[key].push(message);
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
    
    setTypingUser: (state, action) => {
      const { roomId, conversationId, userId, userName } = action.payload;
      const key = roomId || conversationId;
      
      if (!state.typingUsers[key]) {
        state.typingUsers[key] = [];
      }
      
      const existing = state.typingUsers[key].find(u => u.userId === userId);
      if (!existing) {
        state.typingUsers[key].push({ userId, userName });
      }
    },
    
    removeTypingUser: (state, action) => {
      const { roomId, conversationId, userId } = action.payload;
      const key = roomId || conversationId;
      
      if (state.typingUsers[key]) {
        state.typingUsers[key] = state.typingUsers[key].filter(u => u.userId !== userId);
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
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading.conversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading.conversations = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading.conversations = false;
        state.error = action.payload;
      })
      
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading.messages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        const { messages, conversationId, roomId, page } = action.payload;
        const key = conversationId || roomId;
        
        if (page === 1) {
          state.messages[key] = messages;
        } else {
          // Prepend older messages for pagination
          state.messages[key] = [...messages, ...(state.messages[key] || [])];
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.error = action.payload;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
        // Message will be added via socket event or addMessage action
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sending = false;
        state.error = action.payload;
      })
      
      // Create conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const conversation = action.payload;
        const exists = state.conversations.find(c => c._id === conversation._id);
        if (!exists) {
          state.conversations.unshift(conversation);
        }
        state.activeConversation = conversation._id;
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
  addMessage,
  updateConversationLastMessage,
  setTypingUser,
  removeTypingUser,
  setUserOnline,
  setUserOffline,
  incrementUnreadCount,
  resetUnreadCount,
  clearError
} = chatSlice.actions;

export default chatSlice.reducer; 