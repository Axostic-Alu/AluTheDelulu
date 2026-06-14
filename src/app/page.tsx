"use client";

import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView } from "motion/react";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  GameController,
  Code,
  User,
  ArrowRight,
  Clock,
  Globe,
  Drop,
  Books,
  Quotes,
  Sparkle,
  Star,
  ArrowDown,
  Compass,
  MusicNote,
  Palette,
  ChatCircleDots,
  Newspaper,
} from "@phosphor-icons/react";
import TiltCard from "@/components/TiltCard";
import ShimmerGlass from "@/components/ShimmerGlass";
import RippleEffect from "@/components/RippleEffect";
import GameCard from "@/components/GameCard";
import AnimatedBackground from "@/components/AnimatedBackground";
import { games } from "@/data/games";

// ── Parallax offset hook ──
function useParallax(speed: number) {
  const { scrollY } = useScroll();
  return useTransform(scrollY, [0, 1000], [0, speed * 100]);
}

// ── Animated Counter ──
function AnimatedCounter({ from = 0, to, suffix = "", prefix = "" }: { from?: number; to: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = from;
          const duration = 2000;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + (to - from) * ease);
            setCount(current);
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [from, to]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}

// ── Floating Particles (decorative) ──
function FloatingParticles() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 8,
    duration: Math.random() * 10 + 6,
    driftX: (Math.random() - 0.5) * 40,
    driftY: (Math.random() - 0.5) * 30,
    color: i % 5 === 0 ? "var(--color-accent)" : i % 5 === 1 ? "var(--color-accent-2)" : i % 5 === 2 ? "#a78bfa" : i % 5 === 3 ? "#c084fc" : "#7c3aed",
    pulseSpeed: Math.random() * 3 + 1,
    orbitRadius: Math.random() * 15 + 5,
    orbitSpeed: (Math.random() - 0.5) * 0.005,
  }));

  // Generate scan lines (horizontal lines)
  const scanLines = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.03 + 0.01,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 -z-5 overflow-hidden">
      {/* Scanline sweep */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent)]/15 to-transparent"
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 2 }}
      />
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent-2)]/10 to-transparent"
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Static scan lines */}
      {scanLines.map((sl) => (
        <motion.div
          key={sl.id}
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"
          style={{ top: `${sl.top}%` }}
          animate={{ opacity: [sl.opacity, sl.opacity * 2, sl.opacity] }}
          transition={{ duration: sl.duration, delay: sl.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      
      {/* Ambient glow orbs that shift with mouse — more reactive now */}
      <motion.div
        className="absolute -left-40 -top-40 h-[700px] w-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(108,92,231,0.1), transparent 70%)", filter: "blur(150px)" }}
        animate={{
          x: mouse.x * -50,
          y: mouse.y * -50,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
      />
      <motion.div
        className="absolute -right-40 -bottom-40 h-[600px] w-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)", filter: "blur(150px)" }}
        animate={{
          x: mouse.x * 50,
          y: mouse.y * 50,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
      />
      
      {/* Extra accent orb */}
      <motion.div
        className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.05), transparent 70%)", filter: "blur(120px)" }}
        animate={{
          x: mouse.x * -30,
          y: mouse.y * -35,
        }}
        transition={{ type: "spring", stiffness: 40, damping: 25 }}
      />

      {/* Fourth orb at bottom-right */}
      <motion.div
        className="absolute right-1/4 bottom-1/3 h-[350px] w-[350px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04), transparent 70%)", filter: "blur(100px)" }}
        animate={{
          x: mouse.x * 25,
          y: mouse.y * -20,
        }}
        transition={{ type: "spring", stiffness: 35, damping: 22 }}
      />
      
      {/* Particles */}
      {particles.map((p) => {
          // Calculate magnetic offset towards cursor
          const magnetX = (mouse.x - 0.5) * p.size * 3;
          const magnetY = (mouse.y - 0.5) * p.size * 2;
          return (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, p.driftY, 0, -p.driftY * 0.5, 0],
            x: [0, p.driftX, 0, -p.driftX * 0.5, 0],
            scale: [1, 1.5, 0.7, 1.2, 1],
            opacity: [0.06, 0.25, 0.1, 0.2, 0.06],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      );})}
    </div>
  );
}

// ── Scroll Progress Indicator ──
function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed left-0 top-0 z-[60] h-[2px] bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent-2)] to-purple-400"
      style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
    />
  );
}

// ── Stats Card ──
function StatCard({ icon: Icon, label, value, prefix = "", suffix = "", accentColor, index = 0 }: {
  icon: any;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  accentColor: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <TiltCard glare={false}>
        <ShimmerGlass className="p-6 text-center group relative overflow-hidden">
          {/* Hover glow effect */}
          <div
            className="pointer-events-none absolute -inset-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(600px circle at 50% 50%, ${accentColor}15, transparent 60%)`,
            }}
          />
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)` }}>
              <Icon size={22} style={{ color: accentColor }} className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <div className="font-orbitron text-3xl font-bold" style={{ color: accentColor }}>
              <AnimatedCounter to={value} suffix={suffix} prefix={prefix} />
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {label}
            </p>
          </div>
        </ShimmerGlass>
      </TiltCard>
    </motion.div>
  );
}

// ── Section Wrapper ──
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} id={id} className={`relative px-6 py-24 md:py-32 ${className}`}>
      <motion.div
        className="mx-auto max-w-7xl"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}

function SectionBadge({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <motion.div
      className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]"
      whileHover={{ scale: 1.08, borderColor: "rgba(108, 92, 231, 0.4)", boxShadow: "0 0 20px rgba(108,92,231,0.15)" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon size={12} />
      {children}
    </motion.div>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-3xl font-orbitron font-bold tracking-tight md:text-5xl ${className}`}>
      {children}
    </h2>
  );
}

// ── Magnetic Link ──
function MagneticLink({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 12 });
  const springY = useSpring(y, { stiffness: 400, damping: 12 });
  const springRotate = useSpring(rotate, { stiffness: 300, damping: 15 });

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(relX * 0.4);
    y.set(relY * 0.4);
    rotate.set(relX * 0.03);
  }
  function handleLeave() { x.set(0); y.set(0); rotate.set(0); }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY, rotate: springRotate }}
      className="inline-block"
    >
      {children}
    </motion.a>
  );
}

// ── Infinite Scrolling Marquee ──
function GameMarquee() {
  const gameNames = games.map(g => g.title);
  const items = [...gameNames, ...gameNames];

  return (
    <div className="relative overflow-hidden py-6">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />

      <motion.div
        className="flex gap-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="whitespace-nowrap font-orbitron text-sm uppercase tracking-[0.2em] text-white/10 hover:text-white/30 transition-colors duration-300"
          >
            {name}
            <span className="mx-8 text-white/5">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Interactive Glow Card (for features/CTA) ──
function InteractiveGlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl transition-all duration-300 ${className}`}
      style={{
        boxShadow: isHovered ? '0 0 40px rgba(108, 92, 231, 0.08)' : 'none',
      }}
    >
      {/* Following glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(108, 92, 231, 0.12), transparent 50%)`,
        }}
      />
      {/* Accent border glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: 'inset 0 0 30px rgba(108, 92, 231, 0.04)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGE
// ═══════════════════════════════════════════════════════════════

export default function Home() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [mouseOnScreen, setMouseOnScreen] = useState(false);
  const cursorRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setMouseOnScreen(true);
    };
    const handleLeave = () => setMouseOnScreen(false);

    window.addEventListener("mousemove", handleMouse, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    // Dual-layer cursor tracking with elastic overshoot:
    //   Core cursor = high stiffness (0.28) + overshoot correction for near-instant tracking
    //   Glow = medium stiffness (0.12) with slight trailing parallax
    const tick = () => {
      // ── Core: Near-instant response (high lerp + elastic overshoot) ──
      const dx = targetRef.current.x - cursorRef.current.x;
      const dy = targetRef.current.y - cursorRef.current.y;
      
      // High-speed core tracking: 0.4 lerp means 87% of distance covered in ~5 frames
      cursorRef.current.x += dx * 0.55;
      cursorRef.current.y += dy * 0.55;

      // Aggressive elastic overshoot: when very close to target, snap into exact position
      // This eliminates the "floaty" feeling at the destination
      const closeX = Math.abs(dx) < 40;
      const closeY = Math.abs(dy) < 40;
      if (closeX) cursorRef.current.x += dx * 0.4;  // stronger correction when close
      if (closeY) cursorRef.current.y += dy * 0.4;
      
      // Extra snap: if within 5px, just go there instantly
      if (Math.abs(dx) < 8) cursorRef.current.x = targetRef.current.x;
      if (Math.abs(dy) < 8) cursorRef.current.y = targetRef.current.y;

      // ── Glow: Springs with momentum (feels natural, trails slightly) ──
      // Uses velocity-aware spring simulation instead of simple lerp
      const gdx = cursorRef.current.x - glowRef.current.x;
      const gdy = cursorRef.current.y - glowRef.current.y;
      
      // High stiffness = follows quickly, medium damping = slight overshoot for life
      glowRef.current.x += gdx * 0.25;
      glowRef.current.y += gdy * 0.25;
      // Extra velocity push for momentum feel
      glowRef.current.x += (cursorRef.current.x - glowRef.current.x) * 0.10;
      glowRef.current.y += (cursorRef.current.y - glowRef.current.y) * 0.10;

      setCursorPos({ ...cursorRef.current });
      setGlowPos({ ...glowRef.current });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    
    // Kick-start with a fast initial position sync
    cursorRef.current.x = -200;
    cursorRef.current.y = -200;
    glowRef.current.x = -200;
    glowRef.current.y = -200;

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      document.removeEventListener("mouseleave", handleLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Parallax decorative elements ──
  const heroParallax = useParallax(-0.15);

  return (
    <>
      {/* ── Scroll Progress ── */}
      <ScrollProgress />

      {/* ── Floating Background Particles ── */}
      <FloatingParticles />

      {/* ── Animated Background ── */}
      <AnimatedBackground />

      {/* ── Cursor glow trail (4-layer, fixed) ── */}
      <div
        className="pointer-events-none fixed inset-0 z-[55]"
        style={{ opacity: mouseOnScreen ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        {/* Layer 1: Deep ambient glow - trails behind (uses glowPos) */}
        <div
          className="absolute h-[700px] w-[700px] rounded-full"
          style={{
            left: glowPos.x - 350,
            top: glowPos.y - 350,
            background: "radial-gradient(circle, rgba(108, 92, 231, 0.08) 0%, rgba(168, 85, 247, 0.03) 30%, transparent 60%)",
            filter: "blur(180px)",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />
        {/* Layer 2: Mid ambient glow */}
        <div
          className="absolute h-[400px] w-[400px] rounded-full"
          style={{
            left: cursorPos.x * 0.85 + glowPos.x * 0.15 - 200,
            top: cursorPos.y * 0.85 + glowPos.y * 0.15 - 200,
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(108, 92, 231, 0.05) 40%, transparent 70%)",
            filter: "blur(100px)",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />
        {/* Layer 3: Bright inner spotlight */}
        <div
          className="absolute h-[160px] w-[160px] rounded-full"
          style={{
            left: cursorPos.x - 80,
            top: cursorPos.y - 80,
            background: "radial-gradient(circle, rgba(196, 132, 252, 0.2) 0%, rgba(168, 85, 247, 0.12) 40%, rgba(108, 92, 231, 0.05) 70%, transparent 90%)",
            filter: "blur(45px)",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />
        {/* Layer 4: Core dot with intense glow */}
        <div
          className="absolute h-[8px] w-[8px] rounded-full"
          style={{
            left: cursorPos.x - 4,
            top: cursorPos.y - 4,
            background: "#d8b4fe",
            boxShadow: "0 0 8px rgba(216, 180, 254, 0.9), 0 0 25px rgba(192, 132, 252, 0.6), 0 0 50px rgba(168, 85, 247, 0.3), 0 0 100px rgba(108, 92, 231, 0.15)",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />
        {/* Accent ring that pulses */}
        <div
          className="absolute rounded-full border border-white/[0.03]"
          style={{
            left: cursorPos.x - 20,
            top: cursorPos.y - 20,
            width: 40,
            height: 40,
            opacity: mouseOnScreen ? 0.5 : 0,
            transition: "opacity 0.3s ease",
            transform: "translateZ(0)",
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  HERO
      {/* ════════════════════════════════════════════════════════ */}
      <Section id="hero" className="flex min-h-screen items-center pt-20 overflow-hidden">
        {/* Decorative parallax orbs */}
        <motion.div
          className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[var(--color-accent)]/5 blur-[150px]"
          style={{ y: heroParallax, x: useTransform(useScroll().scrollY, [0, 1000], [0, -30]) }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[var(--color-accent-2)]/5 blur-[120px]"
          style={{ y: useTransform(useScroll().scrollY, [0, 1000], [0, 50]) }}
        />

        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionBadge icon={Code}>Welcome to my domain</SectionBadge>

            <h1 className="mt-4 text-5xl font-orbitron font-bold tracking-tight md:text-8xl">
              <span className="gradient-text">AluTheDelulu</span>
            </h1>

            <motion.p
              className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {"Lazy gamer just builds stuff when bored because it feels good to build something. "}
              {"Learning is fun unless it is forced. "}
              <motion.span
                className="text-[var(--color-accent)]"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                Welcome to my domain.
              </motion.span>
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <MagneticLink href="#games">
                <RippleEffect className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent-glow)] transition-transform hover:scale-[1.02]">
                  <GameController size={16} />
                  My Games
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </RippleEffect>
              </MagneticLink>

              <MagneticLink href="/projects">
                <RippleEffect className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition-all hover:bg-white/[0.08]">
                  <Books size={16} />
                  Projects
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </RippleEffect>
              </MagneticLink>

              <MagneticLink href="/quotes">
                <RippleEffect className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition-all hover:bg-white/[0.08]">
                  <Quotes size={16} />
                  Quotes
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </RippleEffect>
              </MagneticLink>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="mt-16 flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowDown size={14} className="text-[var(--color-text-muted)]" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
      </Section>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  INFINITE GAME MARQUEE
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div 
          className="relative -mt-16 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
        <GameMarquee />
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  STATS GRID
      {/* ════════════════════════════════════════════════════════ */}
      <Section id="stats" className="pb-0 pt-0 relative z-[2]">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div 
              className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {[
              { icon: GameController, label: "Games Played", value: 300, suffix: "+", color: "#a855f7" },
              { icon: Clock, label: "Year Building", value: 1, suffix: " month", color: "#06b6d4" },
              { icon: Globe, label: "Open Source Repo", value: 1, color: "#10b981" },
              { icon: Drop, label: "Chocolate Milk", value: 999, suffix: "+", prefix: "∞", color: "#f59e0b" },
            ].map((stat, i) => (
              <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} suffix={stat.suffix} prefix={stat.prefix} accentColor={stat.color} index={i} />
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  ABOUT
      {/* ════════════════════════════════════════════════════════ */}
      <Section id="about">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionBadge icon={User}>About Me</SectionBadge>
            <SectionTitle>Who is <span className="gradient-text">AluTheDelulu</span>?</SectionTitle>

            <div className="mt-8 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <ShimmerGlass className="p-6 md:p-8">
                  <p className="leading-relaxed text-[var(--color-text-secondary)] text-lg">
                    I am Almaan. I'm not special — I'm basically the human equivalent of a "lazy"
                    status effect in an RPG. I don't follow grand master plans; I just do things for fun,
                    mostly because I've decided that everything I do is technically a "level up."
                  </p>
                  <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)] text-lg">
                    Did I finally take out the trash? That's a +10 to my domestic stats. Did I manage
                    to exist today? That's a legendary-tier achievement. I'm just out here grinding my
                    real-life XP, one leisurely quest at a time. If you're looking for a productivity
                    machine, you've hit the wrong NPC. But if you're looking for someone who treats
                    breathing as a significant milestone in their character progression — that's me.
                  </p>
                </ShimmerGlass>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  GAMES GRID
      {/* ════════════════════════════════════════════════════════ */}
      <Section id="games">
        <div className="mx-auto max-w-7xl px-6">
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
            >
              <SectionBadge icon={GameController}>Game Reviews</SectionBadge>
              <SectionTitle>Games That <span className="gradient-text">Shaped Me</span></SectionTitle>
            </motion.div>
            <motion.p
              className="mt-4 max-w-lg text-[var(--color-text-secondary)]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Tap a card to flip it and read my review. These are the games that shaped my taste.
            </motion.p>
          </div>

          <motion.div
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            {games.map((game, i) => (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <GameCard
                  title={game.title}
                  description={game.description}
                  review={game.review}
                  rating={game.rating}
                  gradient={game.gradient}
                  accentColor={game.accentColor}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  INFINITE MARQUEE (bottom)
      {/* ════════════════════════════════════════════════════════ */}
      <div className="relative -mt-8 mb-8">
        <GameMarquee />
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  CTA / FOOTER — with suggestion quiz
      {/* ════════════════════════════════════════════════════════ */}
      <Section id="connect">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <InteractiveGlowCard className="mx-auto max-w-xl p-8 md:p-12">
            <h2 className="text-2xl font-orbitron font-bold md:text-3xl">
              Want to <span className="gradient-text">collaborate</span>?
            </h2>
            <p className="mt-4 text-[var(--color-text-secondary)]">
              Hit me up if you want to build something cool, talk games, or just vibe.
              I'm always down for a new quest.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/Axostic-Alu"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-[var(--color-text-secondary)] transition-all hover:bg-white/[0.08] hover:text-[var(--color-text-primary)]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
              <a
                href="mailto:syeedalmaan@gmail.com"
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-[var(--color-text-secondary)] transition-all hover:bg-white/[0.08] hover:text-[var(--color-text-primary)]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                Email
              </a>
            </div>
          </InteractiveGlowCard>
        </motion.div>

        <motion.div
          className="mt-16 text-center text-sm text-[var(--color-text-muted)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p>© {new Date().getFullYear()} AluTheDelulu. Built with ☕ and no sleep.</p>
        </motion.div>
      </Section>
    </>
  );
}
