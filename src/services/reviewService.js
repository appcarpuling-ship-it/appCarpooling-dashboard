import api from './api'

export const reviewService = {
  // Create review
  create: async (reviewData) => {
    const response = await api.post('/reviews', reviewData)
    return response.data
  },

  // Get user reviews
  getUserReviews: async (userId, params = {}) => {
    const response = await api.get(`/reviews/user/${userId}`, { params })
    return response.data
  },

  // Get trip reviews
  getTripReviews: async (tripId, params = {}) => {
    const response = await api.get(`/reviews/trip/${tripId}`, { params })
    return response.data
  },

  // Get my reviews
  getMyReviews: async (params = {}) => {
    const response = await api.get('/reviews/my-reviews', { params })
    return response.data
  },

  // Mark review as helpful
  markAsHelpful: async (reviewId) => {
    const response = await api.put(`/reviews/${reviewId}/helpful`)
    return response.data
  },

  // Delete review
  delete: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`)
    return response.data
  }
}