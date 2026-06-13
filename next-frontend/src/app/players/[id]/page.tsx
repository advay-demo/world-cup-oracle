'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCircle2, Shield, Activity, TrendingUp, AlertCircle, Goal, Flame } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/ui/StatCard';

interface PlayerDetail {
  id: number;
  name: string;
  nation: string;
  nation_flag: string;
  position: string;
  club: string;
  club_country: string;
  ai_rating: number;
  market_value: number;
  goals: number;
  appearances: number;
  recent_form: number;
  is_injured: boolean;
  injury_detail: string | null;
  is_captain: boolean;
  age: number;
  height_cm: number;
}

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

export default function PlayerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/players/${id}/`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        setPlayer(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo data
        setPlayer({
          id: Number(id),
          name: 'Kylian Mbappé',
          nation: 'France',
          nation_flag: '🇫🇷',
          position: 'ST',
          club: 'Real Madrid',
          club_country: 'Spain',
          ai_rating: 97.2,
          market_value: 180.0,
          goals: 46,
          appearances: 75,
          recent_form: 9.2,
          is_injured: false,
          injury_detail: null,
          is_captain: true,
          age: 25,
          height_cm: 178,
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center items-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!player) return null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Players
        </button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 items-start mb-10"
        >
          {/* Avatar/Flag box */}
          <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 rounded-3xl glass-gold flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-transparent z-0" />
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=111111&color=D4AF37&size=256&bold=true&font-size=0.33`} 
              alt={player.name}
              className="absolute inset-0 w-full h-full object-cover z-10 opacity-90 group-hover:scale-105 transition-transform duration-500"
            />
            {player.is_captain && (
              <span className="absolute top-4 right-4 z-20 text-xs font-black bg-[#D4AF37] text-black px-2 py-0.5 rounded-full shadow-lg">
                C
              </span>
            )}
            <div className="absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-md p-2 rounded-sm border border-white/10 flex items-center justify-center">
              {COUNTRY_CODES[player.nation] ? (
                <img src={`https://flagcdn.com/w40/${COUNTRY_CODES[player.nation]}.png`} alt={player.nation} className="w-8 h-5 object-contain rounded-sm" />
              ) : (
                <span className="text-xl">{player.nation_flag}</span>
              )}
            </div>
          </div>

          {/* Name & Title */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-sm font-bold bg-white/10 rounded-lg">{player.position}</span>
              <span className="text-[#D4AF37] font-semibold text-sm tracking-widest uppercase">
                {player.nation} National Team
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-4">{player.name}</h1>
            
            <div className="flex flex-wrap gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-white/40" />
                {player.club}
              </div>
              <div className="flex items-center gap-2">
                <UserCircle2 size={16} className="text-white/40" />
                {player.age} Years Old
              </div>
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-white/40" />
                {player.height_cm} cm
              </div>
            </div>

            {player.is_injured && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm">
                <AlertCircle size={15} />
                <span className="font-semibold">Currently Injured</span>
                <span className="opacity-70">- {player.injury_detail ?? 'Unspecified'}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Flame}
            label="AI Rating"
            value={player.ai_rating}
            decimals={1}
            goldBorder={player.ai_rating >= 90}
            trend="up"
            trendValue="Top 5%"
          />
          <StatCard
            icon={TrendingUp}
            label="Market Value"
            value={player.market_value}
            prefix="€"
            suffix="M"
            accentColor="#3b82f6"
          />
          <StatCard
            icon={Goal}
            label="National Goals"
            value={player.goals}
            accentColor="#22c55e"
          />
          <StatCard
            icon={Activity}
            label="Recent Form"
            value={player.recent_form}
            decimals={1}
            suffix="/10"
            accentColor="#a855f7"
          />
        </div>

      </div>
    </div>
  );
}
