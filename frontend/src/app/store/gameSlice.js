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
    // Grid preferences - stored per game to remember user choices
    gridPreferences: {
      size: 4, // Default 4x4 grid
      customSize: false, // Whether user has manually set the size
      adaptiveSizing: true // Whether to adapt piece sizes based on content
    },
    whiteboard: {
      strokes: [],
      background: { color: '#ffffff', image: null },
      dimensions: { width: 1920, height: 1080 },
      collaborators: [],
      version: 1
    },
    puzzle: {
      pieces: [],
      moves: 0,
      startTime: null,
      endTime: null,
      isCompleted: false,
      completedAt: null,
      activePlayers: [],
      hints: []
    }
  },
  reducers: {
    resetGame: (state) => {
      state.data = null;
      state.status = 'idle';
      state.loading = false;
      state.error = null;
      // Don't reset whiteboard state completely - keep strokes for persistence
      if (!state.whiteboard.strokes || state.whiteboard.strokes.length === 0) {
        state.whiteboard = {
          strokes: [],
          background: { color: '#ffffff', image: null },
          dimensions: { width: 1920, height: 1080 },
          collaborators: [],
          version: 1
        };
      }
    },
    
    // Whiteboard state management
    setWhiteboardState: (state, action) => {
      const { strokes, background, dimensions, collaborators, version } = action.payload;
      state.whiteboard = {
        strokes: strokes || [],
        background: background || { color: '#ffffff', image: null },
        dimensions: dimensions || { width: 1920, height: 1080 },
        collaborators: collaborators || [],
        version: version || 1
      };
    },
    
    addStrokeToWhiteboard: (state, action) => {
      const { stroke } = action.payload;
      if (stroke && !state.whiteboard.strokes.find(s => s.id === stroke.id)) {
        state.whiteboard.strokes.push(stroke);
        state.whiteboard.version += 1;
      }
    },
    
    removeStrokeFromWhiteboard: (state, action) => {
      const { strokeId } = action.payload;
      state.whiteboard.strokes = state.whiteboard.strokes.filter(s => s.id !== strokeId);
      state.whiteboard.version += 1;
    },
    
    clearWhiteboard: (state) => {
      state.whiteboard.strokes = [];
      state.whiteboard.version += 1;
    },
    
    updateCollaborators: (state, action) => {
      const { collaborators } = action.payload;
      state.whiteboard.collaborators = collaborators || [];
    },
    
    updateCollaboratorCursor: (state, action) => {
      const { userId, cursor } = action.payload;
      const collaboratorIndex = state.whiteboard.collaborators.findIndex(
        c => c.user && c.user._id === userId
      );
      
      if (collaboratorIndex >= 0) {
        state.whiteboard.collaborators[collaboratorIndex].cursor = cursor;
      }
    },

    // Puzzle state management
    setPuzzleState: (state, action) => {
      const { puzzle, moves, startTime, endTime } = action.payload;
      state.puzzle = {
        pieces: puzzle.pieces || [],
        moves: moves || 0,
        startTime: startTime || null,
        endTime: endTime || null,
        isCompleted: puzzle.isCompleted || false,
        completedAt: puzzle.completedAt || null,
        activePlayers: state.puzzle.activePlayers || [],
        hints: state.puzzle.hints || []
      };
    },

    resetPuzzleState: (state) => {
      state.puzzle = {
        pieces: [],
        moves: 0,
        startTime: null,
        endTime: null,
        isCompleted: false,
        completedAt: null,
        activePlayers: [],
        hints: []
      };
    },

    updatePuzzlePiece: (state, action) => {
      const { pieceId, toPosition, isCorrectlyPlaced } = action.payload;
      const pieceIndex = state.puzzle.pieces.findIndex(p => p._id === pieceId);
      
      if (pieceIndex >= 0) {
        state.puzzle.pieces[pieceIndex].currentPosition = toPosition;
        state.puzzle.pieces[pieceIndex].isCorrectlyPlaced = isCorrectlyPlaced;
      }
    },

    updatePuzzleMoves: (state, action) => {
      state.puzzle.moves = action.payload;
    },

    completePuzzle: (state, action) => {
      const { completedAt } = action.payload;
      state.puzzle.isCompleted = true;
      state.puzzle.completedAt = completedAt;
      state.puzzle.endTime = completedAt;
    },

    resetPuzzle: (state, action) => {
      const { newStartTime } = action.payload;
      state.puzzle.pieces = state.puzzle.pieces.map(piece => ({
        ...piece,
        currentPosition: null,
        isCorrectlyPlaced: false
      }));
      state.puzzle.moves = 0;
      state.puzzle.startTime = newStartTime;
      state.puzzle.endTime = null;
      state.puzzle.isCompleted = false;
      state.puzzle.completedAt = null;
      state.puzzle.hints = [];
    },

    addPuzzlePlayer: (state, action) => {
      const { userId } = action.payload;
      if (!state.puzzle.activePlayers.includes(userId)) {
        state.puzzle.activePlayers.push(userId);
      }
    },

    removePuzzlePlayer: (state, action) => {
      const { userId } = action.payload;
      state.puzzle.activePlayers = state.puzzle.activePlayers.filter(id => id !== userId);
    },

    addHint: (state, action) => {
      const { pieceId, correctPosition, currentPosition } = action.payload;
      state.puzzle.hints.push({
        pieceId,
        correctPosition,
        currentPosition,
        timestamp: new Date().toISOString()
      });
    },

    // Grid preference management
    setGridSize: (state, action) => {
      const { size, isCustom = true } = action.payload;
      state.gridPreferences.size = Math.max(2, Math.min(8, size)); // Clamp between 2-8
      state.gridPreferences.customSize = isCustom;
      
      // Store in localStorage for persistence
      try {
        const preferences = JSON.parse(localStorage.getItem('puzzleGridPreferences') || '{}');
        preferences[state.data?._id || 'default'] = state.gridPreferences;
        localStorage.setItem('puzzleGridPreferences', JSON.stringify(preferences));
      } catch (error) {
        console.warn('Failed to save grid preferences to localStorage:', error);
      }
    },

    setAdaptiveSizing: (state, action) => {
      state.gridPreferences.adaptiveSizing = action.payload;
      
      // Store in localStorage for persistence
      try {
        const preferences = JSON.parse(localStorage.getItem('puzzleGridPreferences') || '{}');
        preferences[state.data?._id || 'default'] = state.gridPreferences;
        localStorage.setItem('puzzleGridPreferences', JSON.stringify(preferences));
      } catch (error) {
        console.warn('Failed to save grid preferences to localStorage:', error);
      }
    },

    loadGridPreferences: (state, action) => {
      const { gameId } = action.payload;
      
      try {
        const preferences = JSON.parse(localStorage.getItem('puzzleGridPreferences') || '{}');
        const gamePreferences = preferences[gameId];
        
        if (gamePreferences) {
          state.gridPreferences = { ...state.gridPreferences, ...gamePreferences };
        }
      } catch (error) {
        console.warn('Failed to load grid preferences from localStorage:', error);
      }
    }
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

export const { 
  resetGame, 
  setWhiteboardState, 
  addStrokeToWhiteboard, 
  removeStrokeFromWhiteboard, 
  clearWhiteboard, 
  updateCollaborators, 
  updateCollaboratorCursor,
  setPuzzleState,
  resetPuzzleState,
  updatePuzzlePiece,
  updatePuzzleMoves,
  completePuzzle,
  resetPuzzle,
  addPuzzlePlayer,
  removePuzzlePlayer,
  addHint,
  setGridSize,
  setAdaptiveSizing,
  loadGridPreferences
} = gameSlice.actions;

export default gameSlice.reducer;