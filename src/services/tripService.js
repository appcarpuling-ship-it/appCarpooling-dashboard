import api from './api'

export const tripService = {
  // Get all trips
  getAll: async (params = {}) => {
    const response = await api.get('/trips', { params })
    return response.data
  },

  // Search trips
  search: async (params = {}) => {
    const response = await api.get('/trips/search', { params })
    return response.data
  },

  // Get trip by ID
  getById: async (tripId) => {
    const response = await api.get(`/trips/${tripId}`)
    return response.data
  },

  // Create trip
  create: async (tripData) => {
    const response = await api.post('/trips', tripData)
    return response.data
  },

  // Update trip
  update: async (tripId, tripData) => {
    const response = await api.put(`/trips/${tripId}`, tripData)
    return response.data
  },

  // Cancel trip
  cancel: async (tripId, reason) => {
    const response = await api.put(`/trips/${tripId}/cancel`, { reason })
    return response.data
  },

  // Complete trip
  complete: async (tripId) => {
    const response = await api.put(`/trips/${tripId}/complete`)
    return response.data
  },

  // Delete trip
  delete: async (tripId) => {
    const response = await api.delete(`/trips/${tripId}`)
    return response.data
  },

  // My trips
  myTrips: {
    asDriver: async (params = {}) => {
      const response = await api.get('/trips/my-trips/driver', { params })
      return response.data
    },

    asPassenger: async (params = {}) => {
      const response = await api.get('/trips/my-trips/passenger', { params })
      return response.data
    }
  },

  // Geocoding services
  geocoding: {
    geocode: async (address) => {
      const response = await api.post('/trips/geocode', { address })
      return response.data
    },

    reverseGeocode: async (lat, lng) => {
      const response = await api.post('/trips/reverse-geocode', { lat, lng })
      return response.data
    },

    geocodeTrip: async (origin, destination) => {
      const response = await api.post('/trips/geocode-trip', { origin, destination })
      return response.data
    }
  }
}