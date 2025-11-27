"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import apiService from "../services/apiService"

const Home = () => {
  const [categories, setCategories] = useState([])
  const [featuredServices, setFeaturedServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, servicesResponse] = await Promise.all([
          apiService.getCategories(),
          apiService.getServices(),
        ])

        setCategories(categoriesResponse.data)
        setFeaturedServices(servicesResponse.data.slice(0, 6)) // Show first 6 services
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div>
      {/* Hero Section */}
      <section
        className="text-center mb-4"
        style={{ padding: "60px 0", backgroundColor: "#007bff", color: "white", marginBottom: "40px" }}
      >
        <div className="container">
          <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Find Quality Home Services</h1>
          <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>
            Book trusted professionals for all your home service needs
          </p>
          <Link to="/services" className="btn btn-success" style={{ fontSize: "1.1rem", padding: "12px 30px" }}>
            Browse Services
          </Link>
        </div>
      </section>

      {/* Service Categories */}
      <section className="mb-4">
        <div className="container">
          <h2 className="text-center mb-4">Service Categories</h2>
          <div className="grid grid-3">
            {categories.map((category) => (
              <div key={category.id} className="card text-center">
                <div style={{ fontSize: "3rem", marginBottom: "15px" }}>{getCategoryIcon(category.icon)}</div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <Link to={`/services?category=${category.id}`} className="btn btn-primary">
                  View Services
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="mb-4">
        <div className="container">
          <h2 className="text-center mb-4">Featured Services</h2>
          <div className="grid grid-2">
            {featuredServices.map((service) => (
              <div key={service.id} className="card">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Price: ${service.price}</strong>
                </div>
                <Link to={`/services/${service.id}`} className="btn btn-primary">
                  Book Now
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/services" className="btn btn-secondary">
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const getCategoryIcon = (iconName) => {
  const icons = {
    plumbing: "🔧",
    electrical: "⚡",
    cleaning: "🧹",
    carpentry: "🔨",
    painting: "🎨",
    hvac: "❄️",
    landscaping: "🌱",
    appliance: "🔌",
  }
  return icons[iconName] || "🏠"
}

export default Home
