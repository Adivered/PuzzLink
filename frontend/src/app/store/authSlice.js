import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/status',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/auth/status');
      return response.data;
    } catch (error) {
      return rejectWithValue(null);
    }
  }
);

export const getGoogleAuthUrl = createAsyncThunk(
  'auth/googleUrl',
  async (from = '/') => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: process.env.REACT_APP_GOOGLE_OAUTH_REDIRECT,
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
      state: from
    };

    return `${rootUrl}?${new URLSearchParams(options)}`;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await axios.get('/auth/logout');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    homeConversationId: null,
    shouldReconnectSocket: false,
    googleCallbackDetected: false,
    statusChecked: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReconnectFlag: (state) => {
      state.shouldReconnectSocket = false;
    },
    setGoogleCallbackDetected: (state) => {
      state.googleCallbackDetected = true;
    },
    // Handle Google auth callback data
    handleGoogleAuthSuccess: (state, action) => {
      const { user, homeConversationId } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.homeConversationId = homeConversationId;
      state.shouldReconnectSocket = true;
      state.loading = false;
      state.error = null;
      state.googleCallbackDetected = false; // Reset after successful auth
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.authenticated) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.homeConversationId = action.payload.homeConversationId;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.homeConversationId = null;
        }
        state.statusChecked = true;
        state.googleCallbackDetected = false;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.homeConversationId = null;
        state.statusChecked = true;
        state.googleCallbackDetected = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.homeConversationId = action.payload.homeConversationId;
        state.error = null;
        state.shouldReconnectSocket = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.homeConversationId = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.homeConversationId = null;
        state.error = null;
      });
  }
});

export const { clearError, clearReconnectFlag, setGoogleCallbackDetected, handleGoogleAuthSuccess } = authSlice.actions;
export default authSlice.reducer;