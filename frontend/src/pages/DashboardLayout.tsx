import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Trophy, Swords, GitCompare, BarChart3, Globe2, Users, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface/50 border-r border-white/10 p-6 flex flex-col backdrop-blur-md">
        <div className="flex items-center mb-10 gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Trophy className="text-background" size={24} />
          </div>
          <h2 className="text-xl font-display font-bold gold-gradient-text">Oracle AI</h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          <ul className="space-y-1">
            <li>
              <Link to="/dashboard" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Swords size={20} />
                Match Predictor
              </Link>
            </li>
            <li>
              <Link to="/dashboard/simulator" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/simulator' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Trophy size={20} />
                Tournament Simulator
              </Link>
            </li>
            <li>
              <Link to="/dashboard/teams" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/teams' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Globe2 size={20} />
                Teams Hub
              </Link>
            </li>
            <li>
              <Link to="/dashboard/players" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/players' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Users size={20} />
                Player Database
              </Link>
            </li>
            <li>
              <Link to="/dashboard/compare" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/compare' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <GitCompare size={20} />
                Team Comparison
              </Link>
            </li>
            <li>
              <Link to="/dashboard/analytics" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/dashboard/analytics' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <BarChart3 size={20} />
                Analytics Hub
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-auto">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors w-full">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
