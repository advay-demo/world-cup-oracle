'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Short label below the value */
  label: string;
  /** Numeric value to count up to */
  value: number;
  /** Suffix appended to the number, e.g. '%', 'K', '+' */
  suffix?: string;
  /** Prefix before the number, e.g. '$' */
  prefix?: string;
  /** Number of decimal places to show */
  decimals?: number;
  /** Sub-label / description text */
  description?: string;
  /** Use gold border variant */
  goldBorder?: boolean;
  /** Accent color for icon bg (defaults to gold) */
  accentColor?: string;
  /** Trend indicator */
  trend?: 'up' | 'down' | 'neutral';
  /** Trend value displayed as sub-text */
  trendValue?: string;
  className?: string;
}

// ─── Animated count-up hook ───────────────────────────────────────────────────

function useCountUp(target: number, decimals = 0, duration = 1.8) {
  const spring = useSpring(0, { stiffness: 60, damping: 18, duration: duration * 1000 });
  const display = useTransform(spring, (v) => v.toFixed(decimals));

  useEffect(() => {
    spring.set(target);
  }, [spring, target]);

  return display;
}

// ─── Trend icon ───────────────────────────────────────────────────────────────

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  if (trend === 'neutral') {
    return <span className="text-white/30 text-xs">—</span>;
  }
  const isUp = trend === 'up';
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      style={{ color: isUp ? '#22c55e' : '#ef4444' }}
    >
      <path
        d={isUp ? 'M6 1 L11 8 H1 Z' : 'M6 11 L11 4 H1 Z'}
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix      = '',
  prefix      = '',
  decimals    = 0,
  description,
  goldBorder  = false,
  accentColor = '#D4AF37',
  trend,
  trendValue,
  className   = '',
}: StatCardProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [started, setStarted] = useState(false);

  // Only start counting when in view
  useEffect(() => {
    if (inView) setStarted(true);
  }, [inView]);

  const display = useCountUp(started ? value : 0, decimals);

  const isGold = goldBorder;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -6,
        boxShadow: isGold
          ? '0 24px 64px rgba(212,175,55,0.2), 0 0 0 1px rgba(212,175,55,0.25)'
          : '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1)',
        transition: { type: 'spring', stiffness: 350, damping: 28 },
      }}
      className={`
        relative flex flex-col gap-4 rounded-2xl p-6 overflow-hidden
        ${isGold ? 'glass-gold' : 'glass'}
        ${className}
      `}
    >
      {/* ── Background accent glow ── */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
        style={{ background: accentColor }}
      />

      {/* ── Top row: icon + trend ── */}
      <div className="flex items-start justify-between">
        {/* Icon bubble */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={inView ? { scale: 1, rotate: 0 } : {}}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
          className="flex items-center justify-center w-11 h-11 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}08 100%)`,
            border: `1px solid ${accentColor}33`,
          }}
        >
          <Icon
            size={20}
            style={{ color: accentColor }}
            strokeWidth={1.8}
          />
        </motion.div>

        {/* Trend pill */}
        {trend && trendValue && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background:
                trend === 'up'
                  ? 'rgba(34,197,94,0.12)'
                  : trend === 'down'
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(255,255,255,0.06)',
              border:
                trend === 'up'
                  ? '1px solid rgba(34,197,94,0.25)'
                  : trend === 'down'
                  ? '1px solid rgba(239,68,68,0.25)'
                  : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <TrendArrow trend={trend} />
            <span
              className="text-[10px] font-bold"
              style={{
                color:
                  trend === 'up'
                    ? '#22c55e'
                    : trend === 'down'
                    ? '#ef4444'
                    : 'rgba(255,255,255,0.4)',
              }}
            >
              {trendValue}
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Value ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-0.5">
          {prefix && (
            <span
              className="text-lg font-semibold"
              style={{ color: accentColor, opacity: 0.8 }}
            >
              {prefix}
            </span>
          )}
          <motion.span
            className="font-black tabular-nums leading-none gold-text"
            style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', letterSpacing: '-0.02em' }}
          >
            {display}
          </motion.span>
          {suffix && (
            <span
              className="text-xl font-bold ml-0.5"
              style={{ color: accentColor, opacity: 0.75 }}
            >
              {suffix}
            </span>
          )}
        </div>

        {/* Label */}
        <p className="text-sm font-semibold text-white/60 tracking-wide">{label}</p>

        {/* Description */}
        {description && (
          <p className="text-xs text-white/30 leading-relaxed mt-1">{description}</p>
        )}
      </div>

      {/* ── Bottom rule ── */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}30, transparent)`,
        }}
      />
    </motion.div>
  );
}

export default StatCard;
