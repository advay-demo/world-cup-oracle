'use client';

import type React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  /** Renders the card with a gold tinted border and background */
  goldBorder?: boolean;
  /** Adds a subtle gold glow on hover */
  hoverGlow?: boolean;
  /** Wraps children with consistent inner padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Disables hover lift animation */
  noHover?: boolean;
}

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function GlassCard({
  children,
  className,
  goldBorder = false,
  hoverGlow  = false,
  padding    = 'none',
  noHover    = false,
  ...motionProps
}: GlassCardProps) {
  const baseClasses = cn(
    'rounded-2xl',
    goldBorder ? 'glass-gold' : 'glass',
    hoverGlow  ? 'transition-shadow duration-300 hover:glow-gold' : '',
    paddingMap[padding],
    className,
  );

  return (
    <motion.div
      className={baseClasses}
      whileHover={
        noHover
          ? undefined
          : {
              y: -4,
              boxShadow: goldBorder
                ? '0 20px 60px rgba(212,175,55,0.18), 0 0 0 1px rgba(212,175,55,0.2)'
                : '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
            }
      }
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

// ─── Default export for convenience ──────────────────────────────────────────

export default GlassCard;
