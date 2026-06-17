"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, useSpring, useScroll, useTransform, AnimatePresence, useReducedMotion } from "motion/react";
import { Quotes as QuotesIcon, ArrowLeft, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";

interface QuoteEntry {
  text: string;
  source: string;
  game: string;
  gameColor: string;
}

const quotes: QuoteEntry[] = [
  // ── God of War ──
  { text: "Don't be sorry, be better.", source: "Kratos", game: "God of War", gameColor: "#06b6d4" },
  { text: "The culmination of love is grief, and yet we love despite the inevitable. We open our hearts to it… To grieve deeply is to have loved fully.", source: "Faye", game: "God of War", gameColor: "#06b6d4" },
  { text: "Death can have me, when it earns me.", source: "Kratos", game: "God of War", gameColor: "#06b6d4" },
  { text: "Keep your expectations low and you will never be disappointed.", source: "Kratos", game: "God of War", gameColor: "#06b6d4" },
  { text: "The past is just a story we tell ourselves.", source: "God of War", game: "God of War", gameColor: "#06b6d4" },
  { text: "We are the gods we choose to be.", source: "Kratos", game: "God of War", gameColor: "#06b6d4" },
  { text: "Fate only binds you if you let it.", source: "Kratos", game: "God of War", gameColor: "#06b6d4" },
  { text: "Open your heart to their despair. Open your heart to their suffering.", source: "Kratos", game: "God of War", gameColor: "#06b6d4" },

  // ── Omori ──
  { text: "The truth is hard to accept, but it is better to face it than to live in a lie.", source: "Omori", game: "Omori", gameColor: "#8b5cf6" },
  { text: "You have to forgive yourself for what you couldn't do.", source: "Mari", game: "Omori", gameColor: "#8b5cf6" },
  { text: "Everything is going to be okay.", source: "Mari", game: "Omori", gameColor: "#8b5cf6" },

  // ── Until Then ──
  { text: "Sometimes, the hardest part of moving forward is remembering to forgive yourself.", source: "Mark", game: "Until Then", gameColor: "#f43f5e" },
  { text: "If I disappear, will anyone even notice?", source: "Mark", game: "Until Then", gameColor: "#f43f5e" },
  { text: "We are all just echoes of our own choices.", source: "Mark", game: "Until Then", gameColor: "#f43f5e" },
  { text: "Time is a fragile thread; pull too hard and it all unravels.", source: "Mark", game: "Until Then", gameColor: "#f43f5e" },
  { text: "What matters isn't how long you live, but who you choose to live for.", source: "Mark", game: "Until Then", gameColor: "#f43f5e" },

  // ── Re:Zero ──
  { text: "I will die, and die, and die again, and I will still save you.", source: "Natsuki Subaru", game: "Re:Zero", gameColor: "#ef4444" },
  { text: "Even if the world turns against you, I will be the one to stand by your side.", source: "Natsuki Subaru", game: "Re:Zero", gameColor: "#ef4444" },
  { text: "I have no strength, but I want it all. I have no knowledge, but all I do is dream. There's nothing I can do, but I struggle in vain.", source: "Natsuki Subaru", game: "Re:Zero", gameColor: "#ef4444" },

  // ── Undertale ──
  { text: "Determination is the ability to change the world against all odds.", source: "Undertale", game: "Undertale", gameColor: "#6366f1" },
  { text: "In this world, it's kill or be killed.", source: "Flowey", game: "Undertale", gameColor: "#6366f1" },
  { text: "Despite everything, it's still you.", source: "Undertale", game: "Undertale", gameColor: "#6366f1" },
  { text: "You are filled with determination.", source: "Undertale", game: "Undertale", gameColor: "#6366f1" },

  // ── Hollow Knight ──
  { text: "Even the smallest light can pierce the deepest darkness.", source: "Hollow Knight", game: "Hollow Knight", gameColor: "#14b8a6" },
  { text: "No cost too great.", source: "Pale king", game: "Hollow Knight", gameColor: "#14b8a6" },
  { text: "Fear is not the absence of courage, but the judgment that something else is more important.", source: "Hollow Knight", game: "Hollow Knight", gameColor: "#14b8a6" },

  // ── Red Dead Redemption 2 ──
  { text: "In the end, we are all just stories. Make yours worth telling.", source: "Red Dead Redemption 2", game: "Red Dead Redemption 2", gameColor: "#ef4444" },
  { text: "We're more ghosts than people.", source: "Arthur Morgan", game: "Red Dead Redemption 2", gameColor: "#ef4444" },
  { text: "There's a lot of things that you can do in this life, but you can't give up on yourself.", source: "Arthur Morgan", game: "Red Dead Redemption 2", gameColor: "#ef4444" },

  // ── Lies of P ──
  { text: "Even if you lose everything, the memory of who you were remains.", source: "Sophia", game: "Lies of P", gameColor: "#f97316" },
  { text: "To be human is to feel the weight of your own choices.", source: "Lies of P", game: "Lies of P", gameColor: "#f97316" },
  { text: "A lie is a beautiful thing, if it serves the truth.", source: "Pinocchio (P)", game: "Lies of P", gameColor: "#f97316" },

  // ── Sea of Stars ──
  { text: "The stars don't ask to be seen; they just shine.", source: "Valere/Zale", game: "Sea of Stars", gameColor: "#0ea5e9" },
  { text: "It is not the destination, but the path you walk that defines you.", source: "Elder Mist", game: "Sea of Stars", gameColor: "#0ea5e9" },
  { text: "Every ending is just a new beginning in disguise.", source: "Sea of Stars", game: "Sea of Stars", gameColor: "#0ea5e9" },

  // ── Inscryption ──
  { text: "We are all prisoners of our own perspectives.", source: "Leshy", game: "Inscryption", gameColor: "#78716c" },
  { text: "The cards you are dealt don't define you; how you play them does.", source: "Inscryption", game: "Inscryption", gameColor: "#78716c" },

  // ── Silent Hill ──
  { text: "Silence is the loudest scream.", source: "Silent Hill", game: "Silent Hill", gameColor: "#64748b" },
  { text: "We all have our own private hells.", source: "ames Sunderland", game: "Silent Hill", gameColor: "#64748b" },
  { text: "A world of monsters is better than a world of empty promises.", source: "Silent Hill", game: "Silent Hill", gameColor: "#64748b" },

  // ── CrossCode ──
  { text: "Choose your path, but be prepared for the consequences.", source: "Lea", game: "CrossCode", gameColor: "#a855f7" },
  { text: "Data is just memory without a heart.", source: "CrossCode", game: "CrossCode", gameColor: "#a855f7" },

  // ── LISA: The Painful ──
  { text: "Don't look back; the past is a ghost.", source: "Brad Armstrong", game: "LISA: The Painful", gameColor: "#f59e0b" },
  { text: "Survival is not living.", source: "LISA: The Painful", game: "LISA: The Painful", gameColor: "#f59e0b" },

  // ── The Walking Dead ──
  { text: "Every choice has a cost.", source: "Lee Everett", game: "The Walking Dead", gameColor: "#84cc16" },
  { text: "You don't lose yourself, you just find a new version of you.", source: "Clementine", game: "The Walking Dead", gameColor: "#84cc16" },

  // ── Firewatch ──
  { text: "Don't run from things, just because they hurt.", source: "Henry", game: "Firewatch", gameColor: "#10b981" },
  { text: "Sometimes you just have to walk away to save yourself.", source: "Delilah", game: "Firewatch", gameColor: "#10b981" },

  // ── Celeste ──
  { text: "Be proud of your mountain. It's yours.", source: "Madeline", game: "Celeste", gameColor: "#ec4899" },
  { text: "You can do this.", source: "Celeste", game: "Madeline", gameColor: "#ec4899" },

  // ── Minecraft ──
  { text: "A world is only as limited as your imagination.", source: "Minecraft", game: "Minecraft", gameColor: "#84cc16" },
];

// ── Emil Kowalski signature motion constants ──
const easeOut = [0.16, 1, 0.3, 1] as const;
const easeSpring = [0.25, 0.46, 0.45, 0.94] as const;

const springHover = {
  type: "spring" as const,
  stiffness: 180,
  damping: 15,
  mass: 0.8,
};
const springTap = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
  mass: 0.5,
};

const staggerDelay = 0.04;

function SectionBadge({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <motion.div
      className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: easeSpring }}
    >
      <Icon size={12} />
      {children}
    </motion.div>
  );
}

function groupByGame(quotes: QuoteEntry[]): Record<string, QuoteEntry[]> {
  const groups: Record<string, QuoteEntry[]> = {};
  for (const q of quotes) {
    if (!groups[q.game]) groups[q.game] = [];
    groups[q.game].push(q);
  }
  return groups;
}

// ═══════════════════════════════════════════════
//  STARFIELD — dynamic constellation background
//  Twinkling stars that drift slowly, creating
//  a living night-sky ambience that reacts to scroll.
// ═══════════════════════════════════════════════
function StarField() {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<{ x: number; y: number; size: number; twinkleSpeed: number; twinklePhase: number; driftX: number; driftY: number }[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Generate stars
    const starCount = 120;
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 0.5 + Math.random() * 2,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinklePhase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.15,
      driftY: (Math.random() - 0.5) * 0.15,
    }));

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });

    let time = 0;
    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of starsRef.current) {
        // Drift
        star.x += star.driftX;
        star.y += star.driftY;
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Twinkle
        const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
        const alpha = twinkle * 0.8;

        // Mouse parallax
        const dx = (mouseRef.current.x - 0.5) * 8;
        const dy = (mouseRef.current.y - 0.5) * 8;
        const px = star.x + dx * (star.size / 3);
        const py = star.y + dy * (star.size / 3);

        // Glow
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, star.size * 3);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.6})`);
        gradient.addColorStop(0.3, `rgba(99, 102, 241, ${alpha * 0.2})`);
        gradient.addColorStop(1, "rgba(99, 102, 241, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, star.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, star.size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Occasional connection lines to nearby stars
        if (star.size > 1.2) {
          for (const other of starsRef.current) {
            if (other === star) continue;
            if (other.size < 1.5) continue;
            const dist = Math.hypot(star.x - other.x, star.y - other.y);
            if (dist < 80 && dist > 5) {
              const connAlpha = (1 - dist / 80) * 0.08 * twinkle;
              ctx.strokeStyle = `rgba(99, 102, 241, ${connAlpha})`;
              ctx.lineWidth = 0.3;
              ctx.beginPath();
              ctx.moveTo(star.x, star.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}

// ═══════════════════════════════════════════════
//  AMBIENT COLOR-SHIFT GLOW — scroll-reactive
//  Subtle shifting background hue as you scroll
// ═══════════════════════════════════════════════
function AmbientGlow() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const hue = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [240, 280, 320, 260, 240]);

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: useTransform(hue, (h) =>
          `radial-gradient(ellipse 100% 60% at 50% 0%, hsla(${h}, 70%, 50%, 0.04) 0%, transparent 70%)`
        ),
      }}
    />
  );
}

// ═══════════════════════════════════════════════
//  SHOOTING STAR — occasional meteor across sky
// ═══════════════════════════════════════════════
function ShootingStars() {
  const prefersReducedMotion = useReducedMotion();
  const [stars, setStars] = useState<{ id: number; x: number; y: number; angle: number; speed: number; length: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const spawn = () => {
      const id = idRef.current++;
      const angle = -30 + Math.random() * 20; // degrees
      setStars(prev => [...prev, {
        id,
        x: Math.random() * 80 + 10,
        y: Math.random() * 30,
        angle: angle,
        speed: 0.6 + Math.random() * 0.8,
        length: 40 + Math.random() * 60,
      }]);
      // Remove after animation
      setTimeout(() => {
        setStars(prev => prev.filter(s => s.id !== id));
      }, 2000);
    };

    const interval = setInterval(spawn, 3000 + Math.random() * 4000);
    spawn(); // first one immediately

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <>
      {stars.map(s => (
        <motion.div
          key={s.id}
          className="pointer-events-none fixed z-0"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.length,
            height: 1,
            background: `linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)`,
            transform: `rotate(${s.angle}deg)`,
            transformOrigin: "left center",
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: [0, 0.6, 0], scaleX: [0, 1, 0.5] }}
          transition={{ duration: s.speed, ease: "easeOut" }}
        />
      ))}
    </>
  );
}


// ═══════════════════════════════════════════════
//  SCROLL TRAIL — organic spring trail on scroll
//  Head follows scroll closely; tail lags behind,
//  creating a responsive "trail" that stretches
//  when you scroll fast and catches up when you stop.
// ═══════════════════════════════════════════════
function ScrollTrail() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // ── Spring physics ──
  // Head: fast, light mass — follows scroll tightly
  const headSpring = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    mass: 0.2,
  });
  // Tail: slow, heavy mass — lags behind, creates gap
  const tailSpring = useSpring(scrollYProgress, {
    stiffness: 30,
    damping: 28,
    mass: 1.8,
  });
  // Velocity glow: brightens when scrolling fast
  const velocity = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 40,
    mass: 0.5,
  });

  // Transformed values for positioning
  const headTop = useTransform(headSpring, (v) => `${v * 100}%`);
  const tailTop = useTransform(tailSpring, (v) => `${v * 100}%`);
  const trailHeight = useTransform([headSpring, tailSpring], ([h, t]: number[]) =>
    `${Math.max((h - t) * 100, 0.5)}%`
  );

  // Glow intensity based on scroll velocity
  const glowOpacity = useTransform(velocity, (v) => {
    const prev = scrollYProgress.getPrevious();
    const diff = prev !== undefined ? Math.abs(v - prev) * 50 : 0;
    return Math.min(diff, 0.8);
  });

  if (prefersReducedMotion) return null;

  return (
    <div className="fixed right-5 top-0 z-50 h-full w-[4px] pointer-events-none">
      {/* Rail — subtle background track */}
      <div className="absolute inset-0 w-full rounded-full bg-white/[0.04]" />

      {/* Primary trail — gradient from head down to tail (brighter, wider) */}
      <motion.div
        className="absolute -left-[2px] -right-[2px] rounded-full origin-top blur-[1px]"
        style={{
          background: "linear-gradient(to bottom, rgba(129, 140, 248, 0.5), rgba(168, 85, 247, 0.2), transparent)",
          top: tailTop,
          height: trailHeight,
        }}
      />

      {/* Secondary trail echo — wider glow */}
      <motion.div
        className="absolute -left-[8px] -right-[8px] rounded-full origin-top"
        style={{
          background: "linear-gradient(to bottom, rgba(129, 140, 248, 0.12), transparent)",
          top: tailTop,
          height: trailHeight,
          filter: "blur(6px)",
        }}
      />

      {/* Ghost trail — even slower, creates the stretch effect */}
      <motion.div
        className="absolute -left-[4px] -right-[4px] rounded-full origin-top"
        style={{
          background: "linear-gradient(to bottom, rgba(168, 85, 247, 0.08), transparent)",
          top: useTransform(
            useSpring(scrollYProgress, { stiffness: 15, damping: 35, mass: 3 }),
            (v) => `${v * 100}%`),
          height: useTransform(
            [headSpring, useSpring(scrollYProgress, { stiffness: 15, damping: 35, mass: 3 })],
            ([h, t]: number[]) => `${Math.max((h - t) * 100, 0.5)}%`
          ),
          filter: "blur(3px)",
        }}
      />

      {/* Head — bright glowing dot with multi-ring aura */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: headTop,
        }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[20px] w-[20px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, transparent 70%)",
            filter: "blur(3px)",
            opacity: glowOpacity,
            scale: useTransform(glowOpacity, [0, 0.8], [0.8, 1.8]),
          }}
        />
        {/* Mid ring */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[12px] w-[12px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(129, 140, 248, 0.4) 0%, transparent 60%)",
          }}
        />
        {/* Core dot */}
        <div className="h-[6px] w-[6px] rounded-full relative"
          style={{
            backgroundColor: "#818cf8",
            boxShadow: "0 0 8px rgba(129, 140, 248, 0.8), 0 0 20px rgba(129, 140, 248, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)",
          }}
        />
      </motion.div>

      {/* Trail echo dot at tail */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full"
        style={{
          top: tailTop,
          backgroundColor: "#a78bfa",
          opacity: 0.3,
          boxShadow: "0 0 6px rgba(168, 85, 247, 0.3)",
        }}
      />

      {/* Mid-trail dots — small markers along the stretched trail */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 h-[2px] w-[2px] rounded-full"
        style={{
          top: useTransform(
            useSpring(scrollYProgress, { stiffness: 60, damping: 25, mass: 0.8 }),
            (v) => `${v * 100}%`),
          backgroundColor: "rgba(129, 140, 248, 0.15)",
        }}
      />

      {/* Velocity glow ring — pulses when scrolling fast */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 h-[18px] w-[18px] rounded-full -mt-[7px] pointer-events-none"
        style={{
          top: headTop,
          border: "1px solid rgba(129, 140, 248, 0.15)",
          opacity: useTransform(glowOpacity, [0, 0.8], [0, 0.6]),
          scale: useTransform(glowOpacity, [0, 0.8], [0.5, 2]),
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════
//  HIGH-PERFORMANCE CURSOR ORB — pixel-accurate
// ═══════════════════════════════════════════════
function CursorOrb() {
  const orbRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const mousePos = useRef({ x: -400, y: -400 });
  const currentPos = useRef({ x: -400, y: -400 });
  const glowPos = useRef({ x: -400, y: -400 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });

    const coreStiffness = 0.28;
    const coreDamping = 0.65;
    const glowStiffness = 0.1;
    const glowDamping = 0.75;

    const tick = () => {
      const dx = mousePos.current.x - currentPos.current.x;
      const dy = mousePos.current.y - currentPos.current.y;

      currentPos.current.x += dx * coreStiffness;
      currentPos.current.y += dy * coreStiffness;

      const residualX = mousePos.current.x - currentPos.current.x;
      const residualY = mousePos.current.y - currentPos.current.y;
      currentPos.current.x += residualX * coreDamping * 0.1;
      currentPos.current.y += residualY * coreDamping * 0.1;

      const gdx = currentPos.current.x - glowPos.current.x;
      const gdy = currentPos.current.y - glowPos.current.y;
      glowPos.current.x += gdx * glowStiffness;
      glowPos.current.y += gdy * glowStiffness;
      glowPos.current.x += (currentPos.current.x - glowPos.current.x) * glowDamping * 0.06;
      glowPos.current.y += (currentPos.current.y - glowPos.current.y) * glowDamping * 0.06;

      if (coreRef.current) {
        coreRef.current.style.transform = `translate(${currentPos.current.x - 4}px, ${currentPos.current.y - 4}px)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${glowPos.current.x - 100}px, ${glowPos.current.y - 100}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[200px] w-[200px] rounded-full opacity-[0.15] blur-[80px]"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)" }}
      />
      <div
        ref={coreRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-white mix-blend-difference"
        style={{ boxShadow: "0 0 6px rgba(255,255,255,0.8)" }}
      />
    </>
  );
}

// ═══════════════════════════════════════════════
//  SCANNING LINE — subtle CRT vibe
// ═══════════════════════════════════════════════
function ScanLine() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9998] h-px w-full"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)",
      }}
      animate={
        prefersReducedMotion
          ? {}
          : {
              top: ["0%", "100%", "0%"],
              opacity: [0, 0.6, 0],
            }
      }
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// ═══════════════════════════════════════════════
//  FLOATING PARTICLES — ambient background
// ═══════════════════════════════════════════════
function FloatingParticles({ count = 8 }: { count?: number }) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return null;

  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 5,
      duration: 12 + Math.random() * 10,
      driftX: (Math.random() - 0.5) * 40,
      driftY: (Math.random() - 0.5) * 40,
    }))
  ).current;

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="pointer-events-none fixed rounded-full bg-white/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            x: [0, p.driftX, 0],
            y: [0, p.driftY, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════
//  DECORATIVE QUOTE MARK — Emil's signature detail
// ═══════════════════════════════════════════════
function DecorativeQuoteMark({ gameColor }: { gameColor: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      className="pointer-events-none absolute -left-1 -top-3 select-none text-[80px] leading-none font-serif opacity-[0.04] md:text-[100px]"
      aria-hidden="true"
      style={{ color: gameColor }}
      animate={
        prefersReducedMotion
          ? {}
          : {
              y: [0, -4, 0],
              rotate: [-1.5, 1.5, -1.5],
              scale: [1, 1.02, 1],
            }
      }
      transition={{
        duration: 5 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      &ldquo;
    </motion.span>
  );
}

// ═══════════════════════════════════════════════
//  QUOTE CARD — with Emil Kowalski spring physics
// ═══════════════════════════════════════════════
function QuoteCard({ quote, index }: { quote: QuoteEntry; index: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      layout
      className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl will-change-transform overflow-hidden"
      style={{ borderColor: `color-mix(in srgb, ${quote.gameColor} 15%, transparent)` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.5, delay: index * staggerDelay, ease: easeOut }
      }
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              scale: 1.015,
              y: -3,
              borderColor: `color-mix(in srgb, ${quote.gameColor} 40%, rgba(255,255,255,0.12))`,
              transition: { ...springHover, y: { stiffness: 200, damping: 20 } },
            }
      }
      whileTap={
        prefersReducedMotion
          ? {}
          : { scale: 0.985, transition: springTap }
      }
    >
      {/* Active press ring */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-200 group-active:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${quote.gameColor}40`,
        }}
      />

      {/* Top gradient line */}
      <div
        className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Decorative floating quote mark */}
      <DecorativeQuoteMark gameColor={quote.gameColor} />

      {/* Quote text */}
      <div className="relative">
        <p className="text-sm leading-relaxed text-[var(--color-text-primary)] md:text-base">
          &ldquo;{quote.text}&rdquo;
        </p>
      </div>

      {/* Source + game badge row */}
      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.04] pt-3">
        <span
          className="text-[11px] font-medium"
          style={{ color: quote.gameColor }}
        >
          — {quote.source}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">·</span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            backgroundColor: `${quote.gameColor}15`,
            color: quote.gameColor,
          }}
        >
          {quote.game}
        </span>
      </div>

      {/* Bottom glow on hover */}
      <div
        className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Side accent glow */}
      <div
        className="absolute right-0 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-l-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(to top, transparent, ${quote.gameColor}30, transparent)` }}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
//  GAME SECTION — grouped quotes with header
// ═══════════════════════════════════════════════
function GameSection({
  game,
  entries,
  index,
}: {
  game: string;
  entries: QuoteEntry[];
  index: number;
}) {
  const color = entries[0].gameColor;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: easeOut, delay: index * 0.06 }}
    >
      {/* Game header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
        <motion.span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-[11px] font-medium uppercase tracking-wider"
          style={{
            backgroundColor: `${color}12`,
            color: color,
            borderColor: `${color}25`,
            borderWidth: 1,
          }}
          whileHover={springHover ? { scale: 1.05, transition: springHover } : {}}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          {game}
        </motion.span>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      {/* Quote cards grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map((quote, i) => (
          <QuoteCard key={`${game}-${i}`} quote={quote} index={i} />
        ))}
      </div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════
//  PAGE — main export
// ═══════════════════════════════════════════════
export default function QuotesPage() {
  const prefersReducedMotion = useReducedMotion();
  const grouped = groupByGame(quotes);
  const gameKeys = Object.keys(grouped);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background grain overlay — Emil's anti-digital texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Radial vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.03) 0%, transparent 70%)",
        }}
      />

      {/* ── Ambient background effects ── */}
      <StarField />
      <AmbientGlow />
      <ShootingStars />

      {/* ── Interactive effects ── */}
      <CursorOrb />
      <ScrollTrail />
      <ScanLine />
      <FloatingParticles count={8} />

      <div className="relative z-10">
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        </nav>

        <div className="px-6 py-24 md:px-16">
          <div className="mx-auto max-w-4xl">
            {/* ── Header ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="mb-16"
            >
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05, duration: 0.4, ease: easeSpring }}
              >
                <motion.span
                  animate={prefersReducedMotion ? {} : { rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkle size={12} />
                </motion.span>
                Game Quotes
              </motion.div>

              <motion.h1
                className="mt-4 text-4xl font-bold tracking-tight md:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: easeOut }}
              >
                Words That{" "}
                <motion.span
                  className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: easeSpring }}
                >
                  Stick
                </motion.span>
              </motion.h1>

              <motion.p
                className="mt-3 max-w-lg text-[var(--color-text-secondary)]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: easeOut }}
              >
                Game quotes that stuck with me. Grouped by game, colored by memory.
              </motion.p>
            </motion.div>

            {/* ── Game sections ── */}
            <motion.div
              className="space-y-12"
              variants={
                prefersReducedMotion
                  ? {}
                  : {
                      hidden: {},
                      show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
                    }
              }
              initial="hidden"
              animate="show"
            >
              {gameKeys.map((game, i) => (
                <GameSection
                  key={game}
                  game={game}
                  entries={grouped[game]}
                  index={i}
                />
              ))}
            </motion.div>

            {/* ── Footer ── */}
            <motion.p
              className="mt-20 text-center text-xs text-[var(--color-text-muted)]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              {quotes.length} quotes across {gameKeys.length} games · updated occasionally
            </motion.p>
          </div>
        </div>
      </div>
    </main>
  );
}
