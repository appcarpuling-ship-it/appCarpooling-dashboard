import api from './api'

export const commissionService = {
  // Get my commissions
  getMyCommissions: async (params = {}) => {
    const response = await api.get('/commissions/my-commissions', { params })
    return response.data
  },

  // Get my commission stats
  getMyStats: async () => {
    const response = await api.get('/commissions/my-stats')
    return response.data
  },

  // Get operation status
  getOperationStatus: async () => {
    const response = await api.get('/commissions/operation-status')
    return response.data
  },

  // Pay commission
  pay: async (commissionId, paymentData) => {
    const formData = new FormData()

    Object.keys(paymentData).forEach(key => {
      if (paymentData[key] !== null && paymentData[key] !== undefined) {
        formData.append(key, paymentData[key])
      }
    })

    const response = await api.put(`/commissions/${commissionId}/pay`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get commission by ID
  getById: async (commissionId) => {
    const response = await api.get(`/commissions/${commissionId}`)
    return response.data
  },

  // Admin functions
  admin: {
    getSummary: async () => {
      const response = await api.get('/commissions/admin/summary')
      return response.data
    },

    getAll: async (params = {}) => {
      const response = await api.get('/commissions/admin/all', { params })
      return response.data
    },

    calculate: async (month, year) => {
      const response = await api.post('/commissions/admin/calculate', { month, year })
      return response.data
    },

    sendNotifications: async () => {
      const response = await api.post('/commissions/admin/send-notifications')
      return response.data
    },

    waive: async (commissionId, reason) => {
      const response = await api.put(`/commissions/admin/${commissionId}/waive`, { reason })
      return response.data
    }
  }
}