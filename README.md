# Loge Project - Campus Event & Resource Ecosystem

A microservices-based system designed to manage campus events and resources efficiently. The system is divided into two main groups:
*   **Group A (Event System)**: Manages event creation, participants, and attendance.
*   **Group B (Venue & Resource System)**: Manages venues, rooms, equipment, and logistics.

This repository covers the implementation of **Group B Services**.

## 🏗️ Architecture (Group B)

Group B consists of three microservices communicating via REST APIs and GraphQL.

| Service | Port | Description | DB | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Venue Provider** | `4002` | Manages buildings, rooms, and reservations. | MySQL (`venue_db`) | REST, GraphQL, Room Capacity, Reservations |
| **Logistics Service** | `4003` | Manages physical assets (equipment) and stock. | MySQL (`logistics_db`) | REST, GraphQL, Stock Tracking, Borrow/Return |
| **Inventory Consumer**| `4004` | Aggregator that checks event feasibility. | N/A (Aggregator) | Validates capacity & stock availability for events |

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MySQL (Running on localhost)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/loge-project.git
    cd loge-project/backend
    ```

2.  **Install Dependencies** (for each service):
    ```bash
    cd venue-provider && npm install
    cd ../logistics-service && npm install
    cd ../inventory-consumer && npm install
    ```

3.  **Database Setup**:
    *   Ensure MySQL is running.
    *   Run setup scripts to create databases automatically:
        ```bash
        # Utility scripts are provided (or run automatically on start)
        cd venue-provider && node setup-db.js
        cd ../logistics-service && node setup-db.js
        ```

### Running the Services

You need to run each service in a separate terminal:

**1. Venue Provider**
```bash
cd backend/venue-provider
npm run dev
# Runs on http://localhost:4002
```

**2. Logistics Service**
```bash
cd backend/logistics-service
npm run dev
# Runs on http://localhost:4003
```

**3. Inventory Consumer**
```bash
cd backend/inventory-consumer
npm run dev
# Runs on http://localhost:4004
```

## 📚 API Documentation

### 1. Venue Provider Service
*   **REST Base URL**: `http://localhost:4002`
*   **GraphQL**: `http://localhost:4002/graphql`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/venues` | List all venues |
| `POST` | `/api/venues` | Create a new venue |
| `POST` | `/api/venues/rooms` | Add a room to a venue |
| `POST` | `/api/reservations/check-availability` | Check room availability |
| `POST` | `/api/reservations` | Create a reservation |

### 2. Logistics Service
*   **REST Base URL**: `http://localhost:4003`
*   **GraphQL**: `http://localhost:4003/graphql`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/items` | List logistics items |
| `POST` | `/api/items` | Add new item |
| `POST` | `/api/borrow` | Borrow item (decreases stock) |
| `POST` | `/api/return` | Return item (restores stock) |

### 3. Inventory Consumer (Aggregator)
*   **Base URL**: `http://localhost:4004`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/check-event-feasibility` | Check if an event can be held (Venue + Logistics check) |

**Example Request (Check Feasibility):**
```json
{
  "eventId": "101"
}
```

## 🧪 Testing

We have provided `verify.js` scripts in each service directory to test the flows.
```bash
node backend/venue-provider/verify.js
node backend/logistics-service/verify.js
node backend/inventory-consumer/verify.js
```

## 🛠️ Built With
*   **Node.js & Express** - Backend Framework
*   **Sequelize** - ORM
*   **MySQL** - Database
*   **GraphQL** - Query Language (Implemented in Provider Services)
