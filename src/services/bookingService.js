import api from './api'

export const bookingService = {
  // Create booking
  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData)
    return response.data
  },

  // Get my bookings
  getMyBookings: async (params = {}) => {
    const response = await api.get('/bookings/my-bookings', { params })
    return response.data
  },

  // Get trip bookings
  getTripBookings: async (tripId) => {
    const response = await api.get(`/bookings/trip/${tripId}`)
    return response.data
  },

  // Get booking by ID
  getById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`)
    return response.data
  },

  // Confirm booking
  confirm: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/confirm`)
    return response.data
  },

  // Reject booking
  reject: async (bookingId, reason) => {
    const response = await api.put(`/bookings/${bookingId}/reject`, { reason })
    return response.data
  },

  // Cancel booking
  cancel: async (bookingId, reason) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`, { reason })
    return response.data
  }
}