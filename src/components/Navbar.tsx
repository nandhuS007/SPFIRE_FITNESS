import React from 'react';
import { Home, Play, List, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  activeTab: 'home' | 'record' | 'activities' | 'profile';
  setActiveTab: (tab: 'home' | 'record' | 'activities' | 'profile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'record', icon: Play, label: 'Record' },
    { id: 'activities', icon: List, label: 'Activities' },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-muted border-t border-zinc-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-colors",
              activeTab === id ? "text-brand" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon size={24} className={cn("mb-1", activeTab === id && "animate-pulse")} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
