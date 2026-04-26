import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import { calculateBMI, estimateVO2Max } from '../lib/utils';
import { motion } from 'motion/react';
import { LogOut, Settings, Award, Edit3, Heart, Scale, User as UserIcon } from 'lucide-react';

interface ProfileProps {
  user: User;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ weight: 0, height: 0, age: 0 });

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await authService.getUserProfile(user.uid);
      setProfile(data);
      if (data) setFormData({ 
        weight: data.weight || 0, 
        height: data.height || 0, 
        age: data.age || 0 
      });
    };
    fetchProfile();
  }, [user.uid]);

  const handleUpdate = async () => {
    await authService.updateProfile(user.uid, formData);
    setProfile(prev => prev ? { ...prev, ...formData } : null);
    setEditing(false);
  };

  const bmi = calculateBMI(profile?.weight || 0, profile?.height || 0);
  const vo2max = estimateVO2Max(profile?.age || 30, profile?.weight || 70);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 p-4 space-y-8 max-w-lg mx-auto"
    >
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mt-4">
        <div className="w-24 h-24 rounded-full border-4 border-brand p-1 mb-4">
          <img 
            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-display uppercase tracking-tight">{profile?.name || user.displayName}</h1>
        <p className="text-zinc-500 text-sm">{user.email}</p>
        
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => setEditing(!editing)}
            className="bg-surface-muted border border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Edit3 size={14} /> Edit Profile
          </button>
          <button 
            onClick={() => authService.logout()}
            className="bg-red-900/20 border border-red-900/40 text-red-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-surface-muted border border-brand/20 p-6 rounded-2xl space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Weight (kg)</label>
              <input 
                type="number" 
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2 focus:border-brand outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Height (cm)</label>
              <input 
                type="number" 
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2 focus:border-brand outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Age</label>
              <input 
                type="number" 
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseFloat(e.target.value) })}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2 focus:border-brand outline-none"
              />
            </div>
          </div>
          <button 
            onClick={handleUpdate}
            className="w-full bg-brand text-white py-3 rounded-xl font-bold uppercase tracking-widest text-sm"
          >
            Save Changes
          </button>
        </motion.div>
      )}

      {/* Health Metrics */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
          <Heart size={16} className="text-brand" /> Health Metrics
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-muted border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Scale size={14} />
              <span className="text-[10px] uppercase font-bold tracking-wider">BMI Intensity</span>
            </div>
            <div className="text-xl font-display">
              {bmi.toFixed(1)}
              <span className="text-[10px] font-sans text-zinc-500 ml-2 uppercase">
                {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : 'Overweight'}
              </span>
            </div>
          </div>
          <div className="bg-surface-muted border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <UserIcon size={14} />
              <span className="text-[10px] uppercase font-bold tracking-wider">VO2 Max (Est)</span>
            </div>
            <div className="text-xl font-display">
              {vo2max.toFixed(1)}
              <span className="text-[10px] font-sans text-zinc-500 ml-2 uppercase">mL/kg/min</span>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
          <Award size={16} className="text-brand" /> Achievements
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {['first_run', 'streak_3', 'km_10', 'early_bird'].map(badge => (
            <div key={badge} className="bg-surface-muted border border-zinc-800 aspect-square rounded-2xl flex items-center justify-center grayscale opacity-40">
              <Award size={24} />
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
