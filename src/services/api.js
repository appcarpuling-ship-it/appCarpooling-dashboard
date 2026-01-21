import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutos para archivos grandes
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dashboard_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Error desconocido'

    // Handle specific error status codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('dashboard_token')
      localStorage.removeItem('dashboard_user')
      window.location.href = '/login'
      return
    }

    if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción')
    } else if (error.response?.status === 404) {
      toast.error('Recurso no encontrado')
    } else if (error.response?.status >= 500) {
      toast.error('Error del servidor. Inténtalo más tarde.')
    } else {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api