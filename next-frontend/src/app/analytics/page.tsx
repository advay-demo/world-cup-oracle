'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ReferenceLine, Label,
} from 'recharts';
import { BarChart2, Radar as RadarIcon, TrendingUp, Brain, ChevronDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
  id: number;
  name: string;
  flag?: string;
  confederation?: string;
  elo_rating?: number;
  attack_rating?: number;
  defense_rating?: number;
  midfield_rating?: number;
  experience_rating?: number;
  form_rating?: number;
  fitness_rating?: number;
  xg_for?: number;
  xg_against?: number;
}

type TabId = 'elo' | 'power' | 'xg' | 'explainability';

// ─── Confederation Colors ─────────────────────────────────────────────────────

const CONF_COLORS: Record<string, string> = {
  UEFA: '#3b82f6',
  CONMEBOL: '#D4AF37',
  CONCACAF: '#22c55e',
  CAF: '#f97316',
  AFC: '#a855f7',
  OFC: '#06b6d4',
};

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_TEAMS: Team[] = [
  { id: 1,  name: 'Argentina',   flag: '🇦🇷', confederation: 'CONMEBOL', elo_rating: 2141, attack_rating: 94, defense_rating: 85, midfield_rating: 88, experience_rating: 96, form_rating: 90, fitness_rating: 87, xg_for: 2.41, xg_against: 0.82 },
  { id: 2,  name: 'France',      flag: '🇫🇷', confederation: 'UEFA',     elo_rating: 2083, attack_rating: 92, defense_rating: 88, midfield_rating: 87, experience_rating: 91, form_rating: 85, fitness_rating: 90, xg_for: 2.28, xg_against: 0.91 },
  { id: 3,  name: 'Brazil',      flag: '🇧🇷', confederation: 'CONMEBOL', elo_rating: 2058, attack_rating: 91, defense_rating: 83, midfield_rating: 89, experience_rating: 93, form_rating: 82, fitness_rating: 88, xg_for: 2.15, xg_against: 0.95 },
  { id: 4,  name: 'Spain',       flag: '🇪🇸', confederation: 'UEFA',     elo_rating: 2048, attack_rating: 87, defense_rating: 86, midfield_rating: 94, experience_rating: 89, form_rating: 88, fitness_rating: 91, xg_for: 2.05, xg_against: 0.88 },
  { id: 5,  name: 'England',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA',     elo_rating: 2046, attack_rating: 90, defense_rating: 84, midfield_rating: 85, experience_rating: 86, form_rating: 83, fitness_rating: 92, xg_for: 1.98, xg_against: 0.97 },
  { id: 6,  name: 'Germany',     flag: '🇩🇪', confederation: 'UEFA',     elo_rating: 2009, attack_rating: 88, defense_rating: 82, midfield_rating: 86, experience_rating: 90, form_rating: 78, fitness_rating: 89, xg_for: 1.92, xg_against: 1.08 },
  { id: 7,  name: 'Portugal',    flag: '🇵🇹', confederation: 'UEFA',     elo_rating: 2002, attack_rating: 89, defense_rating: 78, midfield_rating: 83, experience_rating: 91, form_rating: 80, fitness_rating: 85, xg_for: 1.88, xg_against: 1.05 },
  { id: 8,  name: 'Morocco',     flag: '🇲🇦', confederation: 'CAF',      elo_rating: 1893, attack_rating: 78, defense_rating: 91, midfield_rating: 82, experience_rating: 82, form_rating: 86, fitness_rating: 93, xg_for: 1.35, xg_against: 0.72 },
  { id: 9,  name: 'Netherlands', flag: '🇳🇱', confederation: 'UEFA',     elo_rating: 1986, attack_rating: 86, defense_rating: 84, midfield_rating: 82, experience_rating: 87, form_rating: 81, fitness_rating: 88, xg_for: 1.78, xg_against: 1.02 },
  { id: 10, name: 'Japan',       flag: '🇯🇵', confederation: 'AFC',      elo_rating: 1879, attack_rating: 79, defense_rating: 85, midfield_rating: 83, experience_rating: 80, form_rating: 88, fitness_rating: 95, xg_for: 1.42, xg_against: 0.88 },
  { id: 11, name: 'Croatia',     flag: '🇭🇷', confederation: 'UEFA',     elo_rating: 1940, attack_rating: 82, defense_rating: 83, midfield_rating: 89, experience_rating: 93, form_rating: 76, fitness_rating: 84, xg_for: 1.65, xg_against: 0.95 },
  { id: 12, name: 'Colombia',    flag: '🇨🇴', confederation: 'CONMEBOL', elo_rating: 1907, attack_rating: 83, defense_rating: 79, midfield_rating: 80, experience_rating: 85, form_rating: 91, fitness_rating: 88, xg_for: 1.72, xg_against: 1.12 },
  { id: 13, name: 'Belgium',     flag: '🇧🇪', confederation: 'UEFA',     elo_rating: 1966, attack_rating: 85, defense_rating: 80, midfield_rating: 81, experience_rating: 90, form_rating: 74, fitness_rating: 82, xg_for: 1.82, xg_against: 1.18 },
  { id: 14, name: 'USA',         flag: '🇺🇸', confederation: 'CONCACAF', elo_rating: 1838, attack_rating: 77, defense_rating: 78, midfield_rating: 75, experience_rating: 72, form_rating: 82, fitness_rating: 91, xg_for: 1.38, xg_against: 1.22 },
  { id: 15, name: 'Uruguay',     flag: '🇺🇾', confederation: 'CONMEBOL', elo_rating: 1954, attack_rating: 80, defense_rating: 84, midfield_rating: 78, experience_rating: 92, form_rating: 77, fitness_rating: 86, xg_for: 1.58, xg_against: 0.98 },
  { id: 16, name: 'Senegal',     flag: '🇸🇳', confederation: 'CAF',      elo_rating: 1856, attack_rating: 79, defense_rating: 80, midfield_rating: 77, experience_rating: 84, form_rating: 79, fitness_rating: 92, xg_for: 1.45, xg_against: 1.05 },
];

const SHAP_DATA = [
  { feature: 'ELO Difference',   importance: 0.342, color: '#D4AF37' },
  { feature: 'Recent Form',      importance: 0.218, color: '#22c55e' },
  { feature: 'Squad Value',      importance: 0.187, color: '#3b82f6' },
  { feature: 'WC Experience',    importance: 0.124, color: '#a855f7' },
  { feature: 'Injury Impact',    importance: 0.098, color: '#ef4444' },
  { feature: 'Home Advantage',   importance: 0.075, color: '#f97316' },
  { feature: 'Manager Quality',  importance: 0.052, color: '#06b6d4' },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomBarTooltip({ active, payload }: { active?: boolean; payload?: { payload: Team }[] }) {
  if (!active || !payload?.length) return null;
  const team = payload[0].payload;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: '#0d0d14', border: '1px solid rgba(212,175,55,0.2)' }}>
      <p className="font-bold text-white text-sm">{team.flag} {team.name}</p>
      <p className="text-[#D4AF37] font-mono font-semibold text-sm mt-1">ELO: {team.elo_rating}</p>
      <p className="text-white/40 text-xs mt-0.5">{team.confederation}</p>
    </div>
  );
}

function CustomScatterTooltip({ active, payload }: { active?: boolean; payload?: { payload: Team }[] }) {
  if (!active || !payload?.length) return null;
  const team = payload[0].payload;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: '#0d0d14', border: '1px solid rgba(212,175,55,0.2)' }}>
      <p className="font-bold text-white text-sm">{team.flag} {team.name}</p>
      <p className="text-[#D4AF37] text-xs mt-1">xG For: <span className="font-bold">{team.xg_for?.toFixed(2)}</span></p>
      <p className="text-blue-400 text-xs">xG Against: <span className="font-bold">{team.xg_against?.toFixed(2)}</span></p>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'elo',            label: 'ELO Rankings',      icon: BarChart2 },
  { id: 'power',          label: 'Power Index',        icon: RadarIcon },
  { id: 'xg',             label: 'xG Analysis',        icon: TrendingUp },
  { id: 'explainability', label: 'AI Explainability',  icon: Brain },
];

// ─── ELO Rankings Tab ─────────────────────────────────────────────────────────

function EloTab({ teams }: { teams: Team[] }) {
  const sorted = [...teams].sort((a, b) => (b.elo_rating ?? 0) - (a.elo_rating ?? 0)).slice(0, 16);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-white">ELO Rating Rankings</h2>
          <p className="text-white/40 text-sm mt-1">Top 16 nations by World Football ELO rating</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CONF_COLORS).map(([conf, color]) => (
            <span key={conf} className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
              {conf}
            </span>
          ))}
        </div>
      </div>
      <div className="h-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 0, right: 80, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis
              type="number"
              domain={[1700, 2200]}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={({ y, payload }) => {
                const team = sorted.find(t => t.name === payload.value);
                return (
                  <text x={0} y={y} dy={4} fill="rgba(255,255,255,0.7)" fontSize={12} fontWeight={500}>
                    {team?.flag} {payload.value}
                  </text>
                );
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="elo_rating" radius={[0, 6, 6, 0]} maxBarSize={24}>
              {sorted.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={CONF_COLORS[entry.confederation ?? 'UEFA'] ?? '#D4AF37'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ─── Power Index (Radar) Tab ──────────────────────────────────────────────────

const RADAR_METRICS = [
  { key: 'attack_rating',     label: 'Attack' },
  { key: 'defense_rating',    label: 'Defense' },
  { key: 'midfield_rating',   label: 'Midfield' },
  { key: 'experience_rating', label: 'Experience' },
  { key: 'form_rating',       label: 'Form' },
  { key: 'fitness_rating',    label: 'Fitness' },
] as const;

function TeamSelectSmall({ teams, value, onChange, label }: {
  teams: Team[]; value: number; onChange: (id: number) => void; label: string;
}) {
  return (
    <div className="relative">
      <label className="text-xs text-white/40 uppercase tracking-widest mb-1 block">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="appearance-none w-full pl-3 pr-8 py-2 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40 cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {teams.map(t => (
            <option key={t.id} value={t.id} className="bg-[#0d0d14]">
              {t.flag} {t.name}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
      </div>
    </div>
  );
}

function PowerTab({ teams }: { teams: Team[] }) {
  const [team1Id, setTeam1Id] = useState(teams[0]?.id ?? 1);
  const [team2Id, setTeam2Id] = useState(teams[1]?.id ?? 2);

  const t1 = teams.find(t => t.id === team1Id) ?? teams[0];
  const t2 = teams.find(t => t.id === team2Id) ?? teams[1];

  const radarData = RADAR_METRICS.map(m => ({
    metric: m.label,
    [t1?.name ?? 'Team 1']: t1?.[m.key] ?? 0,
    [t2?.name ?? 'Team 2']: t2?.[m.key] ?? 0,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6">
        <h2 className="text-xl font-black text-white mb-1">Power Index Comparison</h2>
        <p className="text-white/40 text-sm">Compare any two nations across 6 key dimensions</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 max-w-md">
        <TeamSelectSmall teams={teams} value={team1Id} onChange={setTeam1Id} label="Team A" />
        <TeamSelectSmall teams={teams} value={team2Id} onChange={setTeam2Id} label="Team B" />
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#D4AF37' }} />
          <span className="text-sm text-white/70 font-medium">{t1?.flag} {t1?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }} />
          <span className="text-sm text-white/70 font-medium">{t2?.flag} {t2?.name}</span>
        </div>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={90} domain={[60, 100]} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} axisLine={false} />
            <Radar
              name={t1?.name}
              dataKey={t1?.name ?? 'Team 1'}
              stroke="#D4AF37"
              fill="#D4AF37"
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <Radar
              name={t2?.name}
              dataKey={t2?.name ?? 'Team 2'}
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat comparison table */}
      <div className="mt-4 glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_80px] text-xs font-semibold text-white/30 uppercase tracking-widest px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span>Metric</span>
          <span className="text-center text-[#D4AF37]">{t1?.flag} {t1?.name}</span>
          <span className="text-center text-blue-400">{t2?.flag} {t2?.name}</span>
        </div>
        {RADAR_METRICS.map(m => {
          const v1 = t1?.[m.key] ?? 0;
          const v2 = t2?.[m.key] ?? 0;
          return (
            <div key={m.key} className="grid grid-cols-[1fr_80px_80px] px-5 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-sm text-white/60">{m.label}</span>
              <span className={`text-center text-sm font-bold ${v1 > v2 ? 'text-[#D4AF37]' : 'text-white/50'}`}>{v1}</span>
              <span className={`text-center text-sm font-bold ${v2 > v1 ? 'text-blue-400' : 'text-white/50'}`}>{v2}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── xG Analysis Tab ──────────────────────────────────────────────────────────

function XGTab({ teams }: { teams: Team[] }) {
  const data = teams.filter(t => t.xg_for && t.xg_against);
  const avgXgFor = data.reduce((s, t) => s + (t.xg_for ?? 0), 0) / data.length;
  const avgXgAgainst = data.reduce((s, t) => s + (t.xg_against ?? 0), 0) / data.length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6">
        <h2 className="text-xl font-black text-white mb-1">xG Analysis — Attack vs Defence</h2>
        <p className="text-white/40 text-sm">Expected Goals For vs Expected Goals Against per match</p>
      </div>

      {/* Quadrant legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Title Contenders', desc: 'High xGF, Low xGA', color: '#D4AF37', pos: '↗' },
          { label: 'Overachievers', desc: 'Low xGF, Low xGA', color: '#22c55e', pos: '↖' },
          { label: 'Struggling', desc: 'Low xGF, High xGA', color: '#ef4444', pos: '↙' },
          { label: 'Defensive', desc: 'High xGF, High xGA', color: '#3b82f6', pos: '↘' },
        ].map(q => (
          <div key={q.label} className="glass rounded-xl p-3 flex items-center gap-2">
            <span className="text-lg">{q.pos}</span>
            <div>
              <p className="text-xs font-bold" style={{ color: q.color }}>{q.label}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{q.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <XAxis
              type="number"
              dataKey="xg_for"
              name="xG For"
              domain={[1.0, 2.8]}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
            >
              <Label value="xG For (per match)" position="bottom" offset={20} fill="rgba(255,255,255,0.3)" fontSize={12} />
            </XAxis>
            <YAxis
              type="number"
              dataKey="xg_against"
              name="xG Against"
              domain={[0.5, 1.5]}
              reversed
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
            >
              <Label value="xG Against (per match)" angle={-90} position="left" offset={-8} fill="rgba(255,255,255,0.3)" fontSize={12} />
            </YAxis>
            <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '4 4', stroke: 'rgba(255,255,255,0.1)' }} />
            <ReferenceLine x={avgXgFor} stroke="rgba(255,255,255,0.1)" strokeDasharray="6 3" />
            <ReferenceLine y={avgXgAgainst} stroke="rgba(255,255,255,0.1)" strokeDasharray="6 3" />
            <Scatter
              data={data}
              shape={(props) => {
                const { cx, cy, payload } = props as { cx: number; cy: number; payload: Team };
                const isTop = (payload.xg_for ?? 0) > avgXgFor && (payload.xg_against ?? 0) < avgXgAgainst;
                return (
                  <g>
                    <circle
                      cx={cx} cy={cy} r={isTop ? 8 : 6}
                      fill={isTop ? '#D4AF37' : CONF_COLORS[payload.confederation ?? 'UEFA'] ?? '#3b82f6'}
                      fillOpacity={0.85}
                      stroke={isTop ? '#D4AF37' : 'transparent'}
                      strokeWidth={2}
                      strokeOpacity={0.4}
                    />
                    <text x={cx} y={cy - 12} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10} fontWeight={500}>
                      {payload.flag}
                    </text>
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/25 uppercase tracking-widest">Confederation:</span>
        {Object.entries(CONF_COLORS).map(([conf, color]) => (
          <span key={conf} className="flex items-center gap-1 text-xs text-white/50">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {conf}
          </span>
        ))}
        <span className="text-xs text-[#D4AF37] flex items-center gap-1 ml-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
          Title Contenders
        </span>
      </div>
    </motion.div>
  );
}

// ─── AI Explainability Tab ────────────────────────────────────────────────────

function ExplainabilityTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6">
        <h2 className="text-xl font-black text-white mb-1">AI Feature Importance</h2>
        <p className="text-white/40 text-sm">
          SHAP-style analysis: these are the factors our AI considers when predicting match outcomes
        </p>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SHAP_DATA}
              layout="vertical"
              margin={{ top: 0, right: 100, left: 40, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 0.4]}
                tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="feature"
                width={130}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, 'Importance']}
                contentStyle={{ background: '#0d0d14', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12 }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}
                itemStyle={{ color: '#D4AF37' }}
              />
              <Bar dataKey="importance" radius={[0, 8, 8, 0]} maxBarSize={28}>
                {SHAP_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SHAP_DATA.map(f => (
          <div
            key={f.feature}
            className="glass rounded-xl p-4 flex items-start gap-3 transition-all hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
              <span className="text-sm font-black" style={{ color: f.color }}>
                {(f.importance * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{f.feature}</p>
              <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                {{
                  'ELO Difference': 'The single strongest predictor — ELO encapsulates long-term strength',
                  'Recent Form': 'Last 5 match results reveal current momentum and team dynamics',
                  'Squad Value': 'Transfer market valuation as proxy for squad depth and quality',
                  'WC Experience': 'Players who have performed in WC knockout stages under pressure',
                  'Injury Impact': 'Absence of key players, particularly in midfield and attack',
                  'Home Advantage': 'Crowd effect and travel fatigue for the away side',
                  'Manager Quality': 'Tactical adaptability and big-game management history',
                }[f.feature]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('elo');
  const [teams, setTeams] = useState<Team[]>(DEMO_TEAMS);

  useEffect(() => {
    fetch('http://localhost:8000/api/teams/')
      .then(r => r.json())
      .then(data => {
        const arr = data.results ?? data;
        if (Array.isArray(arr) && arr.length > 0) setTeams(arr);
      })
      .catch(() => {/* use demo */});
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 40% at 15% 20%, rgba(212,175,55,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 80%, rgba(59,130,246,0.06) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={18} style={{ color: '#D4AF37' }} />
            <span className="text-xs font-semibold tracking-[0.25em] text-white/40 uppercase">Analytics Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Advanced <span className="gold-text">Football</span> Analytics
          </h1>
          <p className="text-white/40 mt-2 text-base">
            Data-driven insights powered by AI, ELO models, and statistical analysis
          </p>
        </motion.div>

        {/* ── Tab Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl p-1.5 mb-8 flex flex-wrap gap-1"
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex-1 min-w-[120px] justify-center"
                style={{
                  color: active ? '#040406' : 'rgba(255,255,255,0.45)',
                }}
              >
                {active && (
                  <motion.div
                    layoutId="tab-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #BF953F 0%, #D4AF37 100%)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon size={15} className="relative flex-shrink-0" />
                <span className="relative hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="glass rounded-3xl p-6 md:p-8"
          >
            {activeTab === 'elo'            && <EloTab teams={teams} />}
            {activeTab === 'power'          && <PowerTab teams={teams} />}
            {activeTab === 'xg'             && <XGTab teams={teams} />}
            {activeTab === 'explainability' && <ExplainabilityTab />}
          </motion.div>
        </AnimatePresence>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-white/20 mt-8 tracking-wide"
        >
          Data updated in real-time from our AI models · FIFA World Cup 2026 · All analytics are AI-generated estimates
        </motion.p>
      </div>
    </div>
  );
}
