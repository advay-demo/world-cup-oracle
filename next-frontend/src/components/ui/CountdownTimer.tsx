'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeUnit {
  value: number;
  label: string;
}

function flipVariants(direction: 'up' | 'down') {
  return {
    enter: { y: direction === 'up' ? -40 : 40, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: direction === 'up' ? 40 : -40, opacity: 0 },
  };
}

function TimeBlock({ value, label }: TimeUnit) {
  const prevRef = useRef(value);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [key, setKey] = useState(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      setDirection('up');
      setKey(value);
      prevRef.current = value;
    }
  }, [value]);

  const formatted = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      {/* Card */}
      <div className="relative group">
        {/* Outer glow ring */}
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-60 blur-sm group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #D4AF37)',
          }}
        />

        {/* Main card */}
        <div
          className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(212,175,55,0.12) 0%, rgba(13,13,20,0.98) 60%, rgba(5,5,10,1) 100%)',
            border: '1px solid rgba(212,175,55,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.15)',
          }}
        >
          {/* Horizontal divider line - flip clock style */}
          <div
            className="absolute inset-x-0 top-1/2 z-10 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)',
              transform: 'translateY(-50%)',
            }}
          />

          {/* Top half sheen */}
          <div
            className="absolute inset-x-0 top-0 h-1/2 z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
            }}
          />

          {/* Animated number */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={key}
              variants={flipVariants(direction)}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-30 font-serif tabular-nums select-none"
              style={{
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                fontWeight: 700,
                fontStyle: 'italic',
                background: 'linear-gradient(180deg, #FCF6BA 0%, #D4AF37 50%, #BF953F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                letterSpacing: '-0.02em',
              }}
            >
              {formatted}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Corner accents */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-yellow-400/30 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-yellow-400/30 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-yellow-400/30 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-yellow-400/30 rounded-br-lg pointer-events-none" />
      </div>

      {/* Label */}
      <span
        className="text-xs sm:text-sm font-medium tracking-widest uppercase"
        style={{ color: 'rgba(212,175,55,0.7)', letterSpacing: '0.2em' }}
      >
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col gap-3 pb-8 sm:pb-10">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#D4AF37' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

const TARGET_DATE = new Date('2026-06-11T18:00:00Z'); // June 11 2026 kickoff

function getTimeLeft() {
  const now = new Date();
  const diff = TARGET_DATE.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeLeft);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-4 sm:gap-6 h-32">
        <div className="w-24 h-24 rounded-2xl glass animate-pulse" />
        <div className="w-24 h-24 rounded-2xl glass animate-pulse" />
        <div className="w-24 h-24 rounded-2xl glass animate-pulse" />
        <div className="w-24 h-24 rounded-2xl glass animate-pulse" />
      </div>
    );
  }

  const units: TimeUnit[] = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hours' },
    { value: time.minutes, label: 'Mins' },
    { value: time.seconds, label: 'Secs' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="flex flex-col items-center gap-4"
    >
      {/* Header label */}
      <div className="flex items-center gap-3">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-400/50" />
        <span
          className="text-xs font-semibold tracking-[0.3em] uppercase"
          style={{ color: 'rgba(212,175,55,0.6)' }}
        >
          Tournament Begins In
        </span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-400/50" />
      </div>

      {/* Timer blocks */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <TimeBlock value={unit.value} label={unit.label} />
            {i < units.length - 1 && <Separator />}
          </div>
        ))}
      </div>

      {/* Date stamp */}
      <motion.p
        className="text-xs tracking-widest"
        style={{ color: 'rgba(255,255,255,0.25)' }}
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        JUNE 11, 2026 · MEXICO CITY / LOS ANGELES / NEW YORK
      </motion.p>
    </motion.div>
  );
}
