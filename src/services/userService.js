import api from './api'

export const userService = {
  // Search users
  search: async (params = {}) => {
    const response = await api.get('/users/search', { params })
    return response.data
  },

  // Get featured users
  getFeatured: async () => {
    const response = await api.get('/users/featured')
    return response.data
  },

  // Get user profile by ID
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}/profile`)
    return response.data
  },

  // Get user trips
  getUserTrips: async (userId, params = {}) => {
    const response = await api.get(`/users/${userId}/trips`, { params })
    return response.data
  },

  // Get my statistics
  getMyStats: async () => {
    const response = await api.get('/users/my-stats')
    return response.data
  },

  // Push token management
  updatePushToken: async (token) => {
    const response = await api.put('/users/push-token', { pushToken: token })
    return response.data
  },

  removePushToken: async () => {
    const response = await api.delete('/users/push-token')
    return response.data
  }
}