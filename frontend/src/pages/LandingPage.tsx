import React, { useLayoutEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Globe } from '../components/three/Globe';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Trophy, Sparkles, Brain, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Section refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the 3D canvas so it stays in the background while content scrolls
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: canvasContainerRef.current,
        pinSpacing: false,
      });

      // Animate Hero Text
      gsap.fromTo('.hero-text', 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: "power4.out", delay: 0.2 }
      );

      // Fade out Hero Text on scroll
      gsap.to(heroRef.current, {
        opacity: 0,
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });

      // Reveal Features Section
      gsap.fromTo('.feature-card',
        { y: 100, opacity: 0, scale: 0.9 },
        { 
          y: 0, opacity: 1, scale: 1, stagger: 0.2, duration: 1, ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          }
        }
      );

      // Scale 3D globe down and move it to the right on scroll
      gsap.to('.canvas-wrap', {
        scale: 0.7,
        xPercent: 25,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top bottom",
          end: "center center",
          scrub: 1,
        }
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[300vh] bg-background text-white selection:bg-primary selection:text-black">
      
      {/* Pinned 3D Background Canvas */}
      <div ref={canvasContainerRef} className="canvas-wrap absolute inset-0 w-full h-screen z-0 cinematic-vignette pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Globe />
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">
        
        {/* Navigation */}
        <nav className="fixed w-full top-0 p-8 flex justify-between items-center z-50 mix-blend-difference">
          <div className="flex items-center gap-3">
            <Trophy className="text-primary" size={24} />
            <span className="font-display font-bold text-xl tracking-widest uppercase">Oracle AI</span>
          </div>
          <Link to="/dashboard" className="px-6 py-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all font-mono text-sm uppercase">
            Launch Engine
          </Link>
        </nav>

        {/* 1. Hero Section (100vh) */}
        <section ref={heroRef} className="h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="hero-text inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary mb-8 backdrop-blur-md">
            <Sparkles size={16} />
            <span className="font-mono text-sm uppercase tracking-wider">The Future of Sports Analytics</span>
          </div>
          
          <h1 className="hero-text text-6xl md:text-8xl font-display font-bold leading-tight mb-6 max-w-5xl">
            Predict the <br/>
            <span className="gold-gradient-text italic pr-4">Beautiful Game</span>
          </h1>
          
          <p className="hero-text text-xl md:text-2xl text-gray-400 max-w-2xl font-light mb-12">
            Harnessing Monte Carlo simulations, xG models, and neural networks to simulate the FIFA World Cup.
          </p>
          
          <div className="hero-text">
            <Link to="/dashboard" className="group flex items-center gap-4 px-8 py-5 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300">
              Explore 48 Nations
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </section>

        {/* 2. Features Section (100vh) */}
        <section ref={featuresRef} className="h-screen flex items-center px-8 md:px-24">
          <div className="max-w-xl space-y-8">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-12 leading-tight">
              Intelligence at <br/> <span className="text-gray-500">Every Level.</span>
            </h2>
            
            <div className="feature-card glass-panel p-8 rounded-2xl">
              <Brain className="text-primary mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-2">Meta-Learner Architecture</h3>
              <p className="text-gray-400">Our engine evaluates ELO, recent form, injury data, and star player momentum to calculate probabilistic outcomes.</p>
            </div>
            
            <div className="feature-card glass-panel p-8 rounded-2xl">
              <Activity className="text-blue-500 mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-2">Tactical Radar</h3>
              <p className="text-gray-400">Compare head-to-head tactical capabilities using dynamic Recharts plotting across 48 participating nations.</p>
            </div>
          </div>
        </section>

        {/* 3. Final CTA Section (100vh) */}
        <section ref={ctaRef} className="h-screen flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-8">
            Ready to <span className="gold-gradient-text">Simulate?</span>
          </h2>
          <Link to="/dashboard" className="px-12 py-6 bg-primary text-black rounded-full font-bold text-xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(212,175,55,0.4)]">
            Access The Oracle
          </Link>
        </section>

      </div>
    </div>
  );
};
