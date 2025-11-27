"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import apiService from "../services/apiService"

const ServiceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState({
    bookingDate: "",
    bookingTime: "",
    specialInstructions: "",
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await apiService.getServiceById(id)
        setService(response.data)
      } catch (error) {
        console.error("Error fetching service:", error)
        setMessage("Service not found")
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [id])

  const handleInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    })
  }

  const handleBooking = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      navigate("/login")
      return
    }

    if (currentUser.role !== "CUSTOMER") {
      setMessage("Only customers can book services")
      return
    }

    setBookingLoading(true)
    setMessage("")

    try {
      const bookingRequest = {
        serviceId: Number.parseInt(id),
        bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime,
        specialInstructions: bookingData.specialInstructions,
      }

      await apiService.createBooking(bookingRequest)
      setMessage("Booking created successfully!")

      // Redirect to bookings page after 2 seconds
      setTimeout(() => {
        navigate("/bookings")
      }, 2000)
    } catch (error) {
      console.error("Error creating booking:", error)
      setMessage(error.response?.data || "Failed to create booking")
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading service details...</div>
  }

  if (!service) {
    return (
      <div className="text-center">
        <h2>Service not found</h2>
        <button onClick={() => navigate("/services")} className="btn btn-primary">
          Back to Services
        </button>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: "800px" }}>
      <div className="card">
        <h1>{service.name}</h1>
        <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>{service.description}</p>

        <div className="grid grid-2" style={{ marginBottom: "30px" }}>
          <div>
            <h3>Service Details</h3>
            <p>
              <strong>Price:</strong> ${service.price}
            </p>
            <p>
              <strong>Duration:</strong> {service.durationMinutes} minutes
            </p>
            <p>
              <strong>Category:</strong> {service.category?.name}
            </p>
          </div>
          <div>
            <h3>Provider Information</h3>
            <p>
              <strong>Name:</strong> {service.provider?.firstName} {service.provider?.lastName}
            </p>
            <p>
              <strong>Email:</strong> {service.provider?.email}
            </p>
            <p>
              <strong>Phone:</strong> {service.provider?.phone}
            </p>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-danger"}`}>
            {message}
          </div>
        )}

        {currentUser && currentUser.role === "CUSTOMER" && (
          <div className="card" style={{ backgroundColor: "#f8f9fa" }}>
            <h3>Book This Service</h3>
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input
                  type="date"
                  name="bookingDate"
                  className="form-control"
                  value={bookingData.bookingDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Time</label>
                <input
                  type="time"
                  name="bookingTime"
                  className="form-control"
                  value={bookingData.bookingTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Special Instructions (Optional)</label>
                <textarea
                  name="specialInstructions"
                  className="form-control"
                  value={bookingData.specialInstructions}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any special requirements or instructions..."
                />
              </div>

              <button type="submit" className="btn btn-success" disabled={bookingLoading} style={{ width: "100%" }}>
                {bookingLoading ? "Creating Booking..." : `Book Now - $${service.price}`}
              </button>
            </form>
          </div>
        )}

        {!currentUser && (
          <div className="text-center">
            <p>
              Please <a href="/login">login</a> to book this service.
            </p>
          </div>
        )}

        {currentUser && currentUser.role !== "CUSTOMER" && (
          <div className="alert alert-info">Only customers can book services.</div>
        )}
      </div>
    </div>
  )
}

export default ServiceDetails
