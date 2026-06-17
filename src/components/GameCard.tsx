"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Star, ArrowRight } from "@phosphor-icons/react";
import { useState, useRef, useCallback, memo } from "react";

interface GameCardProps {
  title: string;
  description: string;
  review: string;
  rating: number;
  gradient: string;
  accentColor: string;
}

// ── Floating sparkle particles ──
function Sparkles({ accentColor, show }: { accentColor: string; show: boolean }) {
  const particles = [
    { x: "10%", y: "20%", delay: 0, size: 4 },
    { x: "80%", y: "15%", delay: 0.5, size: 3 },
    { x: "20%", y: "70%", delay: 1, size: 5 },
    { x: "75%", y: "60%", delay: 0.3, size: 3.5 },
    { x: "50%", y: "85%", delay: 0.8, size: 4 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: accentColor,
            boxShadow: `0 0 ${p.size * 3}px ${accentColor}60`,
          }}
          initial={false}
          animate={{
            opacity: show ? [0, 1, 0.5, 1, 0] : 0,
            scale: show ? [0, 1, 0.8, 1, 0] : 0,
            y: show ? [0, -15, 0] : 0,
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Helper: lighten or darken a hex color ──
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r / 255: h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6; break;
      case g / 255: h = ((b / 255 - r / 255) / d + 2) / 6; break;
      case b / 255: h = ((r / 255 - g / 255) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const GameCard = memo(function GameCard({
  title,
  description,
  review,
  rating,
  gradient,
  accentColor,
}: GameCardProps) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isFlipping = useRef(false);
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Smooth mouse tracking with springs ──
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 });

  const tiltX = useTransform(springY, [0, 1], [8, -8]);
  const tiltY = useTransform(springX, [0, 1], [-8, 8]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || flipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }, [flipped, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  const handleClick = useCallback(() => {
    if (isFlipping.current) return;
    isFlipping.current = true;
    setFlipped((prev) => !prev);
    mouseX.set(0.5);
    mouseY.set(0.5);
    if (flipTimer.current) clearTimeout(flipTimer.current);
    flipTimer.current = setTimeout(() => {
      isFlipping.current = false;
    }, 700);
  }, [mouseX, mouseY]);

  const starsCount = Math.min(Math.round(rating / 2), 5);

  // ── Colored background layers ──
  const { h, s, l } = hexToHsl(accentColor);
  // Increased opacity to make cards more solid
  const bgGradient = `linear-gradient(145deg, ${rgba(accentColor, 0.35)}, ${rgba(accentColor, 0.15)} 50%, rgba(10, 10, 20, 0.75))`;
  const backBgGradient = `linear-gradient(145deg, ${rgba(accentColor, 0.40)}, ${rgba(accentColor, 0.20)} 60%, rgba(10, 10, 20, 0.80))`;
  const gridColor = rgba(accentColor, 0.08);
  const glowBorder = `1px solid ${rgba(accentColor, 0.25)}`;
  const glowShadow = `0 0 30px ${rgba(accentColor, 0.12)}, inset 0 0 24px ${rgba(accentColor, 0.08)}`;

  return (
    <div
      ref={cardRef}
      className="group relative cursor-pointer [perspective:1200px] h-full"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Hover glow behind card ── */}
      <motion.div
        className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at center, ${rgba(accentColor, 0.15)}, transparent 70%)`,
        }}
      />

      {/* ── 3D card wrapper ── */}
      <div
        className="card-3d relative h-full min-h-[320px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ════════════════════════════════════════════ */}
        {/*  FRONT FACE (description)
        {/* ════════════════════════════════════════════ */}
        <motion.div
          className="card-face absolute inset-0 overflow-hidden rounded-2xl border border-white/[0.06]"
          style={{ backfaceVisibility: "hidden" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{
            rotateY: {
              type: "spring",
              stiffness: 300,
              damping: 26,
              mass: 0.65,
            },
          }}
        >
          {/* Glass blur layer — with backdrop-filter and solid background to hide petals */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ 
            backdropFilter: "blur(24px)", 
            WebkitBackdropFilter: "blur(24px)",
            background: `linear-gradient(145deg, ${rgba(accentColor, 0.20)}, rgba(10, 10, 20, 0.85))`,
          }}>
            {/* Unique colored background per game — inline style with accentColor */}
            <div className="absolute inset-0" style={{ background: bgGradient }} />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          {/* Border glow on hover */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ border: glowBorder, boxShadow: glowShadow }}
          />

          {/* ── Front content ── */}
          <div className="relative z-[1] flex h-full flex-col p-6">
            {/* Rating badge */}
            <motion.div
              className="flex items-center gap-1.5 self-start rounded-full border border-white/[0.06] bg-black/40 px-3 py-1 backdrop-blur-sm"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Star size={12} weight="fill" style={{ color: accentColor }} />
              </motion.div>
              <span className="text-xs font-medium text-white/80">
                {rating}/10
              </span>
            </motion.div>

            {/* Title */}
            <motion.h3
              className="mt-4 font-orbitron text-lg font-bold leading-tight text-white"
              style={{ textShadow: `0 0 20px ${rgba(accentColor, 0.25)}` }}
            >
              {title}
            </motion.h3>

            {/* Description — FULL remaining height */}
            <div className="mt-2 flex-1 overflow-y-auto scrollbar-thin">
              <p className="text-sm leading-relaxed text-gray-200/95">
                {description}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: rgba(accentColor, 0.6) }}>
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight size={12} />
              </motion.span>
              Tap for review
            </div>
          </div>

          <Sparkles accentColor={accentColor} show={!flipped} />
        </motion.div>

        {/* ════════════════════════════════════════════ */}
        {/*  BACK FACE (review)
        {/* ════════════════════════════════════════════ */}
        <motion.div
          className="card-face absolute inset-0 overflow-hidden rounded-2xl border border-white/[0.06]"
          style={{ backfaceVisibility: "hidden" }}
          animate={{ rotateY: flipped ? 0 : 180 }}
          transition={{
            rotateY: {
              type: "spring",
              stiffness: 300,
              damping: 26,
              mass: 0.65,
            },
          }}
        >
          {/* Glass blur layer — with backdrop-filter and solid background to hide petals */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ 
            backdropFilter: "blur(24px)", 
            WebkitBackdropFilter: "blur(24px)",
            background: `linear-gradient(145deg, ${rgba(accentColor, 0.20)}, rgba(10, 10, 20, 0.85))`,
          }}>
            {/* Unique colored background for back */}
            <div className="absolute inset-0" style={{ background: backBgGradient }} />
            <div className="absolute inset-0" style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", background: "rgba(10, 10, 20, 0.6)" }} />
          </div>

          {/* Accent top bar with shimmer */}
          <motion.div
            className="absolute left-0 top-0 h-[3px] w-full rounded-t-2xl"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, ${rgba(accentColor, 0.5)}, ${accentColor})`,
              backgroundSize: "200% 100%",
            }}
            initial={false}
            animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Corner glow */}
          <motion.div
            className="absolute -top-8 -right-8 h-24 w-24 rounded-full"
            style={{
              background: `radial-gradient(circle, ${rgba(accentColor, 0.15)}, transparent 70%)`,
              filter: "blur(16px)",
            }}
            initial={false}
            animate={{ opacity: 1 }}
          />

          <div className="relative z-[1] flex h-full flex-col p-6">
            {/* Title + stars */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3
                className="font-orbitron text-sm font-bold leading-tight text-white"
                style={{ textShadow: `0 0 15px ${rgba(accentColor, 0.25)}` }}
              >
                {title}
              </h3>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: starsCount }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.15 + i * 0.08,
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                    }}
                  >
                    <Star size={10} weight="fill" style={{ color: accentColor }} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Review text */}
            <div className="mt-3 flex-1 overflow-y-auto scrollbar-thin">
              <p className="text-sm leading-relaxed text-gray-200/95">
                {review}
              </p>
            </div>

            {/* Rating on back */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(rating, 10) }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full"
                    style={{
                      width: 8 + (i === 9 ? 0 : 0),
                      background: i < rating ? accentColor : rgba(accentColor, 0.15),
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-bold" style={{ color: accentColor }}>
                {rating}/10
              </span>
            </div>

            {/* Flip back hint */}
            <p className="mt-3 text-[11px] text-center" style={{ color: rgba(accentColor, 0.5) }}>
              Tap to flip back ↺
            </p>
          </div>

          <Sparkles accentColor={accentColor} show={flipped} />
        </motion.div>
      </div>

      {/* ── Inner glow effect ── */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 40px ${rgba(accentColor, 0.06)}`,
        }}
      />

      <style jsx>{`
        .card-face {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .card-3d {
          perspective: 1200px;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
});

export default GameCard;