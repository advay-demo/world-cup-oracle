import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Users, Search, Filter } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  position: string;
  club: string;
  ai_rating: number;
  recent_form: number;
  team: {
    name: string;
    flag_url: string;
  };
}

export const PlayerDatabase: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app with 1000+ players, we'd paginate. Fetching all for demo.
    fetch('http://localhost:8000/api/players/')
      .then(res => res.json())
      .then(data => {
        // Assume API returns a list or a paginated response
        const pList = Array.isArray(data) ? data : data.results || [];
        setPlayers(pList);
        setLoading(false);
      });
  }, []);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.team.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.ai_rating - a.ai_rating);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Users className="text-primary" size={32} />
          <h1 className="text-3xl font-display font-bold gold-gradient-text">Global Player Database</h1>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search players or teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <button className="p-2 bg-surface border border-white/10 rounded-full hover:bg-white/10 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-4 font-mono text-xs text-gray-400 uppercase tracking-wider">Player</th>
                <th className="p-4 font-mono text-xs text-gray-400 uppercase tracking-wider">Nation</th>
                <th className="p-4 font-mono text-xs text-gray-400 uppercase tracking-wider">Position</th>
                <th className="p-4 font-mono text-xs text-gray-400 uppercase tracking-wider">Club</th>
                <th className="p-4 font-mono text-xs text-gray-400 uppercase tracking-wider">Form</th>
                <th className="p-4 font-mono text-xs text-primary uppercase tracking-wider text-right">AI Rating</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">Loading neural database...</td>
                </tr>
              ) : filteredPlayers.slice(0, 100).map((player, idx) => (
                <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">{player.name}</td>
                  <td className="p-4 flex items-center gap-2">
                    <span>{player.team?.flag_url}</span>
                    <span className="text-sm text-gray-300">{player.team?.name}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{player.position}</td>
                  <td className="p-4 text-sm text-gray-400">{player.club}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{width: `${(player.recent_form / 10) * 100}%`}}
                        ></div>
                      </div>
                      <span className="text-xs font-mono">{player.recent_form.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                      player.ai_rating >= 90 ? 'bg-primary/20 text-primary' : 
                      player.ai_rating >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-surface text-gray-300'
                    }`}>
                      {player.ai_rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPlayers.length > 100 && (
          <div className="p-4 text-center text-xs text-gray-500 border-t border-white/10">
            Showing top 100 results. Use search to find specific players.
          </div>
        )}
      </GlassCard>
    </div>
  );
};
