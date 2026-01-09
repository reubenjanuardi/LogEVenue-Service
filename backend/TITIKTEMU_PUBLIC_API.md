# 📤 TitikTemu Public API - For LOGe Integration

This document describes the public API endpoints that the external **LOGe system** can use to consume TitikTemu event and attendance data.

---

## 🔐 Authentication

All requests to the public API require an API key in the header:

```http
X-LOGE-API-Key: your-shared-secret-key
```

**Example:**

```bash
curl -H "X-LOGE-API-Key: your-shared-secret-key" \
  http://localhost:3002/api/public/events
```

---

## 📍 Base URL

**Development:**

```
http://localhost:3002/api/public
```

**Production:**

```
https://titiktemu.example.com/api/public
```

---

## 📋 Endpoints

### 1. Get All Events

**GET** `/events`

Get all upcoming published events.

**Query Parameters:**

- `status` (optional, default: `PUBLISHED`) - Filter by event status
- `page` (optional, default: `1`) - Page number for pagination
- `limit` (optional, default: `50`) - Items per page (max 100)

**Example Request:**

```bash
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/events?status=PUBLISHED&page=1&limit=20"
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "48ab8a5e-f674-48b8-a71f-9f311920e930",
        "title": "Tech Workshop 2025",
        "description": "Learn microservices architecture and GraphQL",
        "startDate": "2025-02-15T09:00:00.000Z",
        "startTime": "09:00",
        "endTime": "17:00",
        "venueId": "1",
        "venueName": "Main Building",
        "roomId": "3",
        "roomName": "Room 301",
        "venueBookingId": "booking-uuid-123",
        "location": "Main Building - Room 301",
        "capacity": 50,
        "participantCount": 30,
        "status": "PUBLISHED",
        "organizerId": "user-uuid-123",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2
    }
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Invalid API key"
}
```

---

### 2. Get Single Event

**GET** `/events/:id`

Get detailed information about a specific event.

**Path Parameters:**

- `id` (required) - Event UUID

**Example Request:**

```bash
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/events/48ab8a5e-f674-48b8-a71f-9f311920e930"
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "48ab8a5e-f674-48b8-a71f-9f311920e930",
    "title": "Tech Workshop 2025",
    "description": "Learn microservices architecture and GraphQL",
    "startDate": "2025-02-15T09:00:00.000Z",
    "startTime": "09:00",
    "endTime": "17:00",
    "venueId": "1",
    "venueName": "Main Building",
    "roomId": "3",
    "roomName": "Room 301",
    "venueBookingId": "booking-uuid-123",
    "location": "Main Building - Room 301",
    "capacity": 50,
    "participantCount": 30,
    "status": "PUBLISHED",
    "organizerId": "user-uuid-123",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "error": "Event not found"
}
```

---

### 3. Get Venue Bookings

**GET** `/venue-bookings`

Get all events that have venues assigned (venue bookings).

**Query Parameters:**

- `venueId` (optional) - Filter by specific venue ID
- `startDate` (optional) - Filter events from this date (YYYY-MM-DD)
- `endDate` (optional) - Filter events until this date (YYYY-MM-DD)

**Example Request:**

```bash
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/venue-bookings?venueId=venue-1&startDate=2025-02-01&endDate=2025-02-28"
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "eventId": "48ab8a5e-f674-48b8-a71f-9f311920e930",
        "eventTitle": "Tech Workshop 2025",
        "venueId": "1",
        "venueName": "Main Building",
        "roomId": "3",
        "roomName": "Room 301",
        "venueBookingId": "booking-uuid-123",
        "startDate": "2025-02-15T09:00:00.000Z",
        "startTime": "09:00",
        "endTime": "17:00",
        "participantCount": 30,
        "capacity": 50,
        "status": "PUBLISHED"
      }
    ],
    "total": 5
  }
}
```

---

### 4. Get Event Attendance

**GET** `/attendance/:eventId`

Get attendance data (check-ins) for a specific event.

**Path Parameters:**

- `eventId` (required) - Event UUID

**Example Request:**

```bash
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/attendance/48ab8a5e-f674-48b8-a71f-9f311920e930"
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "eventId": "48ab8a5e-f674-48b8-a71f-9f311920e930",
    "attendees": [
      {
        "userId": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "checkInTime": "2025-02-15T09:05:00.000Z",
        "status": "PRESENT"
      },
      {
        "userId": "user-456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "checkInTime": "2025-02-15T09:15:00.000Z",
        "status": "PRESENT"
      }
    ],
    "statistics": {
      "totalRegistered": 50,
      "totalPresent": 30,
      "totalAbsent": 20,
      "attendanceRate": 60
    }
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "error": "Event not found"
}
```

---

### 5. Webhook: Venue Status Update

**POST** `/webhook/venue-status`

**Endpoint for LOGe to notify TitikTemu** when a venue's availability status changes.

**Request Body:**

```json
{
  "venueId": "1",
  "available": false,
  "reason": "Maintenance scheduled",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Required Fields:**

- `venueId` (string) - Unique venue identifier
- `available` (boolean) - Current availability status

**Optional Fields:**

- `reason` (string) - Reason for status change
- `timestamp` (ISO 8601) - When the status changed

**Example Request:**

```bash
curl -X POST \
  -H "X-LOGE-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "venueId": "1",
    "available": false,
    "reason": "Maintenance scheduled",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }' \
  http://localhost:3002/api/public/webhook/venue-status
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Venue status update received",
  "data": {
    "venueId": "venue-1",
    "available": false,
    "receivedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### 6. Webhook: Event Created Notification

**POST** `/webhook/event-created`

**Endpoint for TitikTemu to notify LOGe** when a new event is created with a venue assigned.

**Request Body:**

```json
{
  "eventId": "48ab8a5e-f674-48b8-a71f-9f311920e930",
  "title": "Tech Workshop 2025",
  "venueId": "venue-1",
  "startDate": "2025-02-15T09:00:00.000Z",
  "capacity": 50,
  "organizerId": "user-uuid-123"
}
```

**Required Fields:**

- `eventId` (string) - Unique event identifier
- `title` (string) - Event title

**Optional Fields:**

- `venueId` (string) - Assigned venue ID
- `startDate` (ISO 8601) - Event start date/time
- `capacity` (number) - Event capacity
- `organizerId` (string) - User ID of event organizer

**Example Request:**

```bash
curl -X POST \
  -H "X-LOGE-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "48ab8a5e-f674-48b8-a71f-9f311920e930",
    "title": "Tech Workshop 2025",
    "venueId": "venue-1",
    "startDate": "2025-02-15T09:00:00.000Z",
    "capacity": 50
  }' \
  http://localhost:3002/api/public/webhook/event-created
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Event notification received",
  "data": {
    "eventId": "48ab8a5e-f674-48b8-a71f-9f311920e930",
    "processedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 🔄 Use Cases

### Use Case 1: LOGe Dashboard Integration

**Goal:** Display TitikTemu events on LOGe dashboard

```bash
# Get upcoming events
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/events?status=PUBLISHED&limit=20"

# For each event with a venue, fetch venue bookings
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/venue-bookings?venueId=venue-1"
```

### Use Case 2: Venue Availability Sync

**Goal:** Keep LOGe informed when venues are booked/released

1. LOGe sends venue status update:

```bash
curl -X POST \
  -H "X-LOGE-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"venueId":"venue-1","available":false,"reason":"Event booked"}' \
  http://localhost:3002/api/public/webhook/venue-status
```

2. TitikTemu creates event with venue:

```bash
curl -X POST \
  -H "X-LOGE-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"event-1","title":"Workshop","venueId":"venue-1","startDate":"2025-02-15T09:00:00Z"}' \
  http://localhost:3002/api/public/webhook/event-created
```

### Use Case 3: Attendance Reporting

**Goal:** Send event attendance data to LOGe for reporting

```bash
# Get attendance for event
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/attendance/event-id-123"

# Parse response and send to LOGe reporting system
```

---

## ⚠️ Error Handling

All endpoints return standard error responses:

**400 Bad Request - Missing Required Fields:**

```json
{
  "success": false,
  "error": "venueId is required"
}
```

**401 Unauthorized - Invalid API Key:**

```json
{
  "success": false,
  "error": "Invalid API key"
}
```

**404 Not Found - Resource not found:**

```json
{
  "success": false,
  "error": "Event not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to fetch events"
}
```

---

## 🔐 Security Notes

1. **Always use HTTPS in production** - Never send API keys over HTTP
2. **Rotate API keys periodically** - Update `LOGE_INCOMING_API_KEY` regularly
3. **Rate limiting** - Consider implementing rate limits to prevent abuse
4. **IP whitelisting** - Optionally restrict requests to known LOGe IP addresses
5. **Audit logging** - Log all requests from LOGe for security monitoring

---

## 🏢 Venue Booking Integration

### Overview

TitikTemu automatically integrates with LOGe's venue management system when events are created with venue assignments. The integration provides:

- **Automatic booking creation** in LOGe when an event is created
- **Real-time availability checking** before booking
- **Automatic cancellation** when event is deleted
- **Rollback mechanism** if event creation fails

### Event Response Fields

When an event has a venue booking, the response includes:

| Field            | Type   | Description                         |
| ---------------- | ------ | ----------------------------------- |
| `venueId`        | String | Venue ID from LOGe system           |
| `venueName`      | String | Venue name (cached from LOGe)       |
| `roomId`         | String | Room ID from LOGe system            |
| `roomName`       | String | Room name (cached from LOGe)        |
| `venueBookingId` | String | Booking reference ID in LOGe system |
| `location`       | String | Format: "{venueName} - {roomName}"  |

### Example: Event with Venue Booking

```json
{
  "id": "event-uuid",
  "title": "AI Workshop 2025",
  "date": "2025-02-20T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "12:00",
  "venueId": "1",
  "venueName": "Main Building",
  "roomId": "3",
  "roomName": "Room 301",
  "venueBookingId": "booking-uuid-123",
  "location": "Main Building - Room 301",
  "capacity": 50,
  "status": "PUBLISHED"
}
```

### Booking Lifecycle

1. **Event Created** → Booking created in LOGe (via venue-consumer-service)
2. **Event Updated** → Booking details remain unchanged (manual update in LOGe if needed)
3. **Event Deleted** → Booking automatically cancelled in LOGe
4. **Event Creation Failed** → Booking automatically rolled back

### Filtering Events by Venue

Use the `/venue-bookings` endpoint to get all events for a specific venue:

```bash
# Get all events for venue "1"
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/venue-bookings?venueId=1&startDate=2025-02-01&endDate=2025-02-28"
```

This returns events with `venueBookingId` populated, indicating successful booking in LOGe.

---

## 📞 Support & Issues

- **Integration issues?** Check service logs
- **API questions?** Review this documentation
- **Need changes?** Contact TitikTemu Backend Team

---

## 📋 API Changelog

### Version 1.1.0 (Current)

- ✅ GET `/events` - List events (includes venue booking fields)
- ✅ GET `/events/:id` - Get event details (includes venue booking fields)
- ✅ GET `/venue-bookings` - List venue bookings (NEW: includes roomId, roomName, venueBookingId)
- ✅ GET `/attendance/:eventId` - Get attendance data
- ✅ POST `/webhook/venue-status` - Receive venue updates
- ✅ POST `/webhook/event-created` - Receive event notifications
- 🆕 **Automatic venue booking integration** with LOGe system

### Version 1.0.0

- Initial public API release
- Basic event and attendance endpoints
