import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const createRoom = createAsyncThunk(
  'room/createRoom',
  async (roomData) => {
    console.log("Preparing FormData: ", roomData)
    const formData = new FormData()
    
    // Add basic room data
    formData.append('roomName', roomData.name)
    formData.append('timeLimit', roomData.timeLimit)
    
    // Add players array as JSON string
    if (roomData.invites && roomData.invites.length > 0) {
      formData.append('players', JSON.stringify(roomData.invites))
    }
    
    // Add game settings
    formData.append('gameMode', roomData.gameMode)
    formData.append('turnBased', roomData.turnBased)
    
    // Add image if exists
    if (roomData.image) {
      formData.append('image', roomData.image)
    }
    
    // Add image prompt if exists
    if (roomData.imagePrompt) {
      formData.append('imagePrompt', roomData.imagePrompt)
    }

    const response = await axios.post('/api/rooms', formData, {
      body:formData
    })
    return response.data
  }
)

export const fetchRoom = createAsyncThunk(
  'room/fetchRoom',
  async (roomId) => {
    const response = await axios.get(`/api/rooms/${roomId}`)
    return response.data
  }
)

export const updateRoom = createAsyncThunk(
  'room/updateRoom',
  async ({ roomId, ...updatedData }) => {
    const response = await axios.put(`/api/rooms/${roomId}`, updatedData)
    return response.data
  }
)

export const addPlayer = createAsyncThunk(
  'room/addPlayer',
  async ({ roomId, email }) => {
    const response = await axios.post(`/api/rooms/${roomId}/addPlayer`, { email })
    return response.data
  }
)

export const removePlayer = createAsyncThunk(
  'room/removePlayer',
  async ({ roomId, playerId }) => {
    const response = await axios.delete(`/api/rooms/${roomId}/removePlayer/${playerId}`)
    return response.data
  }
)

export const startGame = createAsyncThunk(
  'room/startGame',
  async (roomId) => {
    const response = await axios.post(`/api/rooms/${roomId}/start`)
    return response.data
  }
)

const roomSlice = createSlice({
  name: 'room',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createRoom.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        console.log("Room created: ", action.payload)
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(fetchRoom.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchRoom.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(fetchRoom.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(updateRoom.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addPlayer.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(addPlayer.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(addPlayer.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(removePlayer.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(removePlayer.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(removePlayer.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(startGame.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(startGame.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(startGame.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export default roomSlice.reducer