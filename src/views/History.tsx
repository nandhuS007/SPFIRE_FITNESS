import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Activity } from '../types';
import { activityService } from '../services/activityService';
import { ActivityCard } from '../components/ActivityCard';
import { motion } from 'motion/react';
import { Filter, Search } from 'lucide-react';

interface HistoryProps {
  user: User;
}

export const History: React.FC<HistoryProps> = ({ user }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const data = await activityService.getActivities(user.uid);
      setActivities(data);
      setLoading(false);
    };
    fetchActivities();
  }, [user.uid]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 p-4 space-y-6 max-w-lg mx-auto"
    >
      <header className="space-y-4">
        <h1 className="text-3xl font-display uppercase tracking-tight">Your Activities</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search runs..." 
              className="w-full bg-surface-muted border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <button className="bg-surface-muted border border-zinc-800 p-2 rounded-xl text-zinc-400">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(n => (
            <div key={n} className="h-32 bg-surface-muted animate-pulse rounded-2xl border border-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))
          ) : (
            <div className="text-center py-20 text-zinc-500 italic">No activities recorded yet.</div>
          )}
        </div>
      )}
    </motion.div>
  );
};
