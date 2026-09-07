import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  fetchCurrentUserRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from './auth.service'

function mapSession(payload) {
  return {
    user: payload.user,
  }
}

function getErrorMessage(error) {
  const message = error?.data?.message || error?.message || 'Request failed.'

  if (message === 'validate error' || error?.status === 422) {
    if (error?.data?.errors) {
      const firstErrorKey = Object.keys(error.data.errors)[0]
      if (firstErrorKey) {
        const firstError = error.data.errors[firstErrorKey]
        return Array.isArray(firstError) ? firstError[0] : firstError
      }
    }
    return 'Please check the form for errors.'
  }

  return message
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginRequest(credentials)
      return mapSession(response)
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error),
        details: error?.data?.errors ?? error?.data?.error ?? null,
      })
    }
  },
)

export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await registerRequest(payload)
      return mapSession(response)
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error),
        details: error?.data?.errors ?? error?.data?.error ?? null,
      })
    }
  },
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCurrentUserRequest()
      return mapSession(response)
    } catch (error) {
      return rejectWithValue({
        status: error?.status ?? 500,
        message: getErrorMessage(error),
      })
    }
  },
)

export const logout = createAsyncThunk(
  'auth/logout', 
  async (_, { rejectWithValue }) => {
    try {
      await logoutRequest()
      return null
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error),
      })
    }
  },
)

let savedUser = null
const savedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
try {
  const rawUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
  savedUser = rawUser ? JSON.parse(rawUser) : null
} catch (e) {
  savedUser = null
}

const initialState = {
  user: savedUser,
  isAuthenticated: Boolean(savedUser && savedToken),
  isReady: Boolean(savedUser && savedToken),
  status: 'idle',
  error: null,
  validationErrors: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
      state.validationErrors = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        if (!state.isReady && !state.user) {
          state.status = 'loading'
        }
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload.user
        state.isAuthenticated = true
        state.isReady = true
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'idle'
        state.isReady = true
        if (action.payload?.status === 401) {
          state.user = null
          state.isAuthenticated = false
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
          }
        }
        if (action.payload?.status && action.payload.status !== 401) {
          state.error = action.payload.message
        }
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.validationErrors = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.isAuthenticated = true
        state.isReady = true
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message ?? 'Login failed.'
        state.validationErrors = action.payload?.details ?? null
        state.isReady = true
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.validationErrors = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.isAuthenticated = true
        state.isReady = true
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message ?? 'Registration failed.'
        state.validationErrors = action.payload?.details ?? null
        state.isReady = true
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle'
        state.user = null
        state.isAuthenticated = false
        state.isReady = true
        state.error = null
        state.validationErrors = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = 'failed'
        state.user = null
        state.isAuthenticated = false
        state.isReady = true
        state.error = action.payload?.message ?? 'Logout failed.'
      })
  },
})

export const { clearAuthError } = authSlice.actions

export const authReducer = authSlice.reducer

export const selectAuth = (state) => state.auth
export const selectAuthStatus = (state) => state.auth.status
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
