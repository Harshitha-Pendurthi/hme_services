import axios from "axios"
import authService from "./authService"

const API_URL = "/api/"

// Add a request interceptor to include the auth token
axios.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser()
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      authService.logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

class ApiService {
  // Service Categories
  getCategories() {
    return axios.get(API_URL + "categories")
  }

  getCategoryById(id) {
    return axios.get(API_URL + `categories/${id}`)
  }

  // Services
  getServices() {
    return axios.get(API_URL + "services")
  }

  getServiceById(id) {
    return axios.get(API_URL + `services/${id}`)
  }

  getServicesByCategory(categoryId) {
    return axios.get(API_URL + `services/category/${categoryId}`)
  }

  searchServices(keyword) {
    return axios.get(API_URL + `services/search?keyword=${keyword}`)
  }

  createService(serviceData) {
    return axios.post(API_URL + "services", serviceData)
  }

  updateService(id, serviceData) {
    return axios.put(API_URL + `services/${id}`, serviceData)
  }

  deleteService(id) {
    return axios.delete(API_URL + `services/${id}`)
  }

  // Bookings
  getBookings() {
    return axios.get(API_URL + "bookings")
  }

  getBookingById(id) {
    return axios.get(API_URL + `bookings/${id}`)
  }

  createBooking(bookingData) {
    return axios.post(API_URL + "bookings", bookingData)
  }

  updateBookingStatus(id, status) {
    return axios.put(API_URL + `bookings/${id}/status?status=${status}`)
  }
}

export default new ApiService()
