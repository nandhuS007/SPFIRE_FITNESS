export type ActivityType = 'run' | 'walk' | 'cycle';

export interface GPSCoordinate {
  lat: number;
  lng: number;
  time: string;
}

export interface Activity {
  id?: string;
  userId: string;
  type: ActivityType;
  distance: number; // km
  duration: number; // seconds
  pace: number; // min/km
  calories: number;
  gpsCoordinates: GPSCoordinate[];
  createdAt: string;
  intensity?: 'low' | 'moderate' | 'high';
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  weight?: number; // kg
  height?: number; // cm
  age?: number;
  xp: number;
  level: number;
  streakCount: number;
  lastActivityDate?: string;
  achievements?: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  milestone: number;
}
