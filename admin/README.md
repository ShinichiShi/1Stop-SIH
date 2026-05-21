# Bus Stop Admin Panel

A React + TypeScript + Vite application for managing bus stops with OpenStreetMap integration.

## Features

- 🗺️ Interactive OpenStreetMap with click-to-pin functionality
- 🔍 OpenStreetMap (Nominatim) location search
- 📍 Draggable markers for precise positioning
- 💾 Save bus stops to backend API
- 🧹 Reset functionality to clear form and markers
- 📱 Responsive design with TailwindCSS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://ca4e6fac-738f-430c-b5bf-9fc1658ecc03.mock.pstmn.io
```

### 3. Backend API

The application is configured to use a mock API endpoint. The base URL is configurable via the `VITE_API_BASE_URL` environment variable.

**POST** `/api/stops`

Expected request body:

```json
{
  "stopId": "S1694889234567",
  "name": "Central Bus Station",
  "location": {
    "type": "Point",
    "coordinates": [77.209, 28.6139]
  }
}
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Search for a location**: Use the search input to find places using OpenStreetMap Nominatim
2. **Manual pin placement**: Click anywhere on the map to place a marker
3. **Adjust location**: Drag the marker to fine-tune the position
4. **Enter stop name**: Fill in the bus stop name in the text field
5. **View coordinates**: See the live latitude and longitude values
6. **Save**: Click "Save Stop" to send data to the backend
7. **Reset**: Click "Reset" to clear the form and remove markers

## Project Structure

```
src/
├── components/
│   ├── BusStopAdmin.tsx      # Main admin component
│   ├── GoogleMap.tsx         # Leaflet + OpenStreetMap integration
│   └── PlacesAutocomplete.tsx # Places search component
├── App.tsx                   # App entry point
└── index.css                 # TailwindCSS styles
```

## Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Leaflet** for map rendering
- **OpenStreetMap tiles** for map data
- **Nominatim API** for location search

## API Schema

The application sends bus stop data in the following format:

```typescript
interface BusStop {
  stopId: string; // Format: "S" + timestamp
  name: string; // User-entered stop name
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}
```

## Environment Variables

| Variable                   | Description          | Required |
| -------------------------- | -------------------- | -------- |
| `VITE_API_BASE_URL`        | Backend API base URL | Yes      |

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

1. **Maps not loading**: Check internet connectivity and ensure tile requests to OpenStreetMap are not blocked
2. **Search not returning results**: Ensure access to Nominatim is available from your network
3. **Save failing**: Verify your API base URL and backend availability
