import React from 'react';
import { authService } from '../services/authService';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-900 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 text-center space-y-8 max-w-sm"
      >
        <div className="space-y-2">
          <h1 className="text-7xl font-display uppercase italic tracking-tighter leading-none">
            SP<span className="text-brand">FIRE</span>
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide">LEVEL UP YOUR FITNESS JOURNEY</p>
        </div>

        <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
          <p>The ultimate full-stack companion for runners, walkers, and cyclists.</p>
        </div>

        <button 
          onClick={() => authService.signInWithGoogle()}
          className="w-full bg-white text-black hover:bg-zinc-200 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
          Secure authentication powered by Firebase
        </p>
      </motion.div>
    </div>
  );
};
