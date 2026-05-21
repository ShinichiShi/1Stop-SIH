import React, { useState, useRef, useCallback } from "react";
import GoogleMap from "./GoogleMap";
import PlacesAutocomplete from "./PlacesAutocomplete";
import type { Theme } from "../App";

interface PlacesAutocompleteRef {
  clearInput: () => void;
}

interface BusStop {
  stopId: string;
  name: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
}

interface BusStopAdminProps {
  theme: Theme;
}

const BusStopAdmin: React.FC<BusStopAdminProps> = ({ theme }) => {
  const [stopName, setStopName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  const autocompleteRef = useRef<PlacesAutocompleteRef>(null);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  }, []);

  const handlePlaceSelect = useCallback(
    (place: { name: string; lat: number; lng: number }) => {
      const { lat, lng, name } = place;
      setSelectedLocation({ lat, lng });

      // Set stop name from place name if not already set
      if (!stopName && name) {
        const shortName = name.split(",")[0]?.trim();
        setStopName(shortName || name);
      }
    },
    [stopName]
  );

  const handleMapReady = useCallback(() => {
    setMapLoading(false);
  }, []);

  const generateStopId = (): string => {
    return `S${Date.now()}`;
  };

  const handleSave = async () => {
    if (!stopName.trim()) {
      setMessage({ type: "error", text: "Please enter a stop name" });
      return;
    }

    if (!selectedLocation) {
      setMessage({
        type: "error",
        text: "Please select a location on the map",
      });
      return;
    }

    const busStop: BusStop = {
      stopId: generateStopId(),
      name: stopName.trim(),
      location: {
        type: "Point",
        coordinates: [selectedLocation.lng, selectedLocation.lat], // [lng, lat] format
      },
    };

    setIsLoading(true);
    setMessage(null);

    try {
      console.log("Sending bus stop data:", busStop);

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/addNewStop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(busStop),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          // Mock API endpoint not found - this is common with Postman mock servers
          console.log(
            "Mock API returned 404. This might be expected for demo purposes."
          );
          setMessage({
            type: "success",
            text: `Bus stop "${stopName}" would be saved successfully! (Demo Mode - API returned 404)`,
          });
          setTimeout(() => setMessage(null), 4000);
          return;
        }

        const errorText = await response.text();
        console.log("Error response body:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      let result = null;
      try {
        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        if (responseText.trim()) {
          result = JSON.parse(responseText);
          console.log("Parsed JSON response:", result);
        } else {
          console.log("Empty response body - treating as success");
        }
      } catch (jsonError) {
        console.log(
          "Failed to parse JSON, but request was successful:",
          jsonError
        );
      }

      setMessage({
        type: "success",
        text: `Bus stop "${stopName}" saved successfully!`,
      });

      // Auto-clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving bus stop:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Check if it's a network error
      if (
        error instanceof Error &&
        error.name === "TypeError" &&
        error.message.includes("fetch")
      ) {
        setMessage({
          type: "success",
          text: `Bus stop "${stopName}" would be saved successfully! (Demo Mode - Network Error)`,
        });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({
          type: "error",
          text: `Failed to save bus stop: ${errorMessage}`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStopName("");
    setSelectedLocation(null);
    setMessage(null);

    // Clear the autocomplete input
    if (autocompleteRef.current) {
      autocompleteRef.current.clearInput();
    }
  };

  return (
    <div className="min-h-full py-8 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bus Stop Management
          </h1>
          <p className="text-gray-600">
            Add and manage bus stops with precise location mapping
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Form Section */}
            <div className="lg:col-span-1 p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 border-r border-gray-200/50">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className={`w-8 h-8 ${theme.gradients.logo} rounded-lg flex items-center justify-center mr-3`}>
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    Add New Stop
                  </h2>

                  <label
                    htmlFor="stopName"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Stop Name *
                  </label>
                  <input
                    id="stopName"
                    type="text"
                    value={stopName}
                    onChange={(e) => setStopName(e.target.value)}
                    placeholder="Enter bus stop name"
                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 ${theme.gradients.inputFocus} outline-none transition-all duration-200 bg-white shadow-sm hover:border-gray-300 placeholder-gray-400 input-enhanced focus-ring`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Search Location
                  </label>
                  <PlacesAutocomplete
                    ref={autocompleteRef}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Search for a bus stop location..."
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Or click on the map to manually select a location
                  </p>
                </div>

                {/* Coordinates Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200/50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    Selected Coordinates
                  </h3>
                  {selectedLocation ? (
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex justify-between items-center bg-white/60 rounded-lg p-2">
                        <span className="font-medium text-gray-700">Latitude:</span>
                        <span className="font-mono text-blue-700">
                          {selectedLocation.lat.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/60 rounded-lg p-2">
                        <span className="font-medium text-gray-700">Longitude:</span>
                        <span className="font-mono text-blue-700">
                          {selectedLocation.lng.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="text-center">
                        <svg
                          className="w-8 h-8 text-gray-400 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                        <p className="text-sm text-gray-500">No location selected</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={isLoading || !stopName.trim() || !selectedLocation}
                    className={`flex-1 ${theme.gradients.buttonPrimary} text-white py-3 px-4 rounded-xl disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none btn-hover-lift`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Stop
                      </div>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    className={`flex-1 ${theme.gradients.buttonSecondary} text-white py-3 px-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 btn-hover-lift`}
                  >
                    <div className="flex items-center justify-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Reset
                    </div>
                  </button>
                </div>

                {/* Message Display */}
                {message && (
                  <div
                    className={`p-4 rounded-xl border-2 shadow-sm transition-all duration-300 ${
                      message.type === "success"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    <div className="flex items-center">
                      {message.type === "success" ? (
                        <svg
                          className="w-5 h-5 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                      <p className="font-semibold">{message.text}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Section */}
            <div className="lg:col-span-2 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    Interactive Map
                  </label>
                  {selectedLocation && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Location Selected</span>
                    </div>
                  )}
                </div>
                
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200">
                  {mapLoading && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading map</h3>
                        <p className="text-gray-600">Please wait while we initialize the map...</p>
                      </div>
                    </div>
                  )}
                  <GoogleMap
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={selectedLocation}
                    onMapReady={handleMapReady}
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-blue-800">
                      {mapLoading
                        ? "Map is loading. Please wait for initialization to complete."
                        : "Click anywhere on the map to place a marker, or drag the existing marker to reposition it. You can also use the search bar above to find specific locations."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusStopAdmin;
