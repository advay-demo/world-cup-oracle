import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { TournamentSimulator } from './pages/TournamentSimulator';
import { TeamComparison } from './pages/TeamComparison';
import { AnalyticsHub } from './pages/AnalyticsHub';
import { TeamsHub } from './pages/TeamsHub';
import { PlayerDatabase } from './pages/PlayerDatabase';
import { MatchPredictor } from './pages/MatchPredictor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<MatchPredictor />} />
            <Route path="simulator" element={<TournamentSimulator />} />
            <Route path="compare" element={<TeamComparison />} />
            <Route path="teams" element={<TeamsHub />} />
            <Route path="players" element={<PlayerDatabase />} />
            <Route path="analytics" element={<AnalyticsHub />} />
          </Route>
      </Routes>
    </Router>
  );
}

export default App;
