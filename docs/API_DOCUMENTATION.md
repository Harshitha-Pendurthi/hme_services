# API Documentation

## Base URL
\`\`\`
http://localhost:8080/api
\`\`\`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Authentication Endpoints

### POST /auth/signin
Login with username and password.

**Request Body:**
\`\`\`json
{
  "username": "string",
  "password": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER"
}
\`\`\`

### POST /auth/signup
Register a new user account.

**Request Body:**
\`\`\`json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "address": "string",
  "role": "CUSTOMER" // or "PROVIDER"
}
\`\`\`

**Response:**
\`\`\`json
"User registered successfully!"
\`\`\`

## Service Category Endpoints

### GET /categories
Get all active service categories.

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "name": "Plumbing",
    "description": "Professional plumbing services",
    "icon": "plumbing",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00"
  }
]
\`\`\`

### GET /categories/{id}
Get a specific category by ID.

**Response:**
\`\`\`json
{
  "id": 1,
  "name": "Plumbing",
  "description": "Professional plumbing services",
  "icon": "plumbing",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00"
}
\`\`\`

## Service Endpoints

### GET /services
Get all available services.

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "name": "Pipe Repair",
    "description": "Professional pipe repair service",
    "price": 150.00,
    "durationMinutes": 120,
    "isAvailable": true,
    "provider": {
      "id": 3,
      "firstName": "Mike",
      "lastName": "Johnson",
      "email": "mike@plumbing.com"
    },
    "category": {
      "id": 1,
      "name": "Plumbing"
    }
  }
]
\`\`\`

### GET /services/{id}
Get a specific service by ID.

### GET /services/category/{categoryId}
Get all services in a specific category.

### POST /services
Create a new service (Provider/Admin only).

**Request Body:**
\`\`\`json
{
  "name": "string",
  "description": "string",
  "price": 100.00,
  "durationMinutes": 60,
  "categoryId": 1
}
\`\`\`

### PUT /services/{id}
Update an existing service (Provider/Admin only).

### DELETE /services/{id}
Delete a service (Provider/Admin only).

## Booking Endpoints

### GET /bookings
Get user's bookings (filtered by role).

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "bookingDate": "2024-01-15",
    "bookingTime": "10:00:00",
    "status": "PENDING",
    "totalAmount": 150.00,
    "specialInstructions": "Please call before arriving",
    "customer": {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe"
    },
    "provider": {
      "id": 3,
      "firstName": "Mike",
      "lastName": "Johnson"
    },
    "service": {
      "id": 1,
      "name": "Pipe Repair"
    }
  }
]
\`\`\`

### GET /bookings/{id}
Get a specific booking by ID.

### POST /bookings
Create a new booking (Customer only).

**Request Body:**
\`\`\`json
{
  "serviceId": 1,
  "bookingDate": "2024-01-15",
  "bookingTime": "10:00:00",
  "specialInstructions": "Please call before arriving"
}
\`\`\`

### PUT /bookings/{id}/status
Update booking status (Provider/Admin only).

**Query Parameters:**
- `status`: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

## Error Responses

### 400 Bad Request
\`\`\`json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": ["Field 'email' is required"]
}
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
\`\`\`

### 403 Forbidden
\`\`\`json
{
  "error": "Forbidden",
  "message": "Access denied"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "error": "Not Found",
  "message": "Resource not found"
}
\`\`\`

### 500 Internal Server Error
\`\`\`json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
\`\`\`

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20, max: 100)
- `sort`: Sort field and direction (e.g., `createdAt,desc`)

**Response Headers:**
- `X-Total-Count`: Total number of items
- `X-Total-Pages`: Total number of pages

## Filtering and Search

### Services
- `GET /services?category=1` - Filter by category
- `GET /services/search?keyword=plumbing` - Search by keyword

### Bookings
- `GET /bookings?status=PENDING` - Filter by status
- `GET /bookings?date=2024-01-15` - Filter by date
