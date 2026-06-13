'use client';

import { motion } from 'framer-motion';
import { Trophy, Globe2, MapPin, CalendarDays, Users } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function WorldCupPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center glass-gold mb-6 shadow-2xl shadow-[#D4AF37]/20">
            <Trophy size={40} className="text-[#D4AF37]" />
          </div>
          <span className="text-sm font-semibold tracking-[0.3em] text-[#D4AF37] uppercase">
            The Greatest Show on Earth
          </span>
          <h1 className="text-5xl md:text-7xl font-black mt-4 tracking-tight">
            FIFA World Cup <span className="gold-text">2026</span>
          </h1>
          <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            The 23rd FIFA World Cup will be the largest edition in history, featuring 48 teams
            competing across 3 host nations and 16 iconic cities in North America.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard padding="lg" hoverGlow className="h-full flex flex-col items-center">
              <Globe2 size={32} className="text-blue-400 mb-4" />
              <h3 className="text-3xl font-black text-white">3</h3>
              <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mt-1">Host Nations</p>
              <p className="text-xs text-white/30 mt-3">USA, Canada, Mexico</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard padding="lg" hoverGlow className="h-full flex flex-col items-center">
              <Users size={32} className="text-green-400 mb-4" />
              <h3 className="text-3xl font-black text-white">48</h3>
              <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mt-1">Teams</p>
              <p className="text-xs text-white/30 mt-3">Expanded from 32</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard padding="lg" hoverGlow className="h-full flex flex-col items-center">
              <MapPin size={32} className="text-red-400 mb-4" />
              <h3 className="text-3xl font-black text-white">16</h3>
              <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mt-1">Host Cities</p>
              <p className="text-xs text-white/30 mt-3">Across North America</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard padding="lg" hoverGlow className="h-full flex flex-col items-center">
              <CalendarDays size={32} className="text-purple-400 mb-4" />
              <h3 className="text-3xl font-black text-white">104</h3>
              <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mt-1">Matches</p>
              <p className="text-xs text-white/30 mt-3">June 11 - July 19</p>
            </GlassCard>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
