# 📚 TitikTemu Backend - API Documentation

## Overview

TitikTemu Backend provides both **REST API** and **GraphQL API** interfaces.

- **REST API Base URL:** `http://localhost:3000/api`
- **GraphQL Endpoint:** `http://localhost:3000/graphql`

---

## 🔐 Authentication

All protected endpoints require JWT authentication.

### Headers

```
Authorization: Bearer <your-jwt-token>
```

### Obtaining a Token

1. Register a new user or login
2. Include the returned token in subsequent requests

---

## 📡 REST API Endpoints

### Auth Service (`/api/auth`)

| Method | Endpoint             | Description              | Auth |
| ------ | -------------------- | ------------------------ | ---- |
| POST   | `/api/auth/register` | Register new user        | No   |
| POST   | `/api/auth/login`    | User login               | No   |
| POST   | `/api/auth/validate` | Validate token           | No   |
| GET    | `/api/auth/profile`  | Get current user profile | Yes  |

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER"  // or "ADMIN"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "jwt-token"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### Event Service (`/api/events`)

**Note:** For external systems (like LOGe) to access event data, use the Public API endpoints at `/api/public/events` with `X-LOGE-API-Key` header instead of JWT authentication.

| Method | Endpoint                       | Description                                | Auth  |
| ------ | ------------------------------ | ------------------------------------------ | ----- |
| GET    | `/api/events`                  | Get all events                             | No    |
| GET    | `/api/events/:id`              | Get event by ID                            | No    |
| POST   | `/api/events`                  | Create event (with optional venue booking) | Admin |
| PUT    | `/api/events/:id`              | Update event                               | Admin |
| DELETE | `/api/events/:id`              | Delete event (cancels venue booking)       | Admin |
| POST   | `/api/events/:id/register`     | Register for event                         | Yes   |
| GET    | `/api/events/:id/participants` | Get participants                           | Admin |

#### Create Event

```http
POST /api/events
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Tech Workshop 2025",
  "description": "Learn about microservices",
  "date": "2025-02-15T09:00:00Z",
  "startTime": "09:00",
  "endTime": "17:00",
  "location": "Aula Utama",  // Optional: auto-set if venue is selected
  "venueId": "1",            // Optional: Venue ID from LOGe
  "roomId": "3",             // Optional: Room ID from LOGe (required if venueId is provided)
  "capacity": 100            // Optional: defaults to room capacity if venue is selected
}
```

**Request Fields:**

- `title` (required): Event title
- `description` (optional): Event description
- `date` (required): Event date (ISO 8601 format)
- `startTime` (required): Start time (HH:mm format)
- `endTime` (required): End time (HH:mm format)
- `venueId` (optional): Venue ID from LOGe system. If provided, `roomId` is required
- `roomId` (optional): Room ID from LOGe system. Required if `venueId` is provided
- `location` (optional): Location description. Auto-set to "{venueName} - {roomName}" if venue is selected
- `capacity` (optional): Event capacity. Defaults to room capacity (max 500) if venue is selected

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "uuid",
    "title": "Tech Workshop 2025",
    "description": "Learn about microservices",
    "date": "2025-02-15T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "17:00",
    "location": "Main Building - Room 301",
    "venueId": "1",
    "venueName": "Main Building",
    "roomId": "3",
    "roomName": "Room 301",
    "venueBookingId": "booking-uuid", // Booking reference from LOGe
    "capacity": 50,
    "status": "PUBLISHED",
    "createdBy": "user-uuid",
    "createdAt": "2025-01-07T00:00:00.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request - Venue not found:**

```json
{
  "success": false,
  "message": "Venue with ID 999 not found"
}
```

- **400 Bad Request - Room not found:**

```json
{
  "success": false,
  "message": "Room with ID 999 not found in venue"
}
```

- **400 Bad Request - Room unavailable:**

```json
{
  "success": false,
  "message": "Room is already booked for the selected time"
}
```

- **409 Conflict - Duplicate event:**

```json
{
  "success": false,
  "message": "Event with the same title and date already exists"
}
```

**Venue Booking Flow:**

1. System validates `venueId` and `roomId` exist in LOGe
2. System checks room availability for the specified time slot
3. System creates a booking in LOGe system
4. System creates the event with booking reference
5. If event creation fails, the booking is automatically cancelled (rollback)

#### Get Events

```http
GET /api/events?status=PUBLISHED&upcoming=true&page=1&limit=10
```

---

### Attendance Service (`/api/attendance`)

| Method | Endpoint                         | Description          | Auth  |
| ------ | -------------------------------- | -------------------- | ----- |
| POST   | `/api/attendance/check-in`       | Check in to event    | Yes   |
| GET    | `/api/attendance/event/:id`      | Get event attendance | Admin |
| GET    | `/api/attendance/user/:userId`   | Get user attendance  | Yes\* |
| GET    | `/api/attendance/stats/:eventId` | Get attendance stats | Admin |

\*Users can only view their own attendance

#### Check In

```http
POST /api/attendance/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "event-uuid",
  "notes": "Optional notes"
}
```

---

### Venue Service (`/api/venues`)

| Method | Endpoint                          | Description        | Auth |
| ------ | --------------------------------- | ------------------ | ---- |
| GET    | `/api/venues`                     | Get all venues     | No   |
| GET    | `/api/venues/:id`                 | Get venue by ID    | No   |
| GET    | `/api/venues/:id/availability`    | Check availability | Yes  |
| GET    | `/api/venues/logistics`           | Get logistics      | No   |
| GET    | `/api/venues/logistics/:category` | Get by category    | No   |

---

## 🏢 Venue Booking Integration

### Overview

When creating an event with a venue, the system automatically:

1. **Validates** venue and room existence in LOGe system
2. **Checks** room availability for the specified time slot
3. **Creates** a booking in LOGe system
4. **Stores** booking reference (`venueBookingId`) in the event
5. **Rolls back** the booking if event creation fails

### Event Fields Related to Venue Booking

| Field            | Type   | Description                                                 |
| ---------------- | ------ | ----------------------------------------------------------- |
| `venueId`        | String | Venue ID from LOGe system (optional)                        |
| `venueName`      | String | Cached venue name for quick access                          |
| `roomId`         | String | Room ID from LOGe system (required if venueId is set)       |
| `roomName`       | String | Cached room name                                            |
| `venueBookingId` | String | Booking reference ID from LOGe system                       |
| `location`       | String | Auto-set to "{venueName} - {roomName}" if venue is selected |

### Venue Booking Workflow

**Creating Event with Venue:**

```
1. Admin creates event with venueId and roomId
2. System validates venue and room exist
3. System checks room availability for date/time
4. System creates booking in LOGe
5. System creates event with booking reference
6. If step 5 fails → booking is automatically cancelled
```

**Deleting Event with Venue:**

```
1. Admin deletes event
2. System checks for venueBookingId
3. If exists → cancels booking in LOGe
4. System deletes event
5. Room becomes available again
```

### Error Handling

| Error            | HTTP Code | Message                                             | Action                       |
| ---------------- | --------- | --------------------------------------------------- | ---------------------------- |
| Venue not found  | 400       | "Venue with ID {id} not found"                      | Check venueId is valid       |
| Room not found   | 400       | "Room with ID {id} not found in venue"              | Check roomId exists in venue |
| Room unavailable | 400       | "Room is already booked for the selected time"      | Choose different time/room   |
| Booking failed   | 400       | "Failed to create venue booking"                    | Retry or contact admin       |
| Duplicate event  | 409       | "Event with the same title and date already exists" | Change title or date         |

---

## 🔷 GraphQL API

### Endpoint

```
POST http://localhost:3000/graphql
```

### Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <token>
```

### Queries

#### Get All Events

```graphql
query {
  events(status: PUBLISHED, upcoming: true, page: 1, limit: 10) {
    events {
      id
      title
      description
      date
      location
      capacity
      participantCount
    }
    pagination {
      page
      total
      totalPages
    }
  }
}
```

#### Get Single Event

```graphql
query {
  event(id: "event-uuid") {
    id
    title
    description
    date
    venueId
    venueName
    roomId # NEW: Room ID from LOGe
    roomName # NEW: Room name
    venueBookingId # NEW: Booking reference from LOGe
  }
}
```

#### Get Venues (from LOGe)

```graphql
query {
  venues {
    id
    name
    description
    capacity
    location
    facilities
    available
  }
}
```

#### Get Current User

```graphql
query {
  me {
    id
    email
    name
    role
  }
}
```

### Mutations

#### Register User

```graphql
mutation {
  register(input: { email: "user@example.com", password: "password123", name: "John Doe", role: USER }) {
    user {
      id
      email
      name
    }
    token
  }
}
```

#### Login

```graphql
mutation {
  login(input: { email: "user@example.com", password: "password123" }) {
    user {
      id
      email
      name
      role
    }
    token
  }
}
```

#### Create Event

```graphql
mutation {
  createEvent(
    input: {
      title: "Tech Workshop"
      description: "Learn microservices"
      date: "2025-02-15T09:00:00Z"
      startTime: "09:00"
      endTime: "17:00"
      venueId: "1" # Optional: Venue ID from LOGe
      roomId: "3" # Optional: Room ID (required if venueId is provided)
      location: "Aula Utama" # Optional: auto-set if venue is selected
      capacity: 100 # Optional: defaults to room capacity if venue is selected
    }
  ) {
    id
    title
    date
    venueId
    venueName
    roomId
    roomName
    venueBookingId # Booking reference from LOGe
  }
}
```

#### Register for Event

```graphql
mutation {
  registerForEvent(eventId: "event-uuid") {
    id
    eventId
    registeredAt
  }
}
```

#### Check In

```graphql
mutation {
  checkIn(eventId: "event-uuid", notes: "On time") {
    id
    eventId
    checkInTime
    status
  }
}
```

---

## 🏥 Health Check

```http
GET http://localhost:3000/health
```

**Response:**

```json
{
  "service": "api-gateway",
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "services": [
    { "name": "auth-service", "status": "healthy" },
    { "name": "event-service", "status": "healthy" },
    { "name": "attendance-service", "status": "healthy" },
    { "name": "venue-service", "status": "healthy" }
  ]
}
```

---

## 📋 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

### HTTP Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |
| 503  | Service Unavailable   |
