"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import apiService from "../services/apiService"
import BookingCard from "../components/BookingCard"

const Bookings = () => {
  const { currentUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await apiService.getBookings()
      setBookings(response.data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setMessage("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await apiService.updateBookingStatus(bookingId, newStatus)
      setMessage("Booking status updated successfully")
      fetchBookings() // Refresh the bookings list
    } catch (error) {
      console.error("Error updating booking status:", error)
      setMessage("Failed to update booking status")
    }
  }

  if (loading) {
    return <div className="loading">Loading bookings...</div>
  }

  const getPageTitle = () => {
    if (currentUser?.role === "CUSTOMER") {
      return "My Bookings"
    } else if (currentUser?.role === "PROVIDER") {
      return "Service Requests"
    } else {
      return "All Bookings"
    }
  }

  const showActions = currentUser?.role === "PROVIDER" || currentUser?.role === "ADMIN"

  return (
    <div>
      <h1 className="text-center mb-4">{getPageTitle()}</h1>

      {message && (
        <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-danger"}`}>{message}</div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center">
          <div className="card">
            <h3>No bookings found</h3>
            <p>
              {currentUser?.role === "CUSTOMER"
                ? "You haven't made any bookings yet."
                : "No service requests at the moment."}
            </p>
            {currentUser?.role === "CUSTOMER" && (
              <a href="/services" className="btn btn-primary">
                Browse Services
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-2">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onStatusUpdate={handleStatusUpdate}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookings
