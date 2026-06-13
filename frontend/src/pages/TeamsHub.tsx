import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Globe2, Search } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  elo_rating: number;
  confederation: string;
  flag_url: string;
  recent_form: number;
}

export const TeamsHub: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/teams/')
      .then(res => res.json())
      .then(data => setTeams(data));
  }, []);

  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Globe2 className="text-primary" size={32} />
          <h1 className="text-3xl font-display font-bold gold-gradient-text">Nations Hub</h1>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search all 48 nations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredTeams.map((team, index) => (
          <GlassCard 
            key={team.id} 
            className="group hover:bg-white/10 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center text-center p-6 border-white/5 hover:border-primary/50 relative overflow-hidden"
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl -z-10"></div>
            
            <div className="text-5xl mb-4 transform group-hover:-translate-y-2 transition-transform">{team.flag_url}</div>
            <h3 className="font-bold text-lg mb-1">{team.name}</h3>
            <p className="text-xs text-gray-400 font-mono">ELO: {Math.round(team.elo_rating)}</p>
            
            <div className="mt-4 pt-4 border-t border-white/10 w-full flex justify-between text-xs">
              <span className="text-gray-500">{team.confederation}</span>
              <span className={team.recent_form >= 7.5 ? "text-green-400" : "text-yellow-400"}>Form: {team.recent_form}</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
