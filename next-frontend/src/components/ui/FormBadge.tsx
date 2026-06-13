'use client';

import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormResult = 'W' | 'D' | 'L';

interface FormBadgeProps {
  /** Array of up to 5 form results, e.g. ['W','W','D','L','W'] */
  results: FormResult[];
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show result label inside badge */
  showLabel?: boolean;
  className?: string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const colorMap: Record<FormResult, { bg: string; border: string; text: string; glow: string }> = {
  W: {
    bg:     'rgba(34,197,94,0.14)',
    border: 'rgba(34,197,94,0.35)',
    text:   '#22c55e',
    glow:   '0 0 12px rgba(34,197,94,0.3)',
  },
  D: {
    bg:     'rgba(234,179,8,0.14)',
    border: 'rgba(234,179,8,0.35)',
    text:   '#eab308',
    glow:   '0 0 12px rgba(234,179,8,0.25)',
  },
  L: {
    bg:     'rgba(239,68,68,0.14)',
    border: 'rgba(239,68,68,0.35)',
    text:   '#ef4444',
    glow:   '0 0 12px rgba(239,68,68,0.25)',
  },
};

const sizeMap = {
  sm: { box: 'w-6 h-6',   text: 'text-[9px]',  gap: 'gap-1'   },
  md: { box: 'w-8 h-8',   text: 'text-[11px]', gap: 'gap-1.5' },
  lg: { box: 'w-10 h-10', text: 'text-xs',      gap: 'gap-2'   },
};

const labelMap: Record<FormResult, string> = {
  W: 'W',
  D: 'D',
  L: 'L',
};

// ─── Variants ─────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const badgeVariants = {
  hidden:  { opacity: 0, scale: 0.5, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 22 },
  },
};

// ─── Single badge ─────────────────────────────────────────────────────────────

function SingleBadge({
  result,
  size = 'md',
  showLabel = true,
}: {
  result: FormResult;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}) {
  const colors = colorMap[result];
  const sizes  = sizeMap[size];

  return (
    <motion.div
      variants={badgeVariants}
      whileHover={{ scale: 1.18, boxShadow: colors.glow }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`
        ${sizes.box}
        relative flex items-center justify-center
        rounded-md font-black
        ${sizes.text}
        select-none cursor-default
        transition-shadow duration-200
      `}
      style={{
        background:  colors.bg,
        border:      `1px solid ${colors.border}`,
        color:        colors.text,
        boxShadow:   `inset 0 1px 0 rgba(255,255,255,0.06)`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      aria-label={`Form result: ${result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}`}
    >
      {showLabel && labelMap[result]}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FormBadge({
  results,
  size      = 'md',
  showLabel = true,
  className = '',
}: FormBadgeProps) {
  const displayResults = results.slice(0, 5);
  const sizes = sizeMap[size];

  return (
    <motion.div
      className={`flex items-center ${sizes.gap} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={`Recent form: ${displayResults.join(', ')}`}
    >
      {displayResults.map((result, i) => (
        <SingleBadge key={i} result={result} size={size} showLabel={showLabel} />
      ))}

      {/* Ghost placeholders if fewer than 5 */}
      {displayResults.length < 5 &&
        Array.from({ length: 5 - displayResults.length }).map((_, i) => (
          <div
            key={`ghost-${i}`}
            className={`${sizeMap[size].box} rounded-md`}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
        ))}
    </motion.div>
  );
}

export default FormBadge;
