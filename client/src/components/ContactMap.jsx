import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default icon images when using bundlers (Vite)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function ContactMap() {
  const center = useMemo(() => [21.7051, 72.9959], []); // Bharuch / example coordinates
  const [mounted, setMounted] = useState(false);

  // Prevent react-leaflet from mounting until we are fully in the browser.
  // This avoids context consumer crashes sometimes seen under React 18/dev strict rendering.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-72" />;

  return (
    <div className="w-full h-72">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center}>
          <Popup>Your Store Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}


