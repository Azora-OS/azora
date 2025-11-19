/**
 * Authentication Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  user: any | null;
  mfaRequired: boolean;
  mfaChallengeId: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  error: null,
  token: null,
  user: null,
  mfaRequired: false,
  mfaChallengeId: null
};

/**
 * Login Thunk
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

/**
 * Verify MFA Thunk
 */
export const verifyMFA = createAsyncThunk(
  'auth/verifyMFA',
  async (
    { challengeId, code }: { challengeId: string; code: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post('/auth/mfa/verify', {
        challengeId,
        code
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'MFA verification failed');
    }
  }
);

/**
 * Logout Thunk
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/auth/logout');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Logout failed');
    }
  }
);

/**
 * Auth Slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.mfaRequired) {
          state.mfaRequired = true;
          state.mfaChallengeId = action.payload.challengeId;
        } else {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify MFA
    builder
      .addCase(verifyMFA.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyMFA.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.mfaRequired = false;
        state.mfaChallengeId = null;
      })
      .addCase(verifyMFA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.mfaRequired = false;
        state.mfaChallengeId = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setToken, clearError } = authSlice.actions;
export default authSlice.reducer;
