'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Trophy, Menu, X, Zap, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_LINKS: NavLink[] = [
  { label: 'Home',       href: '/' },
  { label: 'Teams',      href: '/teams' },
  { label: 'Players',    href: '/players' },
  { label: 'Predict',    href: '/predict' },
  { label: 'Analytics',  href: '/analytics' },
  { label: 'World Cup',  href: '/world-cup' },
];

// ─── Variants ─────────────────────────────────────────────────────────────────

const overlayVariants = {
  hidden:  { opacity: 0, clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)' },
  visible: {
    opacity: 1,
    clipPath: 'circle(150% at calc(100% - 2.5rem) 2.5rem)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)',
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const mobileNavItemVariants = {
  hidden:  { opacity: 0, x: 40 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.12 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, x: 40, transition: { duration: 0.25 } },
};

const logoVariants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const linksContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const linkItemVariants = {
  hidden:  { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group select-none">
      {/* Trophy icon with pulse ring */}
      <div className="relative flex items-center justify-center">
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: 'rgba(212,175,55,0.4)', animationDuration: '2.5s' }}
        />
        <div
          className="relative flex items-center justify-center w-9 h-9 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.08) 100%)',
            border: '1px solid rgba(212,175,55,0.4)',
          }}
        >
          <Trophy
            size={18}
            className="transition-transform duration-300 group-hover:scale-110"
            style={{ color: '#D4AF37' }}
          />
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className="text-lg font-black tracking-tight gold-text"
          style={{ letterSpacing: '-0.02em' }}
        >
          Oracle
        </span>
        <span className="text-[10px] font-semibold tracking-[0.25em] text-white/40 uppercase">
          AI · World Cup
        </span>
      </div>
    </Link>
  );
}

function NavLinkItem({ link, active }: { link: NavLink; active: boolean }) {
  return (
    <motion.div variants={linkItemVariants}>
      <Link
        href={link.href}
        className={`
          relative text-sm font-medium tracking-wide animated-underline transition-colors duration-200
          ${active ? 'text-white' : 'text-white/55 hover:text-white/90'}
        `}
      >
        {link.label}
        {active && (
          <motion.span
            layoutId="nav-active-dot"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ background: '#D4AF37' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  );
}

function LaunchButton() {
  return (
    <Link href="/predict" className="group relative inline-flex items-center gap-2 overflow-hidden">
      {/* Gold gradient bg */}
      <span
        className="absolute inset-0 rounded-full transition-opacity duration-300 group-hover:opacity-80"
        style={{
          background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 50%, #B38728 100%)',
        }}
      />
      {/* Shimmer sweep */}
      <span
        className="absolute inset-0 rounded-full translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
        }}
      />
      <span className="relative flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-[#040406] tracking-wide">
        <Zap size={14} className="fill-current" />
        Launch Predictor
        <ChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname   = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Derive scrolled state
  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 24));
    return unsub;
  }, [scrollY]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Main navbar ── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(4,4,6,0.82)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(1.6)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.6)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid transparent',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo */}
          <motion.div variants={logoVariants} initial="hidden" animate="visible">
            <Logo />
          </motion.div>

          {/* Desktop links */}
          <motion.ul
            variants={linksContainerVariants}
            initial="hidden"
            animate="visible"
            className="hidden md:flex items-center gap-7"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLinkItem link={link} active={pathname === link.href} />
              </li>
            ))}
          </motion.ul>

          {/* Desktop CTA + hamburger */}
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:block"
            >
              <LaunchButton />
            </motion.div>

            {/* Hamburger */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setMenuOpen((p) => !p)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden relative z-[60] flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200"
              style={{
                background: menuOpen
                  ? 'rgba(212,175,55,0.15)'
                  : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate: 90,   opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={18} className="text-white" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90,  opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate: -90,  opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={18} className="text-white/70" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* ── Mobile full-screen overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 flex flex-col md:hidden"
            style={{
              background: 'rgba(4,4,6,0.97)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
            }}
          >
            {/* Decorative gold orb */}
            <div
              className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
            />
            <div
              className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full opacity-10 blur-3xl"
              style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
            />

            {/* Nav items */}
            <div className="flex flex-col justify-center flex-1 px-8 gap-1">
              {/* Section label */}
              <motion.p
                custom={-1}
                variants={mobileNavItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-xs font-semibold tracking-[0.3em] text-white/25 uppercase mb-4"
              >
                Navigation
              </motion.p>

              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  custom={i}
                  variants={mobileNavItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      group flex items-center justify-between py-4 border-b transition-colors duration-150
                      ${pathname === link.href
                        ? 'border-[rgba(212,175,55,0.25)]'
                        : 'border-white/[0.05] hover:border-white/10'
                      }
                    `}
                  >
                    <span
                      className={`text-3xl font-bold tracking-tight transition-colors duration-200 ${
                        pathname === link.href ? 'gold-text' : 'text-white/70 group-hover:text-white'
                      }`}
                    >
                      {link.label}
                    </span>
                    <ChevronRight
                      size={20}
                      className={`transition-all duration-200 group-hover:translate-x-1 ${
                        pathname === link.href ? 'text-[#D4AF37]' : 'text-white/20'
                      }`}
                    />
                  </Link>
                </motion.div>
              ))}

              {/* Mobile CTA */}
              <motion.div
                custom={NAV_LINKS.length}
                variants={mobileNavItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-8"
              >
                <Link
                  href="/predict"
                  onClick={() => setMenuOpen(false)}
                  className="group relative flex items-center justify-center gap-2 w-full overflow-hidden rounded-2xl py-4 text-base font-bold text-[#040406] tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 50%, #B38728 100%)',
                  }}
                >
                  <Zap size={16} className="fill-current" />
                  Launch Predictor
                </Link>
              </motion.div>
            </div>

            {/* Footer note */}
            <motion.div
              custom={NAV_LINKS.length + 1}
              variants={mobileNavItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="px-8 pb-10 text-center"
            >
              <p className="text-xs text-white/20 tracking-widest uppercase">
                FIFA World Cup 2026 · AI Predictions
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
