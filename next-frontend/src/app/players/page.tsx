'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  AlertCircle, Users, SlidersHorizontal, X
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Player {
  id: number;
  name: string;
  nation: string;
  nation_flag?: string;
  confederation?: string;
  position: string;
  club: string;
  ai_rating: number;
  market_value?: number;
  goals?: number;
  appearances?: number;
  recent_form?: number | string; // e.g. "WWLDW" or 8.5
  is_injured?: boolean;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Player[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const POSITIONS = ['All', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
const CONFEDERATIONS = ['All', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'];
const SORT_OPTIONS = [
  { label: 'AI Rating', value: 'ai_rating' },
  { label: 'Market Value', value: 'market_value' },
  { label: 'Goals', value: 'goals' },
  { label: 'Appearances', value: 'appearances' },
];
const PAGE_SIZE = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPositionGroup(pos: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  if (pos === 'GK') return 'GK';
  if (['CB', 'LB', 'RB'].includes(pos)) return 'DEF';
  if (['CDM', 'CM', 'CAM'].includes(pos)) return 'MID';
  return 'FWD';
}

const positionColors: Record<string, string> = {
  GK: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  DEF: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MID: 'bg-green-500/20 text-green-400 border-green-500/30',
  FWD: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function getRatingStyle(rating: number): string {
  if (rating >= 90) return 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40 font-bold';
  if (rating >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30 font-semibold';
  return 'bg-white/10 text-white/80 border-white/20';
}

function formatMarketValue(value?: number): string {
  if (!value) return '—';
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `€${(value / 1_000).toFixed(0)}k`;
  return `€${value}`;
}

function getFlagEmoji(countryCode?: string): string {
  if (!countryCode) return '🏳️';
  return countryCode;
}

// ─── Form Bar ─────────────────────────────────────────────────────────────────

function FormBar({ form }: { form?: number | string }) {
  if (form === undefined) return <span className="text-white/20 text-xs">—</span>;
  
  let chars: string[] = [];
  if (typeof form === 'string') {
    chars = form.slice(-5).split('');
  } else {
    if (form >= 9.0) chars = ['W', 'W', 'W', 'W', 'W'];
    else if (form >= 8.0) chars = ['W', 'W', 'W', 'W', 'D'];
    else if (form >= 7.0) chars = ['W', 'W', 'D', 'W', 'D'];
    else if (form >= 6.0) chars = ['W', 'D', 'L', 'W', 'D'];
    else if (form >= 5.0) chars = ['D', 'L', 'W', 'D', 'L'];
    else if (form >= 4.0) chars = ['L', 'D', 'L', 'D', 'L'];
    else chars = ['L', 'L', 'L', 'L', 'L'];
  }

  const colorMap: Record<string, string> = { W: 'bg-green-500', D: 'bg-yellow-500', L: 'bg-red-500' };
  return (
    <div className="flex gap-0.5 items-center">
      {chars.map((c, i) => (
        <div
          key={i}
          className={`w-2 h-4 rounded-sm ${colorMap[c] ?? 'bg-white/20'}`}
          title={c === 'W' ? 'Win' : c === 'D' ? 'Draw' : 'Loss'}
        />
      ))}
    </div>
  );
}

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

function FilterSelect({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: string[] | { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none cursor-pointer pl-3 pr-8 py-2 rounded-lg text-sm font-medium text-white/80 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val} className="bg-[#0d0d14]">
              {lbl === 'All' ? `${label}: All` : lbl}
            </option>
          );
        })}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function PlayerRow({
  player, rank, onClick,
}: {
  player: Player;
  rank: number;
  onClick: () => void;
}) {
  const posGroup = getPositionGroup(player.position);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group border-b cursor-pointer transition-colors duration-150"
      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.04)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {/* Rank */}
      <td className="pl-6 pr-3 py-3.5 text-center">
        <span className={`text-sm font-mono ${rank <= 10 ? 'text-[#D4AF37] font-bold' : 'text-white/30'}`}>
          {rank}
        </span>
      </td>

      {/* Name */}
      <td className="px-3 py-3.5">
        <div className="flex items-center gap-2">
          {player.is_injured && (
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" title="Injured" />
          )}
          <span className="font-semibold text-white text-sm group-hover:text-[#D4AF37] transition-colors">
            {player.name}
          </span>
        </div>
      </td>

      {/* Nation */}
      <td className="px-3 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{getFlagEmoji(player.nation_flag)}</span>
          <span className="text-sm text-white/60 hidden sm:inline">{player.nation}</span>
        </div>
      </td>

      {/* Position */}
      <td className="px-3 py-3.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${positionColors[posGroup]}`}>
          {player.position}
        </span>
      </td>

      {/* Club */}
      <td className="px-3 py-3.5 hidden md:table-cell">
        <span className="text-sm text-white/50">{player.club}</span>
      </td>

      {/* AI Rating */}
      <td className="px-3 py-3.5">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-sm border ${getRatingStyle(player.ai_rating)}`}>
          {player.ai_rating.toFixed(1)}
        </span>
      </td>

      {/* Market Value */}
      <td className="px-3 py-3.5 hidden lg:table-cell">
        <span className="text-sm text-white/60 font-mono">
          {formatMarketValue(player.market_value)}
        </span>
      </td>

      {/* Recent Form */}
      <td className="px-3 py-3.5 hidden xl:table-cell">
        <FormBar form={player.recent_form} />
      </td>

      {/* Injury */}
      <td className="px-3 pr-6 py-3.5 text-center">
        {player.is_injured && (
          <span title="Injured" className="inline-block">
            <AlertCircle size={15} className="text-red-500" />
          </span>
        )}
      </td>
    </motion.tr>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow({ i }: { i: number }) {
  return (
    <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
      {[40, 150, 80, 60, 110, 55, 70, 60, 20].map((w, j) => (
        <td key={j} className="px-3 py-4">
          <div
            className="h-3 rounded animate-pulse"
            style={{
              width: w,
              background: 'rgba(255,255,255,0.06)',
              animationDelay: `${i * 40 + j * 10}ms`,
            }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('All');
  const [confederation, setConfederation] = useState('All');
  const [sortBy, setSortBy] = useState('ai_rating');
  const [page, setPage] = useState(1);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (position !== 'All') params.set('position', position);
      if (confederation !== 'All') params.set('confederation', confederation);
      params.set('ordering', `-${sortBy}`);
      params.set('page', String(page));
      params.set('page_size', String(PAGE_SIZE));

      const res = await fetch(`http://localhost:8000/api/players/?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PaginatedResponse = await res.json();
      setPlayers(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error(err);
      setError('Failed to load players. Using demo data.');
      // Demo data fallback
      const demo: Player[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: ['Kylian Mbappé', 'Erling Haaland', 'Vinicius Jr.', 'Pedri', 'Rodri',
          'Jude Bellingham', 'Phil Foden', 'Bukayo Saka', 'Lautaro Martínez', 'Florian Wirtz',
          'Harry Kane', 'Mohamed Salah', 'Rúben Dias', 'Federico Valverde', 'Khvicha Kvaratskhelia',
          'Gavi', 'Jamal Musiala', 'Victor Osimhen', 'Kim Min-jae', 'Ademola Lookman'][i],
        nation: ['France', 'Norway', 'Brazil', 'Spain', 'Spain', 'England', 'England',
          'England', 'Argentina', 'Germany', 'England', 'Egypt', 'Portugal', 'Uruguay',
          'Georgia', 'Spain', 'Germany', 'Nigeria', 'South Korea', 'Nigeria'][i],
        nation_flag: ['🇫🇷', '🇳🇴', '🇧🇷', '🇪🇸', '🇪🇸', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇦🇷', '🇩🇪',
          '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇪🇬', '🇵🇹', '🇺🇾', '🇬🇪', '🇪🇸', '🇩🇪', '🇳🇬', '🇰🇷', '🇳🇬'][i],
        confederation: ['UEFA', 'UEFA', 'CONMEBOL', 'UEFA', 'UEFA', 'UEFA', 'UEFA',
          'UEFA', 'CONMEBOL', 'UEFA', 'UEFA', 'CAF', 'UEFA', 'CONMEBOL', 'UEFA',
          'UEFA', 'UEFA', 'CAF', 'AFC', 'CAF'][i],
        position: ['ST', 'ST', 'LW', 'CM', 'CDM', 'CAM', 'CAM', 'RW', 'ST', 'CAM',
          'ST', 'RW', 'CB', 'CM', 'LW', 'CM', 'CAM', 'ST', 'CB', 'LW'][i],
        club: ['Real Madrid', 'Man City', 'Real Madrid', 'Barcelona', 'Man City', 'Real Madrid',
          'Man City', 'Arsenal', 'Inter Milan', 'Bayer Leverkusen', 'Bayern Munich', 'Liverpool',
          'Man City', 'Real Madrid', 'Napoli', 'Barcelona', 'Bayern Munich', 'Galatasaray',
          'Bayern Munich', 'Atalanta'][i],
        ai_rating: [97.2, 95.8, 94.1, 92.5, 91.8, 91.2, 90.9, 90.3, 89.7, 89.4,
          88.8, 88.5, 87.9, 87.3, 86.8, 86.2, 85.9, 85.3, 84.7, 84.1][i],
        market_value: [180, 200, 160, 90, 120, 150, 130, 140, 110, 100,
          100, 80, 80, 100, 90, 70, 100, 80, 60, 40][i].valueOf() * 1_000_000,
        goals: [27, 36, 24, 10, 5, 18, 22, 20, 28, 15, 25, 22, 2, 12, 14, 8, 18, 25, 3, 12][i],
        appearances: [32, 34, 30, 28, 35, 33, 31, 34, 33, 29, 35, 33, 34, 32, 30, 25, 30, 28, 33, 28][i],
        recent_form: ['WWWWW', 'WWLWW', 'WDWWW', 'WDWDW', 'WWWDL', 'WWWWL', 'WWWWW',
          'WDWWW', 'WWLWW', 'WWWWW', 'WDWLW', 'WWWWL', 'WWDWW', 'LWWWW', 'WLWWW',
          'DWWLW', 'WWWWL', 'WLWWW', 'WDWWW', 'WWWDW'][i],
        is_injured: [false, false, false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, true, false, false][i],
      }));
      setPlayers(demo);
      setTotalCount(demo.length);
    } finally {
      setLoading(false);
    }
  }, [search, position, confederation, sortBy, page]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Debounce search
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // Reset page on filter change
  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,55,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} style={{ color: '#D4AF37' }} />
                <span className="text-xs font-semibold tracking-[0.25em] text-white/40 uppercase">
                  Player Database
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                Global <span className="gold-text">Player</span> Database
              </h1>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-sm font-semibold text-[#D4AF37]">
                {loading ? '...' : totalCount.toLocaleString()} Players
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search players, clubs, nations..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <FilterSelect
              label="Position"
              value={position}
              options={POSITIONS}
              onChange={handleFilterChange(setPosition)}
            />
            <FilterSelect
              label="Confederation"
              value={confederation}
              options={CONFEDERATIONS}
              onChange={handleFilterChange(setConfederation)}
            />
            <FilterSelect
              label="Sort by"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={handleFilterChange(setSortBy)}
            />
          </div>

          <div className="flex items-center gap-1.5 text-white/30">
            <SlidersHorizontal size={14} />
            <span className="text-xs">Filters</span>
          </div>
        </motion.div>

        {/* ── Error Banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-yellow-400"
              style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}
            >
              <AlertCircle size={15} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['#', 'Player', 'Nation', 'Pos', 'Club', 'AI Rating', 'Value', 'Form', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`
                        py-3 px-3 text-left text-xs font-semibold tracking-[0.15em] uppercase text-white/30
                        ${i === 0 ? 'pl-6' : ''}
                        ${i === 4 ? 'hidden md:table-cell' : ''}
                        ${i === 6 ? 'hidden lg:table-cell' : ''}
                        ${i === 7 ? 'hidden xl:table-cell' : ''}
                      `}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {loading
                    ? Array.from({ length: 10 }, (_, i) => <SkeletonRow key={i} i={i} />)
                    : players.map((player, idx) => (
                      <PlayerRow
                        key={player.id}
                        player={player}
                        rank={(page - 1) * PAGE_SIZE + idx + 1}
                        onClick={() => router.push(`/players/${player.id}`)}
                      />
                    ))
                  }
                </AnimatePresence>

                {!loading && players.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-white/30">
                      <div className="flex flex-col items-center gap-3">
                        <Users size={32} className="opacity-30" />
                        <p>No players found matching your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-sm text-white/30">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          pageNum === page
                            ? 'text-[#040406] font-bold'
                            : 'text-white/40 hover:text-white'
                        }`}
                        style={
                          pageNum === page
                            ? { background: 'linear-gradient(135deg, #BF953F, #D4AF37)' }
                            : { background: 'rgba(255,255,255,0.04)' }
                        }
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>

              <p className="text-sm text-white/30 hidden sm:block">
                Page {page} / {totalPages}
              </p>
            </div>
          )}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap gap-4 items-center px-2"
        >
          <span className="text-xs text-white/25 uppercase tracking-widest">Position legend:</span>
          {Object.entries({ GK: positionColors.GK, DEF: positionColors.DEF, MID: positionColors.MID, FWD: positionColors.FWD }).map(([k, v]) => (
            <span key={k} className={`px-2 py-0.5 rounded text-xs font-bold border ${v}`}>{k}</span>
          ))}
          <span className="text-xs text-white/25 ml-4">Rating:</span>
          <span className="px-2 py-0.5 rounded text-xs font-bold border bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40">90+ Elite</span>
          <span className="px-2 py-0.5 rounded text-xs font-bold border bg-green-500/20 text-green-400 border-green-500/30">80-89 World Class</span>
          <span className="ml-2 flex items-center gap-1.5 text-xs text-white/25">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Injured
          </span>
        </motion.div>
      </div>
    </div>
  );
}
