import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDistance(points: { lat: number; lng: number }[]) {
  if (points.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += getHaversineDistance(points[i], points[i + 1]);
  }
  return totalDistance;
}

function getHaversineDistance(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) {
  const R = 6371; // Earth radius in km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculatePace(distanceKm: number, durationSeconds: number) {
  if (distanceKm === 0) return 0;
  const minutes = durationSeconds / 60;
  return minutes / distanceKm;
}

export function formatPace(pace: number) {
  if (!pace || pace === Infinity) return "0:00";
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function calculateCalories(weightKg: number, durationSeconds: number, type: 'run' | 'walk' | 'cycle') {
  // MET values: Walk (3.5), Run (9.8), Cycle (8.0)
  const metMap = {
    walk: 3.5,
    run: 9.8,
    cycle: 8.0
  };
  const hours = durationSeconds / 3600;
  return metMap[type] * weightKg * hours;
}

export function calculateBMI(weight: number, height: number) {
  if (!weight || !height) return 0;
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

export function estimateVO2Max(age: number, weight: number, heartRate?: number) {
  // Basic estimation if HR not available: Resting HR is assumed as 70
  // VO2Max = 15 * (maxHR / restHR)
  const maxHR = 220 - age;
  const restHR = 70;
  return 15 * (maxHR / restHR);
}
