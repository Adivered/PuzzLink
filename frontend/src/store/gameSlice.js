import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchGame = createAsyncThunk(
  'game/fetchGame',
  async (gameId) => {
    const response = await axios.get(`/api/games/${gameId}`);
    return response.data;
  }
);

export const updateGameState = createAsyncThunk(
  'game/updateGameState',
  async ({ gameId, pieceId, position }) => {
    const response = await axios.put(`/api/games/${gameId}`, {
      pieceId,
      position
    });
    return response.data;
  }
);

export const endGame = createAsyncThunk(
  'game/endGame',
  async (gameId) => {
    const response = await axios.post(`/api/games/${gameId}/end`);
    return response.data;
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    data: null,
    status: 'idle',
    loading: false,
    error: null,
  },
  reducers: {
    resetGame: (state) => {
      state.data = null;
      state.status = 'idle';
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch game cases
      .addCase(fetchGame.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGame.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchGame.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.error.message;
      })
      // Update game state cases
      .addCase(updateGameState.pending, (state) => {
        state.status = 'updating';
      })
      .addCase(updateGameState.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(updateGameState.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // End game cases
      .addCase(endGame.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export const { resetGame } = gameSlice.actions;
export default gameSlice.reducer;