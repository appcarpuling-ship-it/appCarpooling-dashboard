import { create } from 'zustand'
import { authService } from '../services'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // Initialize auth state
  initialize: () => {
    const token = localStorage.getItem('dashboard_token')
    const user = authService.getStoredUser()

    if (token && user) {
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await authService.login(credentials)

      if (response.success && response.data.token) {
        const { token, user } = response.data

        // Store auth data
        authService.storeAuthData(token, user)

        // Update state
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })

        return { success: true }
      } else {
        return { success: false, message: response.message || 'Error de autenticación' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error de autenticación'
      }
    }
  },

  // Logout
  logout: () => {
    authService.logout()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  // Update user profile
  updateUser: (updatedUser) => {
    // Update localStorage
    authService.storeAuthData(get().token, updatedUser)

    // Update state
    set((state) => ({
      user: { ...state.user, ...updatedUser }
    }))
  },

  // Refresh user data
  refreshUser: async () => {
    try {
      const response = await authService.getCurrentUser()
      if (response.success && response.data) {
        const user = response.data

        // Update localStorage
        authService.storeAuthData(get().token, user)

        // Update state
        set({ user })
        return { success: true, user }
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      if (error.response?.status === 401) {
        get().logout()
      }
      return { success: false, error: error.message }
    }
  },

  // Check if user has admin permissions
  isAdmin: () => {
    const { user } = get()
    return user?.role === 'admin' || user?.isAdmin === true
  },
}))