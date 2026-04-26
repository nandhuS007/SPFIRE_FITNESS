import React from 'react';
import { Activity } from '../types';
import { formatDuration, formatPace } from '../lib/utils';
import { MapPin, Calendar, Clock, Zap } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onClick?: (activity: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  const date = new Date(activity.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      onClick={() => onClick?.(activity)}
      className="bg-surface-muted border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-zinc-700 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg capitalize flex items-center gap-2">
            {activity.type}
            <span className="text-xs font-normal text-zinc-500 uppercase tracking-widest bg-black px-2 py-0.5 rounded">
              {activity.intensity || 'moderate'}
            </span>
          </h3>
          <div className="flex items-center text-zinc-500 text-sm gap-3 mt-1">
            <span className="flex items-center gap-1"><Calendar size={14} /> {date}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display text-brand leading-none">
            {activity.distance.toFixed(2)}
            <span className="text-xs font-sans text-zinc-500 ml-1">km</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-tighter flex items-center gap-1">
            <Clock size={10} /> Time
          </span>
          <span className="font-mono text-sm">{formatDuration(activity.duration)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-tighter flex items-center gap-1">
            <MapPin size={10} /> Pace
          </span>
          <span className="font-mono text-sm">{formatPace(activity.pace)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-tighter flex items-center gap-1">
            <Zap size={10} /> Calories
          </span>
          <span className="font-mono text-sm">{Math.round(activity.calories)}</span>
        </div>
      </div>
    </div>
  );
};
