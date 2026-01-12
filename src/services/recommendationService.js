import api from './api'

export const recommendationService = {
  // Get trip recommendations
  getTrips: async (params = {}) => {
    const response = await api.get('/recommendations/trips', { params })
    return response.data
  },

  // Get driver recommendations
  getDrivers: async (params = {}) => {
    const response = await api.get('/recommendations/drivers', { params })
    return response.data
  },

  // Get popular routes
  getPopularRoutes: async () => {
    const response = await api.get('/recommendations/popular-routes')
    return response.data
  },

  // Get city demand
  getCityDemand: async () => {
    const response = await api.get('/recommendations/city-demand')
    return response.data
  },

  // Get similar trips
  getSimilarTrips: async (tripId) => {
    const response = await api.get(`/recommendations/similar/${tripId}`)
    return response.data
  }
}