"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js/Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on status
const createIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PROPOSED': return '#EAB308'; // Yellow
    case 'ACTIVE': return '#EF4444'; // Red
    case 'COMPLETED': return '#22C55E'; // Green
    case 'FLAGGED': return '#A855F7'; // Purple
    default: return '#3B82F6'; // Blue
  }
};

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterHandler({ onCenterChange }: { onCenterChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend(e) {
      const center = e.target.getCenter();
      onCenterChange(center.lat, center.lng);
    }
  });
  return null;
}

export default function MapComponent({ projects, onProjectSelect, onMapClick, onCenterChange }: { projects: any[], onProjectSelect: (p: any) => void, onMapClick?: (lat: number, lng: number) => void, onCenterChange?: (lat: number, lng: number) => void }) {
  const center: [number, number] = [12.8398, 80.0452]; // Kancheepuram / Chennai

  return (
    <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      {onCenterChange && <MapCenterHandler onCenterChange={onCenterChange} />}
      
      {projects.map((project) => (
        <Marker 
          key={project.id} 
          position={[project.latitude, project.longitude]}
          icon={createIcon(getStatusColor(project.status))}
          eventHandlers={{
            click: () => onProjectSelect(project),
          }}
        >
          <Popup>
            <strong>{project.title}</strong><br />
            Status: {project.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
