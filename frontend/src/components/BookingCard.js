"use client"

const BookingCard = ({ booking, onStatusUpdate, showActions = false }) => {
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

  const handleStatusChange = (newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(booking.id, newStatus)
    }
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
        <h3>{booking.service?.name}</h3>
        <span
          style={{
            backgroundColor: getStatusColor(booking.status),
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          {booking.status}
        </span>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Date:</strong> {booking.bookingDate}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Time:</strong> {booking.bookingTime}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Amount:</strong> ${booking.totalAmount}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Customer:</strong> {booking.customer?.firstName} {booking.customer?.lastName}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Provider:</strong> {booking.provider?.firstName} {booking.provider?.lastName}
      </div>

      {booking.specialInstructions && (
        <div style={{ marginBottom: "15px" }}>
          <strong>Special Instructions:</strong>
          <p style={{ marginTop: "5px", fontStyle: "italic" }}>{booking.specialInstructions}</p>
        </div>
      )}

      {showActions && booking.status === "PENDING" && (
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => handleStatusChange("CONFIRMED")} className="btn btn-success">
            Accept
          </button>
          <button onClick={() => handleStatusChange("CANCELLED")} className="btn btn-danger">
            Reject
          </button>
        </div>
      )}

      {showActions && booking.status === "CONFIRMED" && (
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => handleStatusChange("IN_PROGRESS")} className="btn btn-primary">
            Start Service
          </button>
        </div>
      )}

      {showActions && booking.status === "IN_PROGRESS" && (
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => handleStatusChange("COMPLETED")} className="btn btn-success">
            Complete Service
          </button>
        </div>
      )}
    </div>
  )
}

export default BookingCard
