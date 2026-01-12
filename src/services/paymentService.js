import api from './api'

export const paymentService = {
  // Create payment
  create: async (paymentData) => {
    const response = await api.post('/payments', paymentData)
    return response.data
  },

  // Get sent payments
  getSent: async (params = {}) => {
    const response = await api.get('/payments/sent', { params })
    return response.data
  },

  // Get received payments
  getReceived: async (params = {}) => {
    const response = await api.get('/payments/received', { params })
    return response.data
  },

  // Get payment summary
  getSummary: async () => {
    const response = await api.get('/payments/summary')
    return response.data
  },

  // Confirm payment
  confirm: async (paymentId) => {
    const response = await api.put(`/payments/${paymentId}/confirm`)
    return response.data
  },

  // Request refund
  requestRefund: async (paymentId, reason) => {
    const response = await api.put(`/payments/${paymentId}/refund`, { reason })
    return response.data
  }
}