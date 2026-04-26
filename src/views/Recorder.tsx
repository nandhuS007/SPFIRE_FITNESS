import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSocket } from '../hooks/useSocket';
import { ActivityMap } from '../components/ActivityMap';
import { calculateDistance, calculatePace, calculateCalories, formatDuration, formatPace } from '../lib/utils';
import { activityService } from '../services/activityService';
import { authService } from '../services/authService';
import { Activity, ActivityType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Square, Play, RotateCcw, Save, Bike, Footprints, Timer } from 'lucide-react';

interface RecorderProps {
  user: User;
  onComplete: () => void;
}

export const Recorder: React.FC<RecorderProps> = ({ user, onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('run');
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const { coordinates, currentSpeed, error: geoError, clearCoordinates } = useGeolocation(isRecording);
  const { emitActivityUpdate } = useSocket();

  const distance = calculateDistance(coordinates);
  const pace = calculatePace(distance, duration);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      // Real-time update via socket
      if (coordinates.length > 0) {
        emitActivityUpdate({ 
          userId: user.uid, 
          lat: coordinates[coordinates.length - 1].lat, 
          lng: coordinates[coordinates.length - 1].lng,
          type: activityType
        });
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, coordinates, user.uid, activityType, emitActivityUpdate]);

  const handleStart = () => {
    setSaveStatus('idle');
    setIsRecording(true);
  };

  const handleStop = () => {
    setIsRecording(false);
  };

  const handleReset = () => {
    setIsRecording(false);
    setDuration(0);
    clearCoordinates();
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (distance === 0) {
      alert("No distance recorded. Please move to track your activity!");
      return;
    }

    setIsSaving(true);
    try {
      const profile = await authService.getUserProfile(user.uid);
      const weight = profile?.weight || 70;

      const newActivity: Activity = {
        userId: user.uid,
        type: activityType,
        distance,
        duration,
        pace,
        calories: calculateCalories(weight, duration, activityType),
        gpsCoordinates: coordinates,
        createdAt: new Date().toISOString(),
        intensity: pace < 6 ? 'high' : pace < 8 ? 'moderate' : 'low'
      };

      await activityService.addActivity(newActivity);
      await authService.addXp(user.uid, Math.round(distance * 10)); // 10 XP per km
      setSaveStatus('success');
      setTimeout(() => onComplete(), 1500);
    } catch (err) {
      console.error("Save failure:", err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-40 pb-24 overflow-hidden flex flex-col">
      {/* Map View */}
      <ActivityMap 
        coordinates={coordinates} 
        className="flex-1 w-full"
      />

      {/* Controls Container */}
      <div className="bg-surface border-t border-zinc-800 p-6 space-y-8 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50">
        
        {/* Activity Selector (Only when not recording) */}
        {!isRecording && duration === 0 && (
          <div className="flex justify-center gap-4">
            {(['run', 'walk', 'cycle'] as ActivityType[]).map(type => (
              <button
                key={type}
                onClick={() => setActivityType(type)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                  activityType === type ? "bg-brand border-brand text-white" : "bg-black border-zinc-800 text-zinc-500"
                )}
              >
                {type === 'run' && <Timer size={24} />}
                {type === 'walk' && <Footprints size={24} />}
                {type === 'cycle' && <Bike size={24} />}
                <span className="text-[10px] font-bold uppercase tracking-widest">{type}</span>
              </button>
            ))}
          </div>
        )}

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 gap-8 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-[0.2em] block mb-1">Distance (km)</span>
            <span className="text-5xl font-display tabular-nums tracking-tighter">{distance.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-[0.2em] block mb-1">Time</span>
            <span className="text-5xl font-display tabular-nums tracking-tighter">{formatDuration(duration)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-[0.2em] block mb-1">Avg Pace</span>
            <span className="text-3xl font-display tabular-nums tracking-tight">{formatPace(pace)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-[0.2em] block mb-1">Speed (km/h)</span>
            <span className="text-3xl font-display tabular-nums tracking-tight">
              {(currentSpeed ? currentSpeed * 3.6 : 0).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-6">
          <AnimatePresence mode="wait">
            {!isRecording && duration > 0 ? (
              <motion.div 
                key="paused"
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex gap-4 w-full"
              >
                <button 
                  onClick={handleReset}
                  className="bg-zinc-800 text-white p-5 rounded-full hover:bg-zinc-700 transition-colors"
                >
                  <RotateCcw size={28} />
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving || saveStatus === 'success'}
                  className={cn(
                    "p-5 flex-1 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                    saveStatus === 'success' ? "bg-green-500 text-white" : "bg-green-600 text-white hover:bg-green-500",
                    isSaving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : saveStatus === 'success' ? (
                    "Saved!"
                  ) : (
                    <>
                      <Save size={24} /> Finish & Save
                    </>
                  )}
                </button>
                <button 
                  onClick={handleStart}
                  className="bg-brand text-white p-5 rounded-full hover:bg-brand-hover"
                >
                  <Play size={28} fill="currentColor" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key={isRecording ? "stop" : "start"}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={isRecording ? handleStop : handleStart}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl",
                  isRecording ? "bg-red-600 shadow-red-600/20" : "bg-brand shadow-brand/20"
                )}
              >
                {isRecording ? <Square size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {geoError && <div className="text-red-500 text-xs text-center">{geoError}</div>}
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';
