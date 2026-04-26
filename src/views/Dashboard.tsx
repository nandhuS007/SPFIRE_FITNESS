import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Activity, UserProfile } from '../types';
import { ActivityCard } from '../components/ActivityCard';
import { WeeklyChart } from '../components/WeeklyChart';
import { activityService } from '../services/activityService';
import { authService } from '../services/authService';
import { Trophy, Flame, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  user: User;
  onNavigate: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [acts, prof] = await Promise.all([
        activityService.getRecentActivities(user.uid, 3),
        authService.getUserProfile(user.uid)
      ]);
      setActivities(acts);
      setProfile(prof);
      setLoading(false);
    };
    fetchData();
  }, [user.uid]);

  const totalStats = {
    distance: activities.reduce((acc, curr) => acc + curr.distance, 0),
    calories: activities.reduce((acc, curr) => acc + curr.calories, 0),
    time: activities.reduce((acc, curr) => acc + curr.duration, 0),
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-zinc-500">Loading your stats...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 p-4 space-y-6 max-w-lg mx-auto"
    >
      {/* Header */}
      <header className="flex justify-between items-center py-2">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-tight">SPFIRE</h1>
          <p className="text-zinc-500 text-sm">Welcome back, {user.displayName?.split(' ')[0]}</p>
        </div>
        <button 
          onClick={() => onNavigate('record')}
          className="bg-brand hover:bg-brand-hover text-white p-3 rounded-full shadow-lg shadow-brand/20 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Profile Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-muted border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Flame className="text-orange-500 mb-2" size={32} />
          <span className="text-2xl font-display">{profile?.streakCount || 0}</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Day Streak</span>
        </div>
        <div className="bg-surface-muted border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Trophy className="text-yellow-500 mb-2" size={32} />
          <span className="text-2xl font-display">Level {profile?.level || 1}</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{profile?.xp || 0} XP</span>
        </div>
      </div>

      {/* Weekly Progress */}
      <section className="bg-surface-muted border border-zinc-800 rounded-2xl p-5">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Weekly Progress</h2>
          <div className="text-right">
            <span className="text-xl font-display text-white">{totalStats.distance.toFixed(1)} km</span>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">This week</p>
          </div>
        </div>
        <WeeklyChart activities={activities} />
      </section>

      {/* Recent Activities */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Recent Activities</h2>
          <button 
            onClick={() => onNavigate('activities')}
            className="text-brand text-xs font-bold uppercase flex items-center gap-1"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>
        
        {activities.length > 0 ? (
          activities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-600 italic">
            No activities yet. Start recording your first run!
          </div>
        )}
      </section>
    </motion.div>
  );
};
