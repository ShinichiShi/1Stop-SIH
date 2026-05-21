export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "1Stop Bus Tracking API",
    version: "1.0.0",
    description: "Interactive API documentation for the 1Stop backend",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local server",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Bus" },
    { name: "Route" },
  ],
  paths: {
    "/test": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Server is running",
          },
        },
      },
    },
    "/getNearestBustops": {
      post: {
        tags: ["Bus"],
        summary: "Get nearest bus stops",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userLat", "userLon"],
                properties: {
                  userLat: { type: "number", example: 12.9716 },
                  userLon: { type: "number", example: 77.5946 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Nearest stops returned" },
        },
      },
    },
    "/getBusesForStop": {
      post: {
        tags: ["Bus"],
        summary: "Get buses for a stop",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["stopId"],
                properties: {
                  stopId: { type: "string", example: "STOP001" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Buses returned" },
        },
      },
    },
    "/getCommonRoutes": {
      post: {
        tags: ["Route"],
        summary: "Get common routes between stops",
        responses: {
          "200": { description: "Common routes returned" },
        },
      },
    },
    "/trackBus": {
      post: {
        tags: ["Bus"],
        summary: "Track bus position and ETA",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "busPositionLat",
                  "busPositionLon",
                  "nextStopLat",
                  "nextStopLon",
                  "busID",
                  "nextStopID",
                  "routeNo",
                ],
                properties: {
                  busPositionLat: { type: "number", example: 12.9716 },
                  busPositionLon: { type: "number", example: 77.5946 },
                  nextStopLat: { type: "number", example: 12.9756 },
                  nextStopLon: { type: "number", example: 77.5986 },
                  busID: { type: "string", example: "BUS001" },
                  nextStopID: { type: "string", example: "STOP002" },
                  routeNo: { type: "string", example: "42" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Distance and duration returned" },
        },
      },
    },
    "/getNextStop": {
      post: {
        tags: ["Route"],
        summary: "Get next stop details",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["routeNO", "currStopIndex", "nextStopIndex"],
                properties: {
                  routeNO: { type: "string", example: "42" },
                  currStopIndex: { type: "number", example: 5 },
                  nextStopIndex: { type: "number", example: 6 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Next stop returned" },
        },
      },
    },
    "/addNewRoute": {
      post: {
        tags: ["Route"],
        summary: "Add a new route",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
            },
          },
        },
        responses: {
          "200": { description: "Route added" },
        },
      },
    },
    "/addNewStop": {
      post: {
        tags: ["Route"],
        summary: "Add a new bus stop",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
            },
          },
        },
        responses: {
          "200": { description: "Stop added" },
        },
      },
    },
    "/calcCrowdDensity": {
      post: {
        tags: ["Bus"],
        summary: "Estimate crowd density from uploaded image",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Crowd density calculated" },
        },
      },
    },
    "/getRoute": {
      get: {
        tags: ["Route"],
        summary: "Get route details",
        responses: {
          "200": { description: "Route returned" },
        },
      },
    },
    "/getAllStops": {
      get: {
        tags: ["Route"],
        summary: "Get all stops",
        responses: {
          "200": { description: "Stops returned" },
        },
      },
    },
    "/getAllActveBuses": {
      get: {
        tags: ["Bus"],
        summary: "Get all active buses",
        responses: {
          "200": { description: "Active buses returned" },
        },
      },
    },
    "/getBusStats": {
      get: {
        tags: ["Bus"],
        summary: "Get bus statistics",
        responses: {
          "200": { description: "Bus stats returned" },
        },
      },
    },
  },
} as const;
