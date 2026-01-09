# 🔗 Panduan Integrasi LOGe dengan TitikTemu Event Service

**Versi:** 1.1.0  
**Tanggal:** Januari 2026  
**Untuk:** Tim LOGe System

---

## 📋 Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Autentikasi](#autentikasi)
3. [Base URL](#base-url)
4. [Endpoint yang Tersedia](#endpoint-yang-tersedia)
5. [Contoh Penggunaan](#contoh-penggunaan)
6. [Format Response](#format-response)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 📌 Gambaran Umum

TitikTemu Event Service menyediakan **Public API** yang memungkinkan sistem LOGe untuk:

- ✅ Mengambil daftar semua event
- ✅ Mengambil detail event berdasarkan ID
- ✅ Mengambil event yang memiliki booking venue
- ✅ Melihat informasi booking venue yang terkait dengan event

**Tidak perlu JWT Token!** LOGe hanya perlu menggunakan **API Key** untuk autentikasi.

---

## 🔐 Autentikasi

### API Key Authentication

Semua request ke Public API memerlukan header autentikasi:

```http
X-LOGE-API-Key: your-shared-secret-key
```

### Cara Mendapatkan API Key

1. Hubungi tim TitikTemu Backend
2. Dapatkan **LOGE_INCOMING_API_KEY** yang telah dikonfigurasi
3. Simpan API key dengan aman (jangan commit ke Git!)
4. Gunakan API key pada setiap request

### Contoh Request dengan API Key

```bash
curl -H "X-LOGE-API-Key: your-shared-secret-key" \
  http://localhost:3002/api/public/events
```

---

## 🌐 Base URL

### Development

```
http://localhost:3002/api/public
```

### Production (sesuaikan dengan deployment)

```
https://api.titiktemu.com/api/public
```

**Catatan:** Event Service berjalan pada **port 3002** dan dapat diakses langsung tanpa melalui Gateway.

---

## 📡 Endpoint yang Tersedia

### 1. Get All Events

**Endpoint:** `GET /events`

**Deskripsi:** Mengambil daftar semua event yang dipublikasikan

**Query Parameters:**

| Parameter | Type    | Default     | Deskripsi                         |
| --------- | ------- | ----------- | --------------------------------- |
| `status`  | String  | `PUBLISHED` | Filter berdasarkan status event   |
| `page`    | Integer | `1`         | Nomor halaman untuk pagination    |
| `limit`   | Integer | `50`        | Jumlah item per halaman (max 100) |

**Contoh Request:**

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
        "description": "Workshop tentang microservices",
        "date": "2025-02-15T00:00:00.000Z",
        "startTime": "09:00",
        "endTime": "17:00",
        "location": "Main Building - Room 301",
        "venueId": "1",
        "venueName": "Main Building",
        "roomId": "3",
        "roomName": "Room 301",
        "venueBookingId": "booking-uuid-123",
        "capacity": 50,
        "participantCount": 30,
        "status": "PUBLISHED",
        "createdBy": "user-uuid",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get Event by ID

**Endpoint:** `GET /events/:id`

**Deskripsi:** Mengambil detail event berdasarkan ID

**Path Parameters:**

| Parameter | Type          | Required | Deskripsi                   |
| --------- | ------------- | -------- | --------------------------- |
| `id`      | String (UUID) | ✅       | ID event yang ingin diambil |

**Contoh Request:**

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
    "description": "Workshop tentang microservices",
    "date": "2025-02-15T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "17:00",
    "location": "Main Building - Room 301",
    "venueId": "1",
    "venueName": "Main Building",
    "roomId": "3",
    "roomName": "Room 301",
    "venueBookingId": "booking-uuid-123",
    "capacity": 50,
    "participantCount": 30,
    "status": "PUBLISHED",
    "organizerId": "user-uuid-123",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-05T10:30:00.000Z"
  }
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Event not found"
}
```

---

### 3. Get Venue Bookings

**Endpoint:** `GET /venue-bookings`

**Deskripsi:** Mengambil semua event yang memiliki booking venue dari LOGe

**Query Parameters:**

| Parameter   | Type                | Required | Deskripsi                            |
| ----------- | ------------------- | -------- | ------------------------------------ |
| `venueId`   | String              | ❌       | Filter berdasarkan venue ID tertentu |
| `startDate` | String (YYYY-MM-DD) | ❌       | Filter event mulai dari tanggal ini  |
| `endDate`   | String (YYYY-MM-DD) | ❌       | Filter event sampai tanggal ini      |
| `page`      | Integer             | ❌       | Nomor halaman (default: 1)           |
| `limit`     | Integer             | ❌       | Item per halaman (default: 50)       |

**Contoh Request:**

```bash
# Ambil semua venue bookings
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/venue-bookings"

# Filter berdasarkan venue ID
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/venue-bookings?venueId=1"

# Filter berdasarkan tanggal
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/venue-bookings?venueId=1&startDate=2025-02-01&endDate=2025-02-28"
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
        "startDate": "2025-02-15T00:00:00.000Z",
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

## 💡 Contoh Penggunaan

### JavaScript/Node.js

```javascript
const axios = require("axios");

const TITIKTEMU_API_KEY = "your-shared-secret-key";
const BASE_URL = "http://localhost:3002/api/public";

// Function untuk mengambil semua events
async function getAllEvents() {
  try {
    const response = await axios.get(`${BASE_URL}/events`, {
      headers: {
        "X-LOGE-API-Key": TITIKTEMU_API_KEY,
      },
      params: {
        status: "PUBLISHED",
        page: 1,
        limit: 20,
      },
    });

    console.log("Events:", response.data.data.events);
    return response.data.data.events;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error;
  }
}

// Function untuk mengambil event by ID
async function getEventById(eventId) {
  try {
    const response = await axios.get(`${BASE_URL}/events/${eventId}`, {
      headers: {
        "X-LOGE-API-Key": TITIKTEMU_API_KEY,
      },
    });

    return response.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log("Event tidak ditemukan");
      return null;
    }
    throw error;
  }
}

// Function untuk mengambil venue bookings
async function getVenueBookings(venueId, startDate, endDate) {
  try {
    const response = await axios.get(`${BASE_URL}/venue-bookings`, {
      headers: {
        "X-LOGE-API-Key": TITIKTEMU_API_KEY,
      },
      params: {
        venueId,
        startDate,
        endDate,
        page: 1,
        limit: 50,
      },
    });

    return response.data.data.bookings;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error;
  }
}

// Contoh penggunaan
getAllEvents();
getEventById("48ab8a5e-f674-48b8-a71f-9f311920e930");
getVenueBookings("1", "2025-02-01", "2025-02-28");
```

---

### Python

```python
import requests
from datetime import datetime

TITIKTEMU_API_KEY = 'your-shared-secret-key'
BASE_URL = 'http://localhost:3002/api/public'

def get_all_events(status='PUBLISHED', page=1, limit=20):
    """Mengambil semua events"""
    headers = {
        'X-LOGE-API-Key': TITIKTEMU_API_KEY
    }
    params = {
        'status': status,
        'page': page,
        'limit': limit
    }

    try:
        response = requests.get(
            f'{BASE_URL}/events',
            headers=headers,
            params=params
        )
        response.raise_for_status()
        return response.json()['data']['events']
    except requests.exceptions.HTTPError as e:
        print(f'Error: {e.response.json()}')
        raise

def get_event_by_id(event_id):
    """Mengambil event berdasarkan ID"""
    headers = {
        'X-LOGE-API-Key': TITIKTEMU_API_KEY
    }

    try:
        response = requests.get(
            f'{BASE_URL}/events/{event_id}',
            headers=headers
        )
        response.raise_for_status()
        return response.json()['data']
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            print('Event tidak ditemukan')
            return None
        raise

def get_venue_bookings(venue_id=None, start_date=None, end_date=None):
    """Mengambil venue bookings"""
    headers = {
        'X-LOGE-API-Key': TITIKTEMU_API_KEY
    }
    params = {}

    if venue_id:
        params['venueId'] = venue_id
    if start_date:
        params['startDate'] = start_date
    if end_date:
        params['endDate'] = end_date

    try:
        response = requests.get(
            f'{BASE_URL}/venue-bookings',
            headers=headers,
            params=params
        )
        response.raise_for_status()
        return response.json()['data']['bookings']
    except requests.exceptions.HTTPError as e:
        print(f'Error: {e.response.json()}')
        raise

# Contoh penggunaan
if __name__ == '__main__':
    # Ambil semua events
    events = get_all_events()
    print(f'Total events: {len(events)}')

    # Ambil event by ID
    event = get_event_by_id('48ab8a5e-f674-48b8-a71f-9f311920e930')
    if event:
        print(f'Event: {event["title"]}')

    # Ambil venue bookings
    bookings = get_venue_bookings(
        venue_id='1',
        start_date='2025-02-01',
        end_date='2025-02-28'
    )
    print(f'Total bookings: {len(bookings)}')
```

---

### cURL (Bash)

```bash
#!/bin/bash

API_KEY="your-shared-secret-key"
BASE_URL="http://localhost:3002/api/public"

# Function untuk GET request
titiktemu_get() {
    local endpoint=$1
    curl -s -H "X-LOGE-API-Key: $API_KEY" \
         "${BASE_URL}${endpoint}"
}

# Ambil semua events
echo "=== All Events ==="
titiktemu_get "/events?status=PUBLISHED&limit=10" | jq .

# Ambil event by ID
echo -e "\n=== Event by ID ==="
EVENT_ID="48ab8a5e-f674-48b8-a71f-9f311920e930"
titiktemu_get "/events/${EVENT_ID}" | jq .

# Ambil venue bookings
echo -e "\n=== Venue Bookings ==="
titiktemu_get "/venue-bookings?venueId=1&startDate=2025-02-01" | jq .
```

---

## 📊 Format Response

### Success Response

Semua response sukses mengikuti format:

```json
{
  "success": true,
  "data": {
    // Data yang diminta
  }
}
```

### Error Response

Semua response error mengikuti format:

```json
{
  "success": false,
  "message": "Pesan error"
}
```

### Field Event

| Field              | Type              | Nullable | Deskripsi                                 |
| ------------------ | ----------------- | -------- | ----------------------------------------- |
| `id`               | String (UUID)     | ❌       | ID unik event                             |
| `title`            | String            | ❌       | Judul event                               |
| `description`      | String            | ✅       | Deskripsi event                           |
| `date`             | String (ISO 8601) | ❌       | Tanggal event                             |
| `startTime`        | String (HH:mm)    | ❌       | Waktu mulai                               |
| `endTime`          | String (HH:mm)    | ❌       | Waktu selesai                             |
| `location`         | String            | ✅       | Lokasi event                              |
| `venueId`          | String            | ✅       | ID venue dari LOGe                        |
| `venueName`        | String            | ✅       | Nama venue (cached)                       |
| `roomId`           | String            | ✅       | ID ruangan dari LOGe                      |
| `roomName`         | String            | ✅       | Nama ruangan (cached)                     |
| `venueBookingId`   | String (UUID)     | ✅       | ID booking di LOGe                        |
| `capacity`         | Integer           | ❌       | Kapasitas peserta                         |
| `participantCount` | Integer           | ❌       | Jumlah peserta terdaftar                  |
| `status`           | String            | ❌       | Status: `DRAFT`, `PUBLISHED`, `CANCELLED` |
| `createdBy`        | String (UUID)     | ❌       | ID pembuat event                          |
| `createdAt`        | String (ISO 8601) | ❌       | Waktu dibuat                              |
| `updatedAt`        | String (ISO 8601) | ✅       | Waktu terakhir diupdate                   |

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Status                | Deskripsi                          |
| ---- | --------------------- | ---------------------------------- |
| 200  | OK                    | Request berhasil                   |
| 400  | Bad Request           | Parameter tidak valid              |
| 401  | Unauthorized          | API key tidak valid atau tidak ada |
| 404  | Not Found             | Resource tidak ditemukan           |
| 500  | Internal Server Error | Error di server                    |
| 503  | Service Unavailable   | Service sedang maintenance         |

### Contoh Error Responses

**401 - Invalid API Key:**

```json
{
  "success": false,
  "message": "Invalid API key"
}
```

**404 - Event Not Found:**

```json
{
  "success": false,
  "message": "Event not found"
}
```

**500 - Internal Server Error:**

```json
{
  "success": false,
  "message": "Internal server error"
}
```

### Handling Errors (JavaScript)

```javascript
async function getEventWithErrorHandling(eventId) {
  try {
    const response = await axios.get(`${BASE_URL}/events/${eventId}`, {
      headers: { "X-LOGE-API-Key": API_KEY },
    });
    return response.data.data;
  } catch (error) {
    if (error.response) {
      // Server meresponse dengan error status
      switch (error.response.status) {
        case 401:
          console.error("API key tidak valid");
          break;
        case 404:
          console.error("Event tidak ditemukan");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("Error:", error.response.data.message);
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      console.error("Tidak ada response dari server");
    } else {
      // Error saat setup request
      console.error("Error:", error.message);
    }
    return null;
  }
}
```

---

## ✅ Best Practices

### 1. Keamanan API Key

```javascript
// ❌ JANGAN seperti ini
const API_KEY = "your-api-key-123"; // Hardcoded

// ✅ Gunakan environment variable
const API_KEY = process.env.TITIKTEMU_API_KEY;
```

### 2. Implementasi Retry Logic

```javascript
async function getEventsWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`${BASE_URL}/events`, {
        headers: { "X-LOGE-API-Key": API_KEY },
      });
      return response.data.data.events;
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Wait sebelum retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}
```

### 3. Caching Response

```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

async function getEventCached(eventId) {
  const cacheKey = `event_${eventId}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const event = await getEventById(eventId);
  cache.set(cacheKey, {
    data: event,
    timestamp: Date.now(),
  });

  return event;
}
```

### 4. Pagination

```javascript
async function getAllEventsWithPagination() {
  const allEvents = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await axios.get(`${BASE_URL}/events`, {
      headers: { "X-LOGE-API-Key": API_KEY },
      params: { page, limit: 50 },
    });

    const { events, pagination } = response.data.data;
    allEvents.push(...events);

    hasMore = page < pagination.totalPages;
    page++;
  }

  return allEvents;
}
```

### 5. Rate Limiting

```javascript
const { RateLimiter } = require("limiter");

// Maksimal 100 requests per menit
const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: "minute",
});

async function getEventsRateLimited() {
  await limiter.removeTokens(1);
  return await getEvents();
}
```

---

## 🔧 Troubleshooting

### 1. "Invalid API key" Error

**Penyebab:**

- API key salah atau tidak ada
- Header tidak dikirim dengan benar
- API key expired (jika ada expiry)

**Solusi:**

```bash
# Pastikan header dikirim dengan benar
curl -v -H "X-LOGE-API-Key: your-key" \
  http://localhost:3002/api/public/events

# Periksa environment variable
echo $TITIKTEMU_API_KEY

# Hubungi tim TitikTemu untuk validasi API key
```

### 2. Connection Timeout

**Penyebab:**

- Event Service tidak berjalan
- Network issue
- Firewall blocking

**Solusi:**

```bash
# Cek apakah service berjalan
curl http://localhost:3002/health

# Cek network connectivity
ping titiktemu-server.com

# Gunakan timeout lebih besar
curl --max-time 30 -H "X-LOGE-API-Key: your-key" \
  http://localhost:3002/api/public/events
```

### 3. Empty Response

**Penyebab:**

- Tidak ada event dengan filter yang diberikan
- Database kosong

**Solusi:**

```bash
# Cek tanpa filter
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/events"

# Cek dengan status DRAFT
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/events?status=DRAFT"
```

### 4. "Event not found" (404)

**Penyebab:**

- Event ID salah
- Event sudah dihapus
- Event belum dipublikasikan

**Solusi:**

```bash
# Validasi format UUID
# UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Ambil list events terlebih dahulu
curl -H "X-LOGE-API-Key: your-key" \
  "http://localhost:3002/api/public/events" | jq '.data.events[].id'
```

---

## 📞 Dukungan

### Kontak Tim TitikTemu

- **Email:** backend@titiktemu.com
- **Slack Channel:** #loge-integration
- **Issue Tracker:** https://github.com/titiktemu/backend/issues

### Informasi Penting

- **API Documentation:** `/docs/TITIKTEMU_PUBLIC_API.md`
- **Service Status:** http://localhost:3002/health
- **Changelog:** `/docs/API.md`

### Melaporkan Issue

Saat melaporkan masalah, sertakan:

1. **Request yang dikirim** (cURL atau code snippet)
2. **Response yang diterima**
3. **Expected behavior**
4. **Timestamp** kejadian
5. **Environment** (development/production)

**Contoh:**

```
# Request
curl -H "X-LOGE-API-Key: xxx" \
  http://localhost:3002/api/public/events/abc-123

# Response
{
  "success": false,
  "message": "Event not found"
}

# Expected: Event dengan ID abc-123 seharusnya ada
# Timestamp: 2026-01-07 14:30:00 WIB
# Environment: Development
```

---

## 📚 Referensi Tambahan

### Dokumentasi Terkait

- [API Documentation](./API.md) - Dokumentasi lengkap semua endpoints
- [Architecture Documentation](./ARCHITECTURE.md) - Arsitektur sistem
- [Setup Guide](./SETUP.md) - Cara setup development environment

### Integrasi Venue Booking

Ketika TitikTemu membuat event dengan venue dari LOGe:

1. ✅ TitikTemu validasi venue dan room exist di LOGe
2. ✅ TitikTemu cek ketersediaan room
3. ✅ TitikTemu buat booking di LOGe
4. ✅ Event dibuat dengan `venueBookingId` reference
5. ✅ LOGe dapat fetch event data via Public API

**Flow Diagram:**

```
Admin TitikTemu
    ↓
Create Event with Venue
    ↓
TitikTemu → LOGe (Check Availability)
    ↓
TitikTemu → LOGe (Create Booking)
    ↓
Event Created (with venueBookingId)
    ↓
LOGe ← TitikTemu (Fetch Event via Public API)
```

---

## 🎯 Kesimpulan

Public API TitikTemu Event Service menyediakan akses mudah untuk LOGe mengambil data event:

✅ **Autentikasi sederhana** dengan API key  
✅ **Tidak perlu JWT token**  
✅ **Response format konsisten**  
✅ **Error handling yang jelas**  
✅ **Dokumentasi lengkap**

**Selamat mengintegrasikan!** 🚀

---

**Dokumen ini akan diupdate seiring perkembangan API.**

_Last updated: 7 Januari 2026_
