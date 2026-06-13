import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GitCompare, Loader2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Team {
  id: number;
  name: string;
  elo_rating: number;
  flag_url: string;
}

export const TeamComparison: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [team1Id, setTeam1Id] = useState<number | null>(null);
  const [team2Id, setTeam2Id] = useState<number | null>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/teams/')
      .then(res => res.json())
      .then(data => {
        setTeams(data);
        if (data.length >= 2) {
          setTeam1Id(data[0].id);
          setTeam2Id(data[1].id);
        }
      });
  }, []);

  const handleCompare = async () => {
    if (!team1Id || !team2Id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/teams/${team1Id}/compare/?team_id2=${team2Id}`);
      const data = await res.json();
      setComparisonData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format data for Recharts Radar
  const radarData = comparisonData ? Object.keys(comparisonData.comparison_metrics).map(metric => ({
    subject: metric.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    A: comparisonData.comparison_metrics[metric][comparisonData.team1.name],
    B: comparisonData.comparison_metrics[metric][comparisonData.team2.name],
    fullMark: 100,
  })) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <GitCompare className="text-primary" size={32} />
        <h1 className="text-3xl font-display font-bold gold-gradient-text">Team Comparison Engine</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col">
          <h2 className="text-xl font-semibold mb-6">Select Teams</h2>
          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Team A</label>
              <select 
                value={team1Id || ''}
                onChange={e => setTeam1Id(Number(e.target.value))}
                className="w-full bg-surface/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary/50 transition-colors"
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            
            <div className="text-center font-bold text-gray-500 italic">VS</div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Team B</label>
              <select 
                value={team2Id || ''}
                onChange={e => setTeam2Id(Number(e.target.value))}
                className="w-full bg-surface/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500/50 transition-colors"
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleCompare}
            disabled={loading}
            className="w-full mt-8 px-6 py-4 bg-primary text-background font-bold rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <GitCompare size={20} />}
            Generate Analytics
          </button>
        </GlassCard>

        <GlassCard className="lg:col-span-2 min-h-[500px] flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Tactical Radar</h2>
          
          {comparisonData ? (
             <div className="flex-1 flex flex-col">
               <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{comparisonData.team1.flag_url}</span>
                    <div>
                      <h3 className="font-bold text-primary">{comparisonData.team1.name}</h3>
                      <p className="text-xs text-gray-400">ELO: {Math.round(comparisonData.team1.elo_rating)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <h3 className="font-bold text-blue-400">{comparisonData.team2.name}</h3>
                      <p className="text-xs text-gray-400">ELO: {Math.round(comparisonData.team2.elo_rating)}</p>
                    </div>
                    <span className="text-3xl">{comparisonData.team2.flag_url}</span>
                  </div>
               </div>
               
               <div className="flex-1 min-h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4b5563' }} />
                      <Radar name={comparisonData.team1.name} dataKey="A" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.4} />
                      <Radar name={comparisonData.team2.name} dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1A233A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
             </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
               <GitCompare size={64} className="mb-4" />
               <p>Select two teams to generate a tactical capability radar.</p>
             </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
