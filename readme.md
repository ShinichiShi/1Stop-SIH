# Bus Tracking System API

A real-time bus tracking system that provides location-based services for finding nearby bus stops, tracking bus movements, and managing route information.

## Features

- 🚌 Real-time bus position tracking
- 📍 Find nearest bus stops based on user location
- 🗺️ Route management with circular and up-down route support
- ⚡ Redis caching for performance optimization
- 🔒 Rate limiting for API protection
- 🌍 Integration with Google Maps Distance Matrix API

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (with geospatial queries)
- **Cache**: Redis
- **External API**: Google Maps Distance Matrix API
- **Containerization**: Docker support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- Google Cloud Platform API key
- Docker (optional)

## Installation

### Backend Server Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bus-tracking-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   SERVER_PORT=3000
   MAX_START_RETRIES=10
   START_RETRY_DELAY_MS=3000
   
   # Google Cloud API
   GCP_API_KEY=your_google_api_key_here
   
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # Rate Limiting
   RATE_LIMIT=10
   RATE_LIMIT_WINDOW_IN_SECONDS=10
   
   # MongoDB Configuration
   MONGODB_URL=mongodb://root:root@localhost:2717/1Stop?authSource=admin
   ```

4. **Start the services**
   
   **Using Docker (Recommended):**
   ```bash
   docker-compose up -d
   ```
   
   **Manual setup:**
   ```bash
   # Start MongoDB and Redis services
   # Then run the application
   npm run dev
   ```

### Android App (1Stop-app) Setup

To set up and run the Android application:

1. **Initialize and update git submodules**
   ```bash
   git submodule update --init --recursive
   ```
   
   This will clone the `1Stop-SIH` repository and get the correct version of `1Stop-app`.

## Kubernetes (Minikube) Deployment

### 1) Start Minikube

```bash
minikube start
kubectl create namespace 1stop
```

### 2) Build images inside Minikube Docker daemon

```bash
eval $(minikube docker-env)
docker build -t 1stop-server:local ./server
docker build -t 1stop-admin:local ./admin
```

### 3) Apply manifests

```bash
kubectl apply -f k8s/Deployment.yaml -n 1stop
kubectl apply -f k8s/Service.yaml -n 1stop
```

### 4) Verify deployment

```bash
kubectl get pods -n 1stop
kubectl get services -n 1stop
```

### 5) Access applications

Admin app:

```bash
minikube service admin-service -n 1stop --url
```

Backend + Swagger UI:

```bash
minikube service server-service -n 1stop --url
```

Open `<server-url>/docs` for API UI and `<server-url>/openapi.json` for raw spec.

## API Documentation

### Base URL
```
http://localhost:3000
```

### Visual API Docs (Swagger UI)
Open the following in your browser:
```
http://localhost:3000/docs
```

Raw OpenAPI JSON:
```
http://localhost:3000/openapi.json
```

### Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/test` | GET | Health check | None |
| `/getNearestBustops` | GET | Find nearby bus stops | `userLat`, `userLon` |
| `/getNextStop` | GET | Get next stop in route | `routeNO`, `currStopIndex`, `nextStopIndex` |
| `/getBusesForStop` | GET | Get buses at a stop | `stopId` |
| `/trackBus` | POST | Track bus position | `busPositionLat`, `busPositionLon`, `nextStopLat`, `nextStopLon`, `busID`, `nextStopID`, `routeNo` |

### Detailed API Reference

#### 1. Health Check
```http
GET /test
```

**Response:**
```json
"server running"
```

#### 2. Get Nearest Bus Stops
```http
GET /getNearestBustops
Content-Type: application/json

{
  "userLat": 12.9716,
  "userLon": 77.5946
}
```

**Response:**
```json
{
  "stops": [
    {
      "stopId": "STOP001",
      "name": "MG Road",
      "location": {
        "type": "Point",
        "coordinates": [77.5946, 12.9716]
      },
      "routes": ["42", "201", "500"]
    }
  ]
}
```

#### 3. Get Next Stop
```http
GET /getNextStop
Content-Type: application/json

{
  "routeNO": "42",
  "currStopIndex": 5,
  "nextStopIndex": 6
}
```

**Response:**
```json
{
  "nextStop": {
    "coordinates": [77.5946, 12.9716],
    "stopId": "STOP007",
    "index": 7
  },
  "currStop": {
    "coordinates": [77.5896, 12.9676],
    "stopId": "STOP006",
    "index": 6
  }
}
```

#### 4. Get Buses for Stop
```http
GET /getBusesForStop
Content-Type: application/json

{
  "stopId": "STOP001"
}
```

**Response:**
```json
[
  {
    "busId": "BUS001",
    "routeNo": "42",
    "distance": 250,
    "duration": 120
  }
]
```

#### 5. Track Bus
```http
POST /trackBus
Content-Type: application/json

{
  "busPositionLat": 12.9716,
  "busPositionLon": 77.5946,
  "nextStopLat": 12.9756,
  "nextStopLon": 77.5986,
  "busID": "BUS001",
  "nextStopID": "STOP002",
  "routeNo": "42"
}
```

**Response:**
```json
{
  "distance": 450,
  "duration": 180
}
```

## Data Models

### Bus Stop Schema
```javascript
{
  stopId: String,
  name: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  routes: [String]
}
```

### Route Schema
```javascript
{
  routeNumber: String,
  routeType: String, // "C" for Circular, "UD" for Up-Down
  stops: [{
    index: Number,
    stopId: String,
    name: String,
    location: {
      type: "Point",
      coordinates: [longitude, latitude]
    }
  }]
}
```

## Rate Limiting

All endpoints are protected by rate limiting:
- **Limit**: Configurable via `RATE_LIMIT` environment variable
- **Window**: Configurable via `RATE_LIMIT_WINDOW_IN_SECONDS`
- **Response**: `429 Too Many Requests` when limit exceeded

## Error Handling

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (Invalid input)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "message": "Error description"
}
```

## Architecture

### System Components
- **Express Server**: RESTful API endpoints
- **MongoDB**: Persistent storage with geospatial indexing
- **Redis**: Caching layer for real-time bus data
- **Google Maps API**: Distance and duration calculations

### Data Flow
1. Bus sends position updates via `/trackBus`
2. System calculates distance using Google Maps API
3. Bus information cached in Redis with TTL
4. Users query nearby stops and bus information
5. Real-time data served from Redis cache

<!-- ## Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Production Considerations
- Set up MongoDB replica set for high availability
- Use Redis Cluster for scaling
- Implement proper logging and monitoring
- Set up SSL/TLS certificates
- Configure reverse proxy (nginx)

## Development

### Running in Development Mode
```bash
npm run dev
```

### Project Structure
```
server/
├── src/
│   ├── config.ts          # Environment configuration
│   ├── controller/        # API controllers
│   ├── middleware/        # Custom middleware
│   ├── model/            # Database models
│   ├── types/            # TypeScript type definitions
│   ├── util.ts           # Utility functions
│   └── index.ts          # Application entry point
├── .env                  # Environment variables
├── package.json
└── docker-compose.yaml
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

**Note**: This system uses unusual REST conventions where GET endpoints accept request bodies. Consider refactoring to use query parameters for better REST compliance in future versions. -->
