# 🔗 LOGE System - Integrated Venue & Logistics Management

Sistem LOGE adalah platform manajemen inventaris dan lokasi yang terintegrasi dengan ekosistem **TitikTemu**. Proyek ini menggunakan arsitektur microservices dengan API Gateway berbasis **GraphQL Schema Stitching**.

---

## 🛠️ Persiapan Lingkungan

Sebelum menjalankan sistem, pastikan komponen berikut sudah tersedia:
- **Node.js** (v18+)
- **MySQL** berjalan pada port **3309** (Konfigurasi di `.env` atau via Docker)
- **TitikTemu Event Service** berjalan pada port **3002** (Untuk integrasi data event)

### Langkah Setup:
1. **Clone Repository**
2. **Instal Dependensi**:
   Jalankan perintah ini di setiap folder (`auth-service`, `venue-provider`, `logistics-service`, `inventory-consumer`, `api-gateway`):
   ```bash
   npm install
   ```
3. **Konfigurasi Database**:
   Pastikan MySQL aktif, lalu jalankan setup database pada layanan berikut:
   ```bash
   # Di folder venue-provider, logistics-service, & inventory-consumer
   node setup-db.js
   node sync-db.js
   ```
4. **Environment Variables**:
   Pastikan file `.env` sudah ada di setiap folder dengan konfigurasi yang sesuai (Port, DB_HOST, DB_PORT, JWT_SECRET).

---

## 🚀 Menjalankan Layanan

Jalankan semua layanan berikut (gunakan terminal terpisah untuk setiap layanan):

1. **Auth Service**: Port 5001 (Docker) / 4001 (Manual) - *Manajemen User*
2. **Venue Provider**: Port 5002 (Docker) / 4002 (Manual) - *Manajemen Lokasi*
3. **Logistics Service**: Port 5003 (Docker) / 4003 (Manual) - *Manajemen Alat*
4. **Inventory Consumer**: Port 5004 (Docker) / 4004 (Manual) - *Analisis Kelayakan*
5. **API Gateway**: Port 5000 (Docker) / 4000 (Manual) - *Pintu Masuk Utama*

---

---

## 🌍 Menjalankan di Perangkat Lain (Portabilitas)

Untuk menjalankan sistem ini di mesin yang berbeda (misalnya, laptop rekan kerja atau server), ikuti langkah-langkah berikut:

### 1. Prasyarat
- Instal **Docker** dan **Docker Compose** di mesin target.
- Pastikan port `4000-4004`, `5000-5004`, dan `3309` kosong.

### 2. Transfer File
Salin seluruh folder proyek ke perangkat baru. Anda dapat menggunakan:
- **Git**: Push ke repositori dan `git clone` di target.
- **Zip**: Kompres folder dan ekstrak di target.

### 3. Variabel Lingkungan
Pastikan file `.env` ada di setiap folder layanan (`auth-service`, `venue-provider`, dll.).
*Catatan: Jika Anda menggunakan Git, periksa apakah file `.env` diabaikan. Anda mungkin perlu membuatnya secara manual berdasarkan `README.md` atau `.env.example`.*

### 4. Mulai Sistem
Buka terminal di folder root (di mana `docker-compose.yml` berada) dan jalankan:
```bash
docker compose up --build -d
```
Sistem akan membangun ulang semua image dan memulai container. Hanya kode sumber dan file `.env` yang diperlukan; `node_modules` tidak diperlukan karena diinstal di dalam container.

---

## 🔐 Autentikasi (JWT)

Semua layanan (kecuali Auth) memerlukan token JWT. Anda harus mendaftar dan login terlebih dahulu.

### 1. Registrasi Pengguna
**Endpoint**: `POST http://localhost:5001/api/auth/register`
**Body**:
```json
{
  "name": "admin",
  "email": "admin@example.com",
  "password": "1234567",
  "role": "admin"
}
```

### 2. Login Pengguna
**Endpoint**: `POST http://localhost:5001/api/auth/login`
**Body**:
```json
{
  "email": "admin@example.com",
  "password": "1234567"
}
```
**Simpan `token`** dari response untuk digunakan di header: `Authorization: Bearer <token>`.

---

## 📡 Dokumentasi API (GraphQL)

Akses API Gateway melalui: **`http://localhost:5000/graphql`**

### 📥 Kategori: Consume (Pengambilan Data)

Gunakan query ini untuk melihat data dalam sistem:

*   **Dapatkan Semua Venue**:
    ```graphql
    query { 
      venues { 
        id 
        name 
        address 
      } 
    }
    ```
*   **Detail Venue & Ruangan**:
    ```graphql
    query {
      venue(id: "1") {
        name
        rooms {
          name
          capacity
        }
      }
    }
    ```
*   **Cek Ketersediaan Ruangan**: 
    ```graphql
    query {
      checkRoomAvailability(roomId: "1", startTime: "2026-01-10T08:00:00Z", endTime: "2026-01-10T10:00:00Z") {
        available
        message
      }
    }
    ```
*   **Cek Slot per Jam (Tanggal)**: 
    ```graphql
    query { 
      roomAvailabilityByDate(roomId: "1", date: "2026-01-10") { 
        timeSlots { 
          startTime 
          available 
        } 
      } 
    }
    ```
*   **Dapatkan Semua Barang Logistik**: 
    ```graphql
    query { 
      items { 
        name 
        availableStock 
        totalStock 
      } 
    }
    ```
*   **Dashboard Kelayakan Event (Analyzer)**:
    ```graphql
    query {
      checkFeasibility(eventId: "101") {
        feasibility
        venue { available message room }
        logistics { available items { name status } }
      }
    }
    ```

### 🔐 Kategori: Auth (Autentikasi)

*   **Register User**:
    ```graphql
    mutation {
      register(name: "New User", email: "new@example.com", password: "password123", role: "user") {
        message
        user { id name email }
      }
    }
    ```
*   **Login User**:
    ```graphql
    mutation {
      login(email: "new@example.com", password: "password123") {
        token
        message
      }
    }
    ```

### 📤 Kategori: Provide (Penyediaan/Update Data)

Gunakan mutasi ini untuk mengubah atau menambah data:

*   **Tambah Venue Baru**:
    ```graphql
    mutation {
      addVenue(name: "Hotel Mulia", address: "Jakarta") { id name }
    }
    ```
*   **Tambah Ruangan**: 
    ```graphql
    mutation { 
      addRoom(venueId: "1", 
      name: "Grand Ballroom", 
      capacity: 500) { 
        id name 
      } 
    }
    ```
*   **Buat Reservasi/Booking**:
    ```graphql
    mutation {
      createReservation(roomId: "1", userId: 1, startTime: "2026-01-10T08:00:00Z", endTime: "2026-01-10T10:00:00Z") {
        id status
      }
    }
    ```
*   **Update/Cancel Reservasi**: 
    ```graphql
    mutation { 
      cancelReservation(id: "1") { 
        id status 
      } 
    }
    ```
*   **Input Stok Barang**: 
    ```graphql
    mutation { 
      addItem(name: "Proyektor 4K", 
      category: "Visual", 
      totalStock: 10) { 
        id name 
      } 
    }
    ```
*   **Pinjam Barang (Borrow)**: 
    ```graphql
    mutation { 
      borrowItem(itemId: "1", 
      quantity: 2, 
      borrowerName: "Budi") { 
        id status 
      } 
    }
    ```

---

## 📂 Struktur Proyek
- `api-gateway`: GraphQL Stitching & Verification JWT.
- `auth-service`: MySQL User Management & JWT Issue.
- `venue-provider`: MySQL, Manajemen Lokasi & Room Booking.
- `logistics-service`: MySQL, Inventaris & Transaksi Peminjaman.
- `inventory-consumer`: Integrasi TitikTemu & Analisis Kelayakan.

---
**Status: Sistem Terproteksi & Dokumentasi Terupdate**
