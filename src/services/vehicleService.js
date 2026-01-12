import api from './api'

export const vehicleService = {
  // Create vehicle
  create: async (vehicleData) => {
    const formData = new FormData()

    Object.keys(vehicleData).forEach(key => {
      if (key === 'photos' && Array.isArray(vehicleData[key])) {
        vehicleData[key].forEach(photo => {
          formData.append('photos', photo)
        })
      } else if (vehicleData[key] !== null && vehicleData[key] !== undefined) {
        formData.append(key, vehicleData[key])
      }
    })

    const response = await api.post('/vehicles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get my vehicles
  getMyVehicles: async () => {
    const response = await api.get('/vehicles/my-vehicles')
    return response.data
  },

  // Get vehicle by ID
  getById: async (vehicleId) => {
    const response = await api.get(`/vehicles/${vehicleId}`)
    return response.data
  },

  // Update vehicle
  update: async (vehicleId, vehicleData) => {
    const formData = new FormData()

    Object.keys(vehicleData).forEach(key => {
      if (key === 'photos' && Array.isArray(vehicleData[key])) {
        vehicleData[key].forEach(photo => {
          formData.append('photos', photo)
        })
      } else if (vehicleData[key] !== null && vehicleData[key] !== undefined) {
        formData.append(key, vehicleData[key])
      }
    })

    const response = await api.put(`/vehicles/${vehicleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Delete vehicle
  delete: async (vehicleId) => {
    const response = await api.delete(`/vehicles/${vehicleId}`)
    return response.data
  }
}