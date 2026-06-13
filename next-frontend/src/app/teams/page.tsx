"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Trophy } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

type Team = {
  id: number;
  name: string;
  flag_emoji: string;
  fifa_rank: number;
  confederation: string;
  elo_rating: number;
  recent_form: number;
  primary_color: string;
  secondary_color: string;
};

const CONFED_COLORS: Record<string, string> = {
  UEFA: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  CONMEBOL: 'bg-green-500/20 text-green-400 border-green-500/50',
  CONCACAF: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  CAF: 'bg-red-500/20 text-red-400 border-red-500/50',
  AFC: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  OFC: 'bg-teal-500/20 text-teal-400 border-teal-500/50',
};

const COUNTRY_CODES: Record<string, string> = {
  'Argentina': 'ar', 'Brazil': 'br', 'Colombia': 'co', 'Uruguay': 'uy', 'Ecuador': 'ec', 'Paraguay': 'py',
  'USA': 'us', 'Mexico': 'mx', 'Canada': 'ca', 'Panama': 'pa', 'Haiti': 'ht', 'Curacao': 'cw',
  'France': 'fr', 'England': 'gb-eng', 'Spain': 'es', 'Germany': 'de', 'Portugal': 'pt', 'Netherlands': 'nl', 
  'Belgium': 'be', 'Croatia': 'hr', 'Italy': 'it', 'Switzerland': 'ch', 'Austria': 'at', 'Denmark': 'dk', 
  'Serbia': 'rs', 'Turkey': 'tr', 'Norway': 'no', 'Scotland': 'gb-sct', 'Sweden': 'se', 'Czech Republic': 'cz', 
  'Bosnia and Herzegovina': 'ba', 'Morocco': 'ma', 'Senegal': 'sn', 'Egypt': 'eg', 'Algeria': 'dz', 'Ghana': 'gh', 
  'Tunisia': 'tn', 'Ivory Coast': 'ci', 'South Africa': 'za', 'DR Congo': 'cd', 'Cape Verde': 'cv',
  'Japan': 'jp', 'South Korea': 'kr', 'Iran': 'ir', 'Saudi Arabia': 'sa', 'Australia': 'au', 'Iraq': 'iq', 
  'Qatar': 'qa', 'Jordan': 'jo', 'Uzbekistan': 'uz', 'New Zealand': 'nz'
};

const FILTERS = ['All', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'];

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetch('http://localhost:8000/api/teams/')
      .then(res => res.json())
      .then(data => {
        setTeams(data.results || data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredTeams = teams.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || t.confederation === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 container mx-auto">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-display font-bold mb-4"
        >
          All 48 <span className="gold-text">Nations</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-white/50 text-xl"
        >
          FIFA World Cup 2026 Participants
        </motion.p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input 
            type="text" 
            placeholder="Search nations..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter 
                  ? 'bg-gradient-to-r from-[#BF953F] to-[#D4AF37] text-black' 
                  : 'glass text-white/70 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-[#D4AF37] animate-spin" />
        </div>
      ) : (
        <motion.div 
          initial="hidden" animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
        >
          {filteredTeams.map(team => (
            <motion.div
              key={team.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group cursor-pointer"
            >
              <Link href={`/teams/${team.id}`}>
                <GlassCard padding="md" className="h-full flex flex-col items-center text-center transition-colors group-hover:border-[#D4AF37]/50">
                  <div className="w-24 h-16 mb-4 drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                    {COUNTRY_CODES[team.name] ? (
                      <img src={`https://flagcdn.com/w160/${COUNTRY_CODES[team.name]}.png`} alt={team.name} className="max-w-full max-h-full object-contain rounded-sm" />
                    ) : (
                      <span className="text-6xl">{team.flag_emoji}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{team.name}</h3>
                  
                  <div className="flex gap-2 mb-4">
                    <span className={`text-[10px] px-2 py-1 rounded-sm border font-bold ${CONFED_COLORS[team.confederation] || 'bg-white/10'}`}>
                      {team.confederation}
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-sm border bg-white/10 border-white/20 text-white/80 font-bold flex items-center gap-1">
                      <Trophy size={10} /> #{team.fifa_rank}
                    </span>
                  </div>

                  <div className="w-full mt-auto space-y-2">
                    <div className="flex justify-between text-xs text-white/60">
                      <span>ELO</span>
                      <span className="font-mono text-white">{team.elo_rating}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Form</span>
                      <span className={`font-mono ${team.recent_form > 7.5 ? 'text-green-400' : team.recent_form >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {team.recent_form}/10
                      </span>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-end justify-center pb-4">
                    <span className="text-[#D4AF37] text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all">
                      View Profile
                    </span>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
