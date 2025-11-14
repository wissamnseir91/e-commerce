import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      // Don't redirect - let the component handle showing auth modal
      // The error will be caught by the component
    }
    return Promise.reject(error)
  }
)

export const authService = {
  register: async (userData) => {
    const response = await api.post('/register', userData)
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.data.user))
    }
    return response.data
  },

  login: async (credentials) => {
    const response = await api.post('/login', credentials)
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.data.user))
    }
    return response.data
  },

  logout: async () => {
    const response = await api.post('/logout')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    return response.data
  },

  getUser: async () => {
    const response = await api.get('/user')
    return response.data
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token')
  },

  getToken: () => {
    return localStorage.getItem('auth_token')
  },

  getUserData: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
}

export const productService = {
  getAll: async (page = 1) => {
    const response = await api.get(`/products?page=${page}`)
    return response.data
  },

  create: async (productData) => {
    const formData = new FormData()
    Object.keys(productData).forEach(key => {
      if (key === 'image' && productData[key]) {
        formData.append('image', productData[key])
      } else if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key])
      }
    })
    
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

export default api

