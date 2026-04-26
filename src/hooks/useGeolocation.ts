import { useState, useEffect, useCallback, useRef } from 'react';
import { GPSCoordinate } from '../types';

export function useGeolocation(isRecording: boolean) {
  const [coordinates, setCoordinates] = useState<GPSCoordinate[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  const startWatching = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const newCoord: GPSCoordinate = {
          lat: latitude,
          lng: longitude,
          time: new Date().toISOString()
        };

        if (isRecording) {
          setCoordinates(prev => [...prev, newCoord]);
        }
        setCurrentSpeed(speed);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, [isRecording]);

  const stopWatching = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      startWatching();
    } else {
      stopWatching();
    }

    return () => stopWatching();
  }, [isRecording, startWatching, stopWatching]);

  const clearCoordinates = () => setCoordinates([]);

  return { coordinates, currentSpeed, error, clearCoordinates };
}
