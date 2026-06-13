"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Trophy, Settings, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function PredictorHub() {
  const [teams, setTeams] = useState<any[]>([]);
  const [homeTeam, setHomeTeam] = useState<number | null>(null);
  const [awayTeam, setAwayTeam] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/teams/')
      .then(res => res.json())
      .then(data => setTeams(data.results || data));
  }, []);

  const handlePredict = () => {
    if (!homeTeam || !awayTeam || homeTeam === awayTeam) return;
    
    setLoading(true);
    fetch(`http://localhost:8000/api/predict/match/?home_id=${homeTeam}&away_id=${awayTeam}`)
      .then(res => res.json())
      .then(data => {
        setPrediction(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 container mx-auto">
      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 glass-gold px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6"
        >
          <Settings size={16} className="animate-spin-slow" />
          V3 AI Engine Active
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-bold mb-4"
        >
          Match <span className="gold-text italic pr-4">Predictor</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-white/60 text-xl max-w-2xl mx-auto"
        >
          Select any two nations to run 10,000 Monte Carlo simulations powered by historical ELO, xG models, and squad depth.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center max-w-5xl mx-auto mb-16">
        {/* Home Team Selection */}
        <GlassCard padding="lg" className="flex flex-col text-center">
          <h2 className="text-xl font-bold mb-6 text-white/70">Home Nation</h2>
          <select 
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#D4AF37] focus:outline-none transition-colors w-full appearance-none"
            value={homeTeam || ''}
            onChange={(e) => setHomeTeam(Number(e.target.value))}
          >
            <option value="" disabled className="bg-black">Select a nation...</option>
            {teams.map(t => (
              <option key={t.id} value={t.id} className="bg-black" disabled={t.id === awayTeam}>
                {t.flag_emoji} {t.name}
              </option>
            ))}
          </select>
          {homeTeam && (
            <div className="mt-8">
              <div className="text-8xl drop-shadow-2xl mb-4">{teams.find(t => t.id === homeTeam)?.flag_emoji}</div>
              <div className="text-2xl font-bold">{teams.find(t => t.id === homeTeam)?.name}</div>
            </div>
          )}
        </GlassCard>

        {/* VS Indicator & Button */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full glass flex items-center justify-center font-bold text-xl text-[#D4AF37]">
            VS
          </div>
          
          <button
            onClick={handlePredict}
            disabled={!homeTeam || !awayTeam || loading}
            className={`px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 ${
              homeTeam && awayTeam && !loading
                ? 'bg-gradient-to-r from-[#BF953F] to-[#D4AF37] text-black hover:scale-105'
                : 'glass text-white/40 cursor-not-allowed'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <GitCompare />}
            Run Simulation
          </button>
        </div>

        {/* Away Team Selection */}
        <GlassCard padding="lg" className="flex flex-col text-center">
          <h2 className="text-xl font-bold mb-6 text-white/70">Away Nation</h2>
          <select 
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#D4AF37] focus:outline-none transition-colors w-full appearance-none"
            value={awayTeam || ''}
            onChange={(e) => setAwayTeam(Number(e.target.value))}
          >
            <option value="" disabled className="bg-black">Select a nation...</option>
            {teams.map(t => (
              <option key={t.id} value={t.id} className="bg-black" disabled={t.id === homeTeam}>
                {t.flag_emoji} {t.name}
              </option>
            ))}
          </select>
          {awayTeam && (
            <div className="mt-8">
              <div className="text-8xl drop-shadow-2xl mb-4">{teams.find(t => t.id === awayTeam)?.flag_emoji}</div>
              <div className="text-2xl font-bold">{teams.find(t => t.id === awayTeam)?.name}</div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* PREDICTION RESULTS */}
      {prediction && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <GlassCard goldBorder padding="lg">
            <h2 className="text-3xl font-display font-bold mb-8 text-center flex justify-center items-center gap-2">
              <Trophy className="text-[#D4AF37]" /> AI Prediction Results
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-white/60 mb-2">{prediction.home_team} Win</div>
                <div className="text-4xl font-bold text-green-400">{(prediction.prediction.win_prob * 100).toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 mb-2">Draw</div>
                <div className="text-4xl font-bold text-yellow-400">{(prediction.prediction.draw_prob * 100).toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 mb-2">{prediction.away_team} Win</div>
                <div className="text-4xl font-bold text-blue-400">{(prediction.prediction.loss_prob * 100).toFixed(1)}%</div>
              </div>
            </div>

            {/* Probability Bar */}
            <div className="w-full h-4 rounded-full flex overflow-hidden mb-8 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <div className="bg-green-500" style={{ width: `${prediction.prediction.win_prob * 100}%` }} />
              <div className="bg-yellow-500" style={{ width: `${prediction.prediction.draw_prob * 100}%` }} />
              <div className="bg-blue-500" style={{ width: `${prediction.prediction.loss_prob * 100}%` }} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard padding="md" className="bg-black/30">
                <h3 className="font-bold text-white/70 mb-4">Expected Goals (xG)</h3>
                <div className="flex justify-between items-center text-2xl font-mono">
                  <span>{prediction.prediction.xg_home.toFixed(2)}</span>
                  <span className="text-white/30">-</span>
                  <span>{prediction.prediction.xg_away.toFixed(2)}</span>
                </div>
              </GlassCard>
              <GlassCard padding="md" className="bg-black/30">
                <h3 className="font-bold text-white/70 mb-4">AI Confidence</h3>
                <div className="text-3xl font-mono text-[#D4AF37] text-center mt-2">
                  {(prediction.prediction.ai_confidence * 100).toFixed(1)}%
                </div>
              </GlassCard>
            </div>
            
            <div className="mt-8 p-6 bg-white/5 border border-[#D4AF37]/30 rounded-xl">
              <h3 className="font-bold text-[#D4AF37] mb-2 uppercase tracking-wide text-sm">AI Analysis</h3>
              <p className="text-white/80 leading-relaxed">
                Based on current ELO ratings, recent form, and squad market values, {prediction.prediction.win_prob > prediction.prediction.loss_prob ? prediction.home_team : prediction.away_team} is favored to win. The model factors in the strength index gap ({Math.abs(prediction.prediction.home_strength_index - prediction.prediction.away_strength_index).toFixed(2)}) and predicts a match with {(prediction.prediction.xg_home + prediction.prediction.xg_away).toFixed(2)} total expected goals.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </main>
  );
}
