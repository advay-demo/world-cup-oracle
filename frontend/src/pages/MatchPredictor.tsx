import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Trophy, ArrowRight } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  elo_rating: number;
  flag_url: string;
}

interface PredictionData {
  win_prob: number;
  draw_prob: number;
  loss_prob: number;
  xg_home: number;
  xg_away: number;
  ai_confidence: number;
  ai_commentary?: string;
  is_upset_alert?: boolean;
}

export const MatchPredictor: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/teams/')
      .then(res => res.json())
      .then(data => {
        setTeams(data);
        if (data.length >= 2) {
          setHomeTeam(data[0]);
          setAwayTeam(data[1]);
        }
      });
  }, []);

  const handlePredict = async () => {
    if (!homeTeam || !awayTeam) return;
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:8000/api/predict/match/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home_team: homeTeam.id, away_team: awayTeam.id })
      });
      const data = await res.json();
      // Adjust depending on API shape (if **prediction was used vs "prediction": prediction)
      setPrediction(data.prediction || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Trophy className="text-primary" size={32} />
        <h1 className="text-3xl font-display font-bold gold-gradient-text">Match Predictor</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              Select Teams
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Home Team */}
              <div className="flex-1 w-full text-center space-y-4">
                <select 
                  className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary/50 transition-colors"
                  value={homeTeam?.id || ''}
                  onChange={e => setHomeTeam(teams.find(t => t.id === Number(e.target.value)) || null)}
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                
                <div className="w-32 h-32 mx-auto rounded-full bg-surface border-4 border-primary/30 flex items-center justify-center text-5xl shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  {homeTeam?.flag_url || '🌍'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{homeTeam?.name || 'Select Team'}</h3>
                  <p className="text-primary/80 font-mono text-sm mt-1">ELO: {Math.round(homeTeam?.elo_rating || 0)}</p>
                </div>
              </div>
              
              <div className="text-2xl md:text-4xl font-display font-bold text-gray-500 italic px-4">
                VS
              </div>
              
              {/* Away Team */}
              <div className="flex-1 w-full text-center space-y-4">
                <select 
                  className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500/50 transition-colors"
                  value={awayTeam?.id || ''}
                  onChange={e => setAwayTeam(teams.find(t => t.id === Number(e.target.value)) || null)}
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                <div className="w-32 h-32 mx-auto rounded-full bg-surface border-4 border-blue-500/30 flex items-center justify-center text-5xl">
                  {awayTeam?.flag_url || '🌍'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{awayTeam?.name || 'Select Team'}</h3>
                  <p className="text-blue-400/80 font-mono text-sm mt-1">ELO: {Math.round(awayTeam?.elo_rating || 0)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <button 
              onClick={handlePredict}
              disabled={loading}
              className="px-8 py-4 bg-primary text-background font-bold text-lg rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              {loading ? 'Simulating millions of outcomes...' : 'Run AI Simulation'} 
              {!loading && <ArrowRight size={20} />}
            </button>
          </div>
        </GlassCard>

        {/* Results Sidebar */}
        <GlassCard className="flex flex-col">
          <h2 className="text-xl font-semibold mb-6 border-b border-white/10 pb-4">AI Prediction Results</h2>
          
          {prediction ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Win Probabilities */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-primary font-bold">{homeTeam?.name}</span>
                    <span className="font-mono">{Math.round(prediction.win_prob * 100)}%</span>
                  </div>
                  <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${prediction.win_prob * 100}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Draw</span>
                    <span className="font-mono text-gray-400">{Math.round(prediction.draw_prob * 100)}%</span>
                  </div>
                  <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500 transition-all duration-1000 ease-out" style={{ width: `${prediction.draw_prob * 100}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-blue-400 font-bold">{awayTeam?.name}</span>
                    <span className="font-mono text-blue-400">{Math.round(prediction.loss_prob * 100)}%</span>
                  </div>
                  <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${prediction.loss_prob * 100}%` }}></div>
                  </div>
                </div>
              </div>
              
              {/* Expected Goals */}
              <div className="pt-4 border-t border-white/10">
                 <h3 className="text-sm text-gray-400 font-semibold mb-6 uppercase tracking-wider">Expected Goals (xG)</h3>
                 <div className="flex justify-around items-end h-32 pb-2">
                    <div className="w-1/3 flex flex-col items-center justify-end relative group">
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-2 py-1 rounded text-xs">
                        {prediction.xg_home}
                      </div>
                      <div className="w-16 bg-gradient-to-t from-primary/20 to-primary rounded-t-md transition-all duration-1000 ease-out" style={{ height: `${Math.min(100, prediction.xg_home * 30)}%` }}></div>
                      <span className="mt-3 font-mono font-bold text-lg">{prediction.xg_home.toFixed(2)}</span>
                    </div>
                    
                    <div className="w-1/3 flex flex-col items-center justify-end relative group">
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-2 py-1 rounded text-xs">
                        {prediction.xg_away}
                      </div>
                      <div className="w-16 bg-gradient-to-t from-blue-500/20 to-blue-500 rounded-t-md transition-all duration-1000 ease-out" style={{ height: `${Math.min(100, prediction.xg_away * 30)}%` }}></div>
                      <span className="mt-3 font-mono font-bold text-lg">{prediction.xg_away.toFixed(2)}</span>
                    </div>
                 </div>
              </div>

              {/* AI Commentary Block */}
              {prediction.ai_commentary && (
                <div className={`mt-6 p-4 rounded-lg border ${prediction.is_upset_alert ? 'bg-red-500/10 border-red-500/50 text-red-200' : 'bg-primary/10 border-primary/30 text-primary/90'}`}>
                  <p className="text-sm leading-relaxed italic">"{prediction.ai_commentary}"</p>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center p-8">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p>Select teams and run the simulation to see AI predictions based on 10,000+ Monte Carlo iterations.</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

// Need to import Activity for the empty state
import { Activity } from 'lucide-react';
