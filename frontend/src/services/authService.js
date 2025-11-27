import axios from "axios"

const API_URL = "/api/auth/"

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "signin", {
        username,
        password,
      })
      .then((response) => {
        if (response.data.token) {
          localStorage.setItem("user", JSON.stringify(response.data))
        }
        return response
      })
  }

  logout() {
    localStorage.removeItem("user")
  }

  register(userData) {
    return axios.post(API_URL + "signup", userData)
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user")
    if (userStr) return JSON.parse(userStr)
    return null
  }
}

export default new AuthService()
