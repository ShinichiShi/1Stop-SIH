import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface GoogleMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
  onMapReady: () => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  onLocationSelect,
  selectedLocation,
  onMapReady,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Fix default marker assets for bundlers
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const defaultCenter: L.LatLngExpression = [28.6139, 77.209];
    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      onLocationSelect(event.latlng.lat, event.latlng.lng);
    });

    mapInstanceRef.current = map;
    onMapReady();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onLocationSelect, onMapReady]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!selectedLocation) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (!markerRef.current) {
      markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
        draggable: true,
        title: "Selected Bus Stop Location",
      }).addTo(map);

      markerRef.current.on("dragend", (event: L.DragEndEvent) => {
        const draggedMarker = event.target as L.Marker;
        const position = draggedMarker.getLatLng();
        onLocationSelect(position.lat, position.lng);
      });
    } else {
      markerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
    }

    map.setView([selectedLocation.lat, selectedLocation.lng], map.getZoom(), {
      animate: true,
    });
  }, [selectedLocation, onLocationSelect]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[70vh] rounded-lg border border-gray-300 shadow-md"
      style={{ minHeight: "500px" }}
    />
  );
};

export default GoogleMap;
