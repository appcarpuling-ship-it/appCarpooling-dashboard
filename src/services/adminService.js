import api from './api'

export const adminService = {
  // Platform statistics
  getPlatformStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },

  // User management
  users: {
    getAll: async (params = {}) => {
      const response = await api.get('/admin/users', { params })
      return response.data
    },

    getById: async (userId) => {
      const response = await api.get(`/admin/users/${userId}`)
      return response.data
    },

    update: async (userId, userData) => {
      const response = await api.put(`/admin/users/${userId}`, userData)
      return response.data
    },

    deactivate: async (userId) => {
      const response = await api.delete(`/admin/users/${userId}`)
      return response.data
    },

    activate: async (userId) => {
      const response = await api.put(`/admin/users/${userId}/activate`)
      return response.data
    },

    verify: async (userId) => {
      const response = await api.put(`/admin/users/${userId}/verify`)
      return response.data
    }
  },

  // Trip management
  trips: {
    getAll: async (params = {}) => {
      const response = await api.get('/admin/trips', { params })
      return response.data
    },

    cancel: async (tripId, reason) => {
      const response = await api.put(`/admin/trips/${tripId}/cancel`, { reason })
      return response.data
    },

    delete: async (tripId) => {
      const response = await api.delete(`/admin/trips/${tripId}`)
      return response.data
    }
  },

  // Booking management
  bookings: {
    getAll: async (params = {}) => {
      const response = await api.get('/admin/bookings', { params })
      return response.data
    },

    cancel: async (bookingId, reason) => {
      const response = await api.put(`/admin/bookings/${bookingId}/cancel`, { reason })
      return response.data
    }
  }
}