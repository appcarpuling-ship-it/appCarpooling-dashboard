import api from './api'

export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Update profile
  updateProfile: async (profileData) => {
    const formData = new FormData()

    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key])
      }
    })

    const response = await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await api.put('/users/change-password', passwords)
    return response.data
  },

  // Logout
  logout: () => {
    localStorage.removeItem('dashboard_token')
    localStorage.removeItem('dashboard_user')
    window.location.href = '/login'
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('dashboard_token')
  },

  // Get stored user data
  getStoredUser: () => {
    const userData = localStorage.getItem('dashboard_user')
    return userData ? JSON.parse(userData) : null
  },

  // Store authentication data
  storeAuthData: (token, user) => {
    localStorage.setItem('dashboard_token', token)
    localStorage.setItem('dashboard_user', JSON.stringify(user))
  }
}