"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import apiService from "../services/apiService"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const bookingsResponse = await apiService.getBookings()
      const bookings = bookingsResponse.data

      // Calculate stats
      const totalBookings = bookings.length
      const pendingBookings = bookings.filter((b) => b.status === "PENDING").length
      const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length
      const totalRevenue = bookings
        .filter((b) => b.status === "COMPLETED")
        .reduce((sum, b) => sum + Number.parseFloat(b.totalAmount), 0)

      setStats({
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue,
      })

      // Get recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  const getDashboardTitle = () => {
    switch (currentUser?.role) {
      case "CUSTOMER":
        return "Customer Dashboard"
      case "PROVIDER":
        return "Provider Dashboard"
      case "ADMIN":
        return "Admin Dashboard"
      default:
        return "Dashboard"
    }
  }

  return (
    <div>
      <h1 className="text-center mb-4">{getDashboardTitle()}</h1>

      {/* Welcome Section */}
      <div className="card mb-4">
        <h2>Welcome back, {currentUser?.firstName || currentUser?.username}!</h2>
        <p>Here's an overview of your account activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-2 mb-4">
        <div className="card text-center">
          <h3 style={{ color: "#007bff", fontSize: "2rem" }}>{stats.totalBookings}</h3>
          <p>Total Bookings</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: "#ffc107", fontSize: "2rem" }}>{stats.pendingBookings}</h3>
          <p>Pending Bookings</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: "#28a745", fontSize: "2rem" }}>{stats.completedBookings}</h3>
          <p>Completed Bookings</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: "#17a2b8", fontSize: "2rem" }}>${stats.totalRevenue.toFixed(2)}</h3>
          <p>{currentUser?.role === "CUSTOMER" ? "Total Spent" : "Total Revenue"}</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <h3>Recent Bookings</h3>
        {recentBookings.length === 0 ? (
          <p>No recent bookings found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "10px", textAlign: "left" }}>Service</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Amount</th>
                  {currentUser?.role === "CUSTOMER" && <th style={{ padding: "10px", textAlign: "left" }}>Provider</th>}
                  {currentUser?.role === "PROVIDER" && <th style={{ padding: "10px", textAlign: "left" }}>Customer</th>}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>{booking.service?.name}</td>
                    <td style={{ padding: "10px" }}>{booking.bookingDate}</td>
                    <td style={{ padding: "10px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor: getStatusColor(booking.status),
                          color: "white",
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}>${booking.totalAmount}</td>
                    {currentUser?.role === "CUSTOMER" && (
                      <td style={{ padding: "10px" }}>
                        {booking.provider?.firstName} {booking.provider?.lastName}
                      </td>
                    )}
                    {currentUser?.role === "PROVIDER" && (
                      <td style={{ padding: "10px" }}>
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card mt-4">
        <h3>Quick Actions</h3>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
          {currentUser?.role === "CUSTOMER" && (
            <>
              <a href="/services" className="btn btn-primary">
                Browse Services
              </a>
              <a href="/bookings" className="btn btn-secondary">
                View My Bookings
              </a>
            </>
          )}
          {currentUser?.role === "PROVIDER" && (
            <>
              <a href="/bookings" className="btn btn-primary">
                Manage Bookings
              </a>
              <button className="btn btn-secondary">Manage Services</button>
            </>
          )}
          {currentUser?.role === "ADMIN" && (
            <>
              <a href="/bookings" className="btn btn-primary">
                All Bookings
              </a>
              <button className="btn btn-secondary">Manage Users</button>
              <button className="btn btn-secondary">System Settings</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "#ffc107"
    case "CONFIRMED":
      return "#28a745"
    case "IN_PROGRESS":
      return "#007bff"
    case "COMPLETED":
      return "#6c757d"
    case "CANCELLED":
      return "#dc3545"
    default:
      return "#6c757d"
  }
}

export default Dashboard
