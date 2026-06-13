import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { BarChart3, Database, Brain, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AnalyticsHub: React.FC = () => {
  // Mock SHAP values for AI Explainability
  const shapData = [
    { feature: 'ELO Difference', value: 0.35 },
    { feature: 'Recent Form', value: 0.21 },
    { feature: 'Historical Head-to-Head', value: 0.15 },
    { feature: 'Expected Goals (xG)', value: 0.12 },
    { feature: 'Home Advantage', value: 0.08 },
    { feature: 'Injury Impact', value: 0.05 },
    { feature: 'Weather Conditions', value: 0.04 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <BarChart3 className="text-primary" size={32} />
        <h1 className="text-3xl font-display font-bold gold-gradient-text">AI Explainability Hub</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Key Metrics */}
        <div className="lg:col-span-1 space-y-6">
           <GlassCard className="flex items-center gap-4 p-4">
             <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
               <Brain size={24} />
             </div>
             <div>
               <p className="text-xs text-gray-400 uppercase tracking-wider">Active Models</p>
               <p className="text-xl font-bold font-mono">9 Ensemble</p>
             </div>
           </GlassCard>
           
           <GlassCard className="flex items-center gap-4 p-4">
             <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
               <Database size={24} />
             </div>
             <div>
               <p className="text-xs text-gray-400 uppercase tracking-wider">Training Rows</p>
               <p className="text-xl font-bold font-mono">1.2M+</p>
             </div>
           </GlassCard>
           
           <GlassCard className="flex items-center gap-4 p-4">
             <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
               <Activity size={24} />
             </div>
             <div>
               <p className="text-xs text-gray-400 uppercase tracking-wider">Model Accuracy</p>
               <p className="text-xl font-bold font-mono">82.4%</p>
             </div>
           </GlassCard>
        </div>

        {/* SHAP Values Chart */}
        <GlassCard className="lg:col-span-3 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Global Feature Importance (SHAP)</h2>
          <p className="text-sm text-gray-400 mb-8">
            This chart explains which metrics the AI values the most when predicting match outcomes. 
            ELO Difference remains the strongest predictor of victory.
          </p>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={shapData}
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 0.4]} tick={{fill: '#9ca3af'}} />
                <YAxis dataKey="feature" type="category" tick={{fill: '#e5e7eb', fontSize: 12}} width={140} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1A233A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37' }}
                  formatter={(value: number) => [(value * 100).toFixed(1) + '%', 'Importance']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {shapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#D4AF37' : '#3b82f6'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
