// LocationTracker.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Fix the default icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const socket = io('http://localhost:4000');

const LocationTracker = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);

          // Send initial location to backend
          socket.emit('sendLocation', { lat: latitude, lng: longitude });

          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const newPosition = [latitude, longitude];
              setPosition(newPosition);

              // Send location to backend
              socket.emit('sendLocation', { lat: latitude, lng: longitude });
            },
            (err) => {
              setError(err.message);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
          );

          return () => {
            navigator.geolocation.clearWatch(watchId);
          };
        },
        (err) => {
          setError(err.message);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  useEffect(() => {
    socket.on('locationUpdate', (newPosition) => {
      setPosition([newPosition.lat, newPosition.lng]);
    });

    return () => socket.off('locationUpdate');
  }, []);

  if (!position) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error && <p>Error: {error}</p>}
      <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            You are here!
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationTracker;
