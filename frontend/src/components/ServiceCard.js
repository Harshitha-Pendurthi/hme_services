import { Link } from "react-router-dom"

const ServiceCard = ({ service }) => {
  return (
    <div className="card">
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      <div style={{ marginBottom: "10px" }}>
        <strong>Price: ${service.price}</strong>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <span>Duration: {service.durationMinutes} minutes</span>
      </div>
      <div style={{ marginBottom: "15px" }}>
        <span>
          Provider: {service.provider?.firstName} {service.provider?.lastName}
        </span>
      </div>
      <Link to={`/services/${service.id}`} className="btn btn-primary">
        View Details
      </Link>
    </div>
  )
}

export default ServiceCard
