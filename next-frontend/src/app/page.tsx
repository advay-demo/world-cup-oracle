"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Trophy, Activity, GitCompare, Database, Globe2 } from 'lucide-react';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/ui/StatCard';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const flags = [
    { code: 'br', alt: 'Brazil' },
    { code: 'fr', alt: 'France' },
    { code: 'ar', alt: 'Argentina' },
    { code: 'gb-eng', alt: 'England' },
    { code: 'es', alt: 'Spain' },
    { code: 'de', alt: 'Germany' },
    { code: 'pt', alt: 'Portugal' },
    { code: 'nl', alt: 'Netherlands' },
    { code: 'jp', alt: 'Japan' },
    { code: 'ma', alt: 'Morocco' },
    { code: 'mx', alt: 'Mexico' },
    { code: 'us', alt: 'USA' }
  ];

  return (
    <main className="relative min-h-screen">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[120px]" />
      </div>

      {/* FLOATING FLAGS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        {flags.map((flag, i) => {
          // Deterministic pseudo-random values based on index to prevent hydration mismatch
          const xPos = (i * 17) % 100;
          const rotate = (i * 45) % 360;
          const duration = 15 + ((i * 7) % 20);
          const delay = (i * 3) % 10;
          
          return (
            <motion.div
              key={i}
              className="absolute filter grayscale hover:grayscale-0 transition-all duration-500 w-16 h-12 md:w-24 md:h-16"
              initial={{ y: "110vh", x: `${xPos}vw` }}
              animate={{ y: "-10vh", rotate }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "linear",
                delay,
              }}
            >
              <img src={`https://flagcdn.com/w160/${flag.code}.png`} alt={flag.alt} className="w-full h-full object-contain" />
            </motion.div>
          );
        })}
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-gold px-6 py-2 rounded-full mb-8 inline-flex items-center gap-2"
        >
          <Trophy size={16} className="text-[#D4AF37]" />
          <span className="text-sm font-medium tracking-widest uppercase text-white/90">FIFA World Cup 2026 | AI Prediction Engine</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl mx-auto mb-8"
        >
          <h1 className="text-7xl md:text-[8rem] font-bold leading-none tracking-tight font-display text-white">
            Predict the <br />
            <span className="gold-text italic pr-4">Beautiful Game</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-white/60 font-light max-w-2xl mb-12"
        >
          Powered by Monte Carlo AI, xG Models & ELO Ratings across 48 nations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-3xl mb-16"
        >
          <CountdownTimer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="/predict" className="px-8 py-4 rounded-full font-bold text-black bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#D4AF37] hover:scale-105 transition-transform">
            Predict Now
          </Link>
          <Link href="/teams" className="glass px-8 py-4 rounded-full font-bold text-white hover:bg-white/10 transition-colors">
            Explore Teams
          </Link>
          <Link href="/players" className="glass px-8 py-4 rounded-full font-bold text-white hover:bg-white/10 transition-colors">
            Player Database
          </Link>
          <Link href="/analytics" className="glass px-8 py-4 rounded-full font-bold text-white hover:bg-white/10 transition-colors">
            Analytics
          </Link>
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <section className="relative z-10 border-y border-white/5 bg-black/50 backdrop-blur-md py-12">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard icon={Globe2} label="Nations" value={48} prefix="" suffix="" />
          <StatCard icon={Database} label="Players" value={1000} prefix="" suffix="+" />
          <StatCard icon={Activity} label="Simulations" value={10000} prefix="" suffix="" />
          <StatCard icon={Trophy} label="Uptime" value={99.2} prefix="" suffix="%" decimals={1} />
        </div>
      </section>

      {/* AI INTELLIGENCE */}
      <section className="relative z-10 container mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">AI-Powered <span className="gold-text">Intelligence</span></h2>
          <p className="text-white/50 text-xl max-w-2xl mx-auto">Our ensemble models consume real-time squad data to generate the most accurate tournament forecasts.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Monte Carlo Engine", desc: "Running 10,000 iterations per prediction to account for variance and tournament chaos.", icon: Activity },
            { title: "ELO + xG Models", desc: "Poisson distribution goal modeling based on historical ELO ratings and expected goals.", icon: GitCompare },
            { title: "Upset Detector", desc: "Real-time underdog identification factoring in star-player momentum and squad depth.", icon: Trophy }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.2 }}
            >
              <GlassCard padding="lg" hoverGlow className="h-full flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full glass-gold flex items-center justify-center mb-6">
                  <feature.icon className="text-[#D4AF37]" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SCROLLING MARQUEE */}
      <div className="relative z-10 w-full overflow-hidden border-t border-white/5 bg-black py-4">
        <div className="flex items-center whitespace-nowrap animate-[scroll_30s_linear_infinite]">
          {[...flags, ...flags, ...flags].map((f, i) => (
            <div key={i} className="mx-8 opacity-50 hover:opacity-100 transition-opacity cursor-default flex-shrink-0">
              <img src={`https://flagcdn.com/w80/${f.code}.png`} alt={f.alt} className="w-12 h-8 object-contain rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
