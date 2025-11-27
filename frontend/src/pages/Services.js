"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import apiService from "../services/apiService"
import ServiceCard from "../components/ServiceCard"

const Services = () => {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, categoriesResponse] = await Promise.all([
          apiService.getServices(),
          apiService.getCategories(),
        ])

        setServices(servicesResponse.data)
        setCategories(categoriesResponse.data)

        // Check if category is specified in URL
        const categoryFromUrl = searchParams.get("category")
        if (categoryFromUrl) {
          setSelectedCategory(categoryFromUrl)
          const categoryServices = await apiService.getServicesByCategory(categoryFromUrl)
          setServices(categoryServices.data)
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId)
    setLoading(true)

    try {
      if (categoryId === "") {
        const response = await apiService.getServices()
        setServices(response.data)
      } else {
        const response = await apiService.getServicesByCategory(categoryId)
        setServices(response.data)
      }
    } catch (error) {
      console.error("Error fetching services by category:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading services...</div>
  }

  return (
    <div>
      <h1 className="text-center mb-4">Our Services</h1>

      {/* Category Filter */}
      <div className="card mb-4">
        <h3>Filter by Category</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
          <button
            onClick={() => handleCategoryChange("")}
            className={`btn ${selectedCategory === "" ? "btn-primary" : "btn-secondary"}`}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id.toString())}
              className={`btn ${selectedCategory === category.id.toString() ? "btn-primary" : "btn-secondary"}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center">
          <p>No services found for the selected category.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Services
