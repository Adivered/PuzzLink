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

export const fetchRoomForChat = createAsyncThunk(
  'chat/fetchRoomForChat',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/rooms/${roomId}`);
      return { roomId, roomData: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch room');
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
  roomDetails: {},
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
    
    setRoomDetails: (state, action) => {
      const { roomId, roomData } = action.payload;
      state.roomDetails[roomId] = roomData;
    },
    
    setRoomUsers: (state, action) => {
      const { roomId, users, onlineCount } = action.payload;
      
      // Update room details with actual online count and user list
      if (!state.roomDetails[roomId]) {
        state.roomDetails[roomId] = {};
      }
      
      state.roomDetails[roomId] = {
        ...state.roomDetails[roomId],
        onlineUsers: users,
        onlineCount: onlineCount
      };
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
    
    // Add optimistic message (temporary message while sending)
    addOptimisticMessage: (state, action) => {
      const { tempId, content, senderId, senderName, conversationId, roomId, messageType = 'text' } = action.payload;
      const key = conversationId || roomId;
      
      if (!state.messages[key]) {
        state.messages[key] = [];
      }
      
      const optimisticMessage = {
        tempId,
        _id: tempId, // Use tempId as _id temporarily
        content,
        sender: {
          _id: senderId,
          name: senderName
        },
        conversation: conversationId,
        room: roomId,
        messageType,
        createdAt: new Date().toISOString(),
        isOptimistic: true // Flag to identify optimistic messages
      };
      
      state.messages[key].push(optimisticMessage);
    },
    
    // Replace optimistic message with real message from server
    replaceOptimisticMessage: (state, action) => {
      const { tempId, realMessage } = action.payload;
      const key = realMessage.conversation || realMessage.room;
      
      if (state.messages[key]) {
        const index = state.messages[key].findIndex(m => m.tempId === tempId);
        if (index !== -1) {
          state.messages[key][index] = realMessage;
        }
      }
    },
    
    // Mark optimistic message as sent (simple status update)
    markMessageAsSent: (state, action) => {
      const { tempId, messageId } = action.payload;
      console.log('🔄 markMessageAsSent called with:', { tempId, messageId });
      
      // Find the message across all conversations/rooms
      for (const key in state.messages) {
        const messages = state.messages[key];
        const index = messages.findIndex(m => m.tempId === tempId);
        if (index !== -1) {
          console.log('✅ Found message to mark as sent:', messages[index]);
          // Update the message status and add real message ID
          state.messages[key][index] = {
            ...state.messages[key][index],
            _id: messageId,
            isOptimistic: false,
            isSent: true
          };
          console.log('📤 Updated message:', state.messages[key][index]);
          break;
        }
      }
    },
    
    // Remove failed optimistic message
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
          // For first page, merge with existing messages intelligently
          const existingMessages = state.messages[key] || [];
          const newMessages = messages || [];
          
          // Keep optimistic messages and merge with fetched messages
          const optimisticMessages = existingMessages.filter(m => m.isOptimistic);
          const nonOptimisticExisting = existingMessages.filter(m => !m.isOptimistic);
          
          // Create a map for quick lookup of existing message IDs
          const existingIds = new Set(nonOptimisticExisting.map(m => m._id));
          
          // Add only new messages that don't already exist
          const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m._id));
          
          // Combine: existing non-optimistic + new unique + optimistic
          const allMessages = [...nonOptimisticExisting, ...uniqueNewMessages, ...optimisticMessages];
          
          // Sort by creation time
          state.messages[key] = allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
          // For pagination, prepend older messages
          state.messages[key] = [...(messages || []), ...(state.messages[key] || [])];
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.error = action.payload;
      })
      
      // Send message (now just for optimistic updates)
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
        // Optimistic message is already added, socket will handle the real message
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
      })
      
      // Fetch room for chat
      .addCase(fetchRoomForChat.fulfilled, (state, action) => {
        const { roomId, roomData } = action.payload;
        state.roomDetails[roomId] = {
          name: roomData.name,
          image: roomData.image,
          creator: roomData.creator,
          players: roomData.players
        };
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
  setRoomDetails,
  setRoomUsers,
  addMessage,
  addOptimisticMessage,
  replaceOptimisticMessage,
  markMessageAsSent,
  removeOptimisticMessage,
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