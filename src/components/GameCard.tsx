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

  return (
    <div
      ref={cardRef}
      className="group relative cursor-pointer [perspective:1200px]"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Hover glow behind card ── */}
      <motion.div
        className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at center, ${accentColor}25, transparent 70%)`,
        }}
      />

      {/* ── 3D card wrapper ── */}
      <div
        className="card-3d relative h-full min-h-[320px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ════════════════════════════════════════════ */}
        {/*  FRONT FACE
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
          {/* Tilt-sensitive gradient overlay applied only when not flipped */}
          {!flipped && (
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}20, transparent 60%)`,
                rotateX: tiltX,
                rotateY: tiltY,
              }}
            />
          )}

          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Border glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              border: `1px solid ${accentColor}`,
              boxShadow: `inset 0 0 24px ${accentColor}15, 0 0 30px ${accentColor}10`,
            }}
          />

          {/* ── Front content ── */}
          <div className="relative z-[1] flex h-full flex-col p-6">
            {/* Rating badge */}
            <motion.div
              className="flex items-center gap-1.5 self-start rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 backdrop-blur-sm"
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
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                {rating}/10
              </span>
            </motion.div>

            {/* Title */}
            <motion.h3
              className="mt-4 font-orbitron text-lg font-bold leading-tight"
              style={{ color: accentColor }}
            >
              {title}
            </motion.h3>

            {/* Description */}
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {description}
            </p>

            {/* CTA */}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
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
          {/* Gradient bg */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.12]`} />
          <div className="absolute inset-0 bg-[var(--color-bg)]" />

          {/* Accent top bar with shimmer */}
          <motion.div
            className="absolute left-0 top-0 h-[3px] w-full rounded-t-2xl"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80, ${accentColor})`,
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
              background: `radial-gradient(circle, ${accentColor}25, transparent 70%)`,
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
                className="font-orbitron text-sm font-bold leading-tight"
                style={{ color: accentColor }}
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
                      delay: 0.15 + i * 0.07,
                      type: "spring",
                      stiffness: 250,
                      damping: 18,
                    }}
                  >
                    <Star size={10} weight="fill" style={{ color: accentColor }} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Review */}
            <motion.div
              className="mt-3 flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {review}
              </p>
            </motion.div>

            {/* Back CTA */}
            <motion.div
              className="mt-4 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ArrowRight size={12} className="rotate-180" />
              <motion.span
                animate={{ x: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                Tap to go back
              </motion.span>
            </motion.div>
          </div>

          <Sparkles accentColor={accentColor} show={flipped} />
        </motion.div>
      </div>
    </div>
  );
});

export default GameCard;
