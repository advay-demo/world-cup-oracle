"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Users, Activity, Trophy, Globe, ActivitySquare, Newspaper, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/ui/StatCard';

export default function TeamProfilePage() {
  const params = useParams();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [supportCount, setSupportCount] = useState(0);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    fetch(`http://localhost:8000/api/teams/${params.id}/`)
      .then(res => res.json())
      .then(data => {
        setTeam(data);
        setSupportCount(data.fan_support?.total_supporters || 0);
        setLoading(false);
      })
      .catch(console.error);
      
    fetch(`http://localhost:8000/api/teams/${params.id}/news/`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNews(data);
      })
      .catch(console.error);
  }, [params.id]);

  const handleSupport = () => {
    // Fire confetti using team colors
    const primary = team.primary_color || '#D4AF37';
    const secondary = team.secondary_color || '#ffffff';
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [primary, secondary]
    });

    // API Call
    fetch(`http://localhost:8000/api/teams/${params.id}/support/`, {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {
        if (data.total_supporters) {
          setSupportCount(data.total_supporters);
        }
      });
  };

  if (loading) return null; // Will show loading.tsx

  const { players, wc_history } = team;

  const positions = {
    'GK': players.filter((p: any) => p.position_code === 'GK'),
    'Defenders': players.filter((p: any) => ['CB', 'LB', 'RB'].includes(p.position_code)),
    'Midfielders': players.filter((p: any) => ['CDM', 'CM', 'CAM'].includes(p.position_code)),
    'Forwards': players.filter((p: any) => ['LW', 'RW', 'ST', 'CF'].includes(p.position_code)),
  };

  return (
    <main className="min-h-screen pb-20">
      {/* HERO SECTION */}
      <section 
        className="relative pt-32 pb-20 px-4 overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${team.primary_color}40 0%, transparent 70%)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#040406]" />
        
        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[120px] leading-none mb-6 drop-shadow-2xl"
          >
            {team.flag_emoji}
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-display font-bold mb-2 uppercase tracking-tight"
          >
            {team.name}
          </motion.h1>
          
          <motion.p className="text-xl text-[#D4AF37] font-medium mb-8 font-serif italic">
            {team.nickname}
          </motion.p>

          <div className="flex gap-4 mb-8">
            <span className="glass px-4 py-2 rounded-full font-bold flex items-center gap-2">
              <Globe size={16} /> {team.confederation}
            </span>
            <span className="glass px-4 py-2 rounded-full font-bold flex items-center gap-2">
              <Trophy size={16} /> FIFA Rank #{team.fifa_rank}
            </span>
          </div>
          
          <p className="text-white/60">Manager: <span className="text-white font-medium">{team.manager_name}</span></p>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-16">
        {/* QUICK STATS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={ActivitySquare} label="ELO Rating" value={team.elo_rating} />
          <StatCard icon={Globe} label="WC Appearances" value={team.world_cup_appearances} />
          <GlassCard padding="md" className="flex flex-col justify-center items-center text-center">
            <Trophy className="text-[#D4AF37] mb-2" />
            <div className="text-sm text-white/50 mb-1">Best Result</div>
            <div className="font-bold text-lg">{team.best_wc_result || 'N/A'}</div>
          </GlassCard>
          <GlassCard padding="md" className="flex flex-col justify-center items-center text-center">
            <Activity className="text-[#D4AF37] mb-2" />
            <div className="text-sm text-white/50 mb-1">Recent Form</div>
            <div className={`font-mono text-2xl font-bold ${team.recent_form > 7.5 ? 'text-green-400' : 'text-yellow-400'}`}>
              {team.recent_form}/10
            </div>
          </GlassCard>
        </section>

        {/* FAN SUPPORT */}
        <section>
          <GlassCard goldBorder padding="lg" className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-black/50 to-[#D4AF37]/10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Support Your Nation</h2>
              <p className="text-white/60">Join thousands of fans predicting success for {team.name}.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={handleSupport}
                className="px-8 py-4 rounded-full font-bold text-black bg-gradient-to-r from-[#BF953F] to-[#D4AF37] hover:scale-105 transition-transform flex items-center gap-2"
              >
                {team.flag_emoji} Support {team.name}
              </button>
              <div className="font-mono text-xl">
                Total Supporters: <span className="gold-text font-bold">{supportCount.toLocaleString()}</span>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* AI OUTLOOK */}
        <section>
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Trophy className="text-[#D4AF37]" /> AI Tournament Outlook
          </h2>
          <GlassCard padding="lg" className="text-lg leading-relaxed text-white/80 border-l-4 border-l-[#D4AF37]">
            {team.ai_outlook || "No detailed AI outlook available at this time."}
          </GlassCard>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <GlassCard padding="md">
              <h3 className="text-[#D4AF37] font-bold mb-2 uppercase tracking-wider text-sm">Strengths</h3>
              <p className="text-white/80">{team.strengths || "Not analyzed yet."}</p>
            </GlassCard>
            <GlassCard padding="md">
              <h3 className="text-red-400 font-bold mb-2 uppercase tracking-wider text-sm">Vulnerabilities</h3>
              <p className="text-white/80">{team.weaknesses || "Not analyzed yet."}</p>
            </GlassCard>
          </div>
        </section>

        {/* RECENT NEWS */}
        {news.length > 0 && (
          <section>
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
              <Newspaper className="text-[#D4AF37]" /> Latest News & AI Sentiment
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {news.map((article: any, idx: number) => (
                <a 
                  key={idx} 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <GlassCard padding="md" className="h-full flex flex-col hover:border-[#D4AF37]/40 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-white/40 uppercase tracking-wider">{article.source}</span>
                      <div 
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          article.sentiment_score > 0.3 ? 'bg-green-500/20 text-green-400' :
                          article.sentiment_score < -0.3 ? 'bg-red-500/20 text-red-400' :
                          'bg-white/10 text-white/60'
                        }`}
                      >
                        Sentiment: {article.sentiment_score > 0 ? '+' : ''}{article.sentiment_score}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-white/50 line-clamp-3 mb-4 flex-1">
                      {article.snippet}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[#D4AF37] font-semibold mt-auto">
                      Read Article <ExternalLink size={12} />
                    </div>
                  </GlassCard>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* SQUAD LIST */}
        <section>
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Users className="text-[#D4AF37]" /> Squad Overview ({team.tactical_formation})
          </h2>
          
          <div className="space-y-8">
            {Object.entries(positions).map(([groupName, groupPlayers]) => (
              (groupPlayers as any[]).length > 0 && (
                <div key={groupName}>
                  <h3 className="text-xl font-bold mb-4 text-white/70 border-b border-white/10 pb-2">{groupName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(groupPlayers as any[]).map(p => (
                      <GlassCard key={p.id} padding="sm" className="flex items-center gap-4 hover:border-[#D4AF37]/50 transition-colors">
                        <div className="w-10 text-center font-mono text-white/40 font-bold text-xl">
                          {p.jersey_number}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold flex items-center gap-2">
                            {p.name} {p.is_captain && <span className="text-xs bg-[#D4AF37] text-black px-1 rounded">C</span>}
                          </div>
                          <div className="text-xs text-white/50">{p.club}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#D4AF37] font-bold">{p.ai_rating}</div>
                          <div className="text-xs text-white/50">€{p.market_value}M</div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
