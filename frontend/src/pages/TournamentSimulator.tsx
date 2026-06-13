import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Trophy, ArrowRight, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WinnerProbability {
  team: string;
  prob: number;
}

interface SimulationData {
  iterations: number;
  winner_probabilities: WinnerProbability[];
}

export const TournamentSimulator: React.FC = () => {
  const [iterations, setIterations] = useState<number>(1000);
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    setSimulation(null);
    try {
      const res = await fetch('http://localhost:8000/api/predict/tournament/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iterations })
      });
      const data = await res.json();
      // add a small artificial delay for dramatic effect
      setTimeout(() => {
        setSimulation(data);
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="text-primary" size={32} />
        <h1 className="text-3xl font-display font-bold gold-gradient-text">Tournament Simulator</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Simulation Settings
          </h2>
          
          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Monte Carlo Iterations</label>
              <select 
                value={iterations}
                onChange={e => setIterations(Number(e.target.value))}
                className="w-full bg-surface/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary/50 transition-colors"
              >
                <option value={100}>100 Runs (Fast)</option>
                <option value={1000}>1,000 Runs (Standard)</option>
                <option value={5000}>5,000 Runs (Deep)</option>
                <option value={10000}>10,000 Runs (Maximum Accuracy)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Higher iterations utilize more of the AI cluster and provide more stable probabilistic trees.
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleSimulate}
            disabled={loading}
            className="w-full mt-8 px-6 py-4 bg-primary text-background font-bold rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Simulating...
              </>
            ) : (
              <>
                <Play size={20} />
                Start Simulation
              </>
            )}
          </button>
        </GlassCard>

        <GlassCard className="lg:col-span-2 relative min-h-[500px]">
           <h2 className="text-xl font-semibold mb-6 border-b border-white/10 pb-4">
             AI Predictions: Winner Probabilities
           </h2>
           
           <AnimatePresence>
             {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-xl"
                >
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-primary font-mono animate-pulse">Running {iterations} Monte Carlo simulations...</p>
                </motion.div>
             )}
           </AnimatePresence>
           
           {simulation ? (
             <div className="space-y-4">
                {simulation.winner_probabilities.map((item, index) => (
                  <motion.div 
                    key={item.team}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 bg-surface/30 p-4 rounded-lg border border-white/5"
                  >
                    <div className="w-8 text-center text-xl font-display font-bold text-gray-500">
                      #{index + 1}
                    </div>
                    <div className="flex-1 font-bold text-lg">
                      {item.team}
                    </div>
                    <div className="w-1/2">
                      <div className="h-3 bg-background rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.prob * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                          className={`h-full ${index === 0 ? 'bg-primary' : index < 4 ? 'bg-blue-400' : 'bg-gray-500'}`}
                        ></motion.div>
                      </div>
                    </div>
                    <div className="w-16 text-right font-mono font-bold text-gray-300">
                      {(item.prob * 100).toFixed(1)}%
                    </div>
                  </motion.div>
                ))}
             </div>
           ) : !loading && (
             <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center opacity-50 pb-20">
                <Trophy size={64} className="mb-4" />
                <p>Run the tournament simulation to predict the ultimate champion.</p>
             </div>
           )}
        </GlassCard>
      </div>
    </div>
  );
};
