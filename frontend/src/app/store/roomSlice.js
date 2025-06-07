import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { emitSocketEvent } from './socketSlice'
import { setActiveRoom, setActiveConversation, updateRoomFromSocket } from './chatSlice'

// Keep only room creation API call - everything else via socket
export const createRoom = createAsyncThunk(
  'room/createRoom',
  async (roomData, { dispatch, getState }) => {
    const formData = new FormData()
    
    formData.append('roomName', roomData.name)
    formData.append('timeLimit', roomData.timeLimit)
    
    if (roomData.invites && roomData.invites.length > 0) {
      formData.append('players', JSON.stringify(roomData.invites))
    }
    
    formData.append('gameMode', roomData.gameMode)
    formData.append('turnBased', roomData.turnBased)
    
    if (roomData.image) {
      formData.append('image', roomData.image)
    }
    
    if (roomData.imagePrompt) {
      formData.append('imagePrompt', roomData.imagePrompt)
    }

    const response = await axios.post('/api/rooms', formData, {
      body:formData
    })
    
    const createdRoom = response.data;
    
    // Auto-switch to the created room
    const userId = getState().auth.user?.id;
    if (userId && createdRoom._id) {
      // Switch to the new room via socket
      emitSocketEvent('switch_room', { 
        userId,
        newRoomId: createdRoom._id,
        leaveRoomId: null 
      });
      
      // Update chat state to show this room
      dispatch(setActiveRoom(createdRoom._id));
      dispatch(updateRoomFromSocket({ 
        roomId: createdRoom._id, 
        roomData: createdRoom 
      }));
    }
    
    return createdRoom;
  }
)

// Switch room action (centralized room switching)
export const switchToRoom = createAsyncThunk(
  'room/switchToRoom',
  async ({ roomId, leaveRoomId = null }, { dispatch, getState }) => {
    const userId = getState().auth.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Emit socket event to switch rooms
    emitSocketEvent('switch_room', { 
      userId,
      newRoomId: roomId,
      leaveRoomId 
    });
    
    // Update UI state
    dispatch(setActiveRoom(roomId));
    dispatch(setActiveConversation(null));
    
    return { roomId, leaveRoomId };
  }
)

const roomSlice = createSlice({
  name: 'room',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
    isInitialized: false
  },
  reducers: {
    // Socket-driven room data updates
    initializeRoomData: (state, action) => {
      state.data = action.payload;
      state.isInitialized = true;
      state.status = 'succeeded';
    },

    updateRoomData: (state, action) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      } else {
        state.data = action.payload;
      }
      state.status = 'succeeded';
    },

    // OPTIMIZED: Enhanced player management with deduplication
    addPlayerToRoom: (state, action) => {
      const { player } = action.payload;
      if (state.data && player && player._id) {
        // Ensure players array exists
        if (!state.data.players) {
          state.data.players = [];
        }
        
        const existingPlayerIndex = state.data.players.findIndex(p => p._id === player._id);
        if (existingPlayerIndex >= 0) {
          // OPTIMIZATION: Update existing player data instead of adding duplicate
          state.data.players[existingPlayerIndex] = { ...state.data.players[existingPlayerIndex], ...player };
        } else {
          // Add new player
          state.data.players.push(player);
        }
        
        // Remove from pending invitations if exists
        if (state.data.pendingInvitations) {
          state.data.pendingInvitations = state.data.pendingInvitations.filter(
            p => p._id !== player._id
          );
        }
      }
    },
    
    removePlayerFromRoom: (state, action) => {
      const { playerId } = action.payload;
      if (state.data && playerId && state.data.players) {
        state.data.players = state.data.players.filter(p => p._id !== playerId);
      }
    },

    // OPTIMIZED: Enhanced players update with validation and deduplication
    updatePlayersFromSocket: (state, action) => {
      if (state.data && action.payload && Array.isArray(action.payload)) {
        // OPTIMIZATION: Comprehensive deduplication and validation
        const uniquePlayers = [];
        const seenIds = new Set();
        
        for (const player of action.payload) {
          // Validate player structure
          if (!player || typeof player !== 'object') {
            continue;
          }
          
          // Ensure player has required _id
          if (!player._id) {
            continue;
          }
          
          // Check for duplicates
          if (seenIds.has(player._id)) {
            continue;
          }
          
          seenIds.add(player._id);
          uniquePlayers.push({
            _id: player._id,
            name: player.name || 'Unknown Player',
            picture: player.picture,
            isOnline: player.isOnline || false,
            lastActive: player.lastActive,
            currentRoom: player.currentRoom
          });
        }
        
        state.data.players = uniquePlayers;
      } else {
        console.warn('⚠️ Invalid players data in updatePlayersFromSocket:', action.payload);
      }
    },

    updateGameStateFromSocket: (state, action) => {
      if (state.data) {
        state.data.gameState = action.payload;
      }
    },

    clearRoomData: (state) => {
      state.data = null;
      state.status = 'idle';
      state.isInitialized = false;
    },

    // OPTIMIZATION: New action for handling room connection state
    setRoomConnectionState: (state, action) => {
      const { isConnected, roomId } = action.payload;
      if (state.data && state.data._id === roomId) {
        state.data.isConnected = isConnected;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRoom.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
        state.isInitialized = true
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Switch room
      .addCase(switchToRoom.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(switchToRoom.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Room data will be updated via socket events
      })
      .addCase(switchToRoom.rejected, (state, action) => {
        state.error = action.error.message
      })
  },
})

export const { 
  initializeRoomData,
  updateRoomData,
  addPlayerToRoom, 
  removePlayerFromRoom,
  updatePlayersFromSocket,
  updateGameStateFromSocket,
  clearRoomData,
  setRoomConnectionState
} = roomSlice.actions;

export default roomSlice.reducer