import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GPSCoordinate } from '../types';

// Fix Leaflet marker icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  coordinates: GPSCoordinate[];
  className?: string;
  interactive?: boolean;
}

// Component to recenter map when coordinates change
function RecenterMap({ coordinates }: { coordinates: GPSCoordinate[] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [coordinates, map]);
  return null;
}

export const ActivityMap: React.FC<MapProps> = ({ coordinates, className, interactive = true }) => {
  const pathPositions = coordinates.map(c => [c.lat, c.lng] as [number, number]);
  const startPoint = pathPositions[0];
  const endPoint = pathPositions[pathPositions.length - 1];

  if (coordinates.length === 0) {
    return (
      <div className={`${className} bg-surface-muted flex items-center justify-center text-zinc-500 italic`}>
        Waiting for GPS...
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer 
        center={startPoint} 
        zoom={15} 
        scrollWheelZoom={interactive}
        dragging={interactive}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline 
          positions={pathPositions} 
          color="#FC4C02" 
          weight={4} 
          opacity={0.8}
        />
        <Marker position={startPoint}>
          <Popup>Start</Popup>
        </Marker>
        {coordinates.length > 1 && (
          <Marker position={endPoint}>
            <Popup>Current/End</Popup>
          </Marker>
        )}
        <RecenterMap coordinates={coordinates} />
      </MapContainer>
    </div>
  );
};
