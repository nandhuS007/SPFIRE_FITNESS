/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Suspense, lazy } from 'react';
import { User } from 'firebase/auth';
import { authService } from './services/authService';
import { Navbar } from './components/Navbar';
import { AnimatePresence, motion } from 'motion/react';

const Dashboard = lazy(() => import('./views/Dashboard').then(m => ({ default: m.Dashboard })));
const Recorder = lazy(() => import('./views/Recorder').then(m => ({ default: m.Recorder })));
const History = lazy(() => import('./views/History').then(m => ({ default: m.History })));
const Profile = lazy(() => import('./views/Profile').then(m => ({ default: m.Profile })));
const Login = lazy(() => import('./views/Login').then(m => ({ default: m.Login })));

type Tab = 'home' | 'record' | 'activities' | 'profile';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Suspense fallback={<div className="bg-black min-h-screen" />}><Login /></Suspense>;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-brand selection:text-white pb-16">
      {/* Decorative Grid Background as per Recipe 1 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--brand) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="p-8 text-center text-zinc-500 animate-pulse">Initializing segment...</div>}>
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-7xl mx-auto min-h-screen"
          >
            <div className={cn(
              "mx-auto w-full",
              activeTab === 'record' ? "" : "max-w-xl px-4 pt-4"
            )}>
              {activeTab === 'home' && <Dashboard user={user} onNavigate={setActiveTab} />}
              {activeTab === 'record' && <Recorder user={user} onComplete={() => setActiveTab('home')} />}
              {activeTab === 'activities' && <History user={user} />}
              {activeTab === 'profile' && <Profile user={user} />}
            </div>
          </motion.main>
        </Suspense>
      </AnimatePresence>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

import { cn } from './lib/utils';

