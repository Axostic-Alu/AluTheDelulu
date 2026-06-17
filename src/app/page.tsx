"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Dela_Gothic_One } from "next/font/google";
import dynamic from "next/dynamic";
import GlitchText from "@/components/GlitchText";
import Link from "next/link";

// ── Lazy-load heavy components ──
const ParticleCursorTrail = dynamic(() => import("@/components/ParticleCursorTrail"), {
  ssr: false,
});
const PetalsBackground = dynamic(() => import("@/components/PetalsBackground"), {
  ssr: false,
});

// ── Emil Kowalski–inspired spring variants ──
const springUp = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 14,
      delay: i * 0.06,
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const revealSpring = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 16 },
  },
};

const display = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
});

function useRevealOnScroll(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="fixed bottom-8 left-1/2 z-50 flex flex-col items-center gap-1.5 pointer-events-none"
      style={{ x: "-50%" }}
    >
      <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-zinc-500">
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          className="w-5 h-5 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}


export default function Home() {
  const [imgError, setImgError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const tiltRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reducedMotionRef = useRef(false);

  const [catPos, setCatPos] = useState(50);
  const [isFacingRight, setIsFacingRight] = useState(true);
  const [catAction, setCatAction] = useState<"running" | "jumping" | "eating" | "sleeping">("running");
  const [catMsg, setCatMsg] = useState("");

  // ── Ref-based sparkle trail (no re-renders on mousemove) ──
  const sparklesRef = useRef<{ x: number; y: number; id: number }[]>([]);
  const [sparkles, setSparkles] = useState<{ x: number; y: number; id: number }[]>([]);
  const sparkleIdRef = useRef(0);
  const cardSparkleRef = useRef<HTMLDivElement>(null);
  const sparkleRafRef = useRef<number | null>(null);

  const flushSparkles = useCallback(() => {
    setSparkles([...sparklesRef.current]);
    sparkleRafRef.current = null;
  }, []);

  const handleCardSparkle = useCallback(
    (e: React.MouseEvent) => {
      if (Math.random() > 0.25) return;
      const rect = cardSparkleRef.current?.getBoundingClientRect();
      if (!rect) return;
      const id = sparkleIdRef.current++;
      const newSparkle = { x: e.clientX - rect.left, y: e.clientY - rect.top, id };
      sparklesRef.current = [...sparklesRef.current.slice(-10), newSparkle];
      if (sparkleRafRef.current === null) {
        sparkleRafRef.current = requestAnimationFrame(flushSparkles);
      }
      setTimeout(() => {
        sparklesRef.current = sparklesRef.current.filter((s) => s.id !== id);
        if (sparkleRafRef.current === null) {
          sparkleRafRef.current = requestAnimationFrame(flushSparkles);
        }
      }, 900);
    },
    [flushSparkles]
  );

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // ── Video autoplay with retry logic ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
      } catch {
        setTimeout(async () => {
          try {
            await video.play();
          } catch {
            setVideoError(true);
          }
        }, 1000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && video.paused) {
        attemptPlay();
      }
    };

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      attemptPlay();
    };

    video.addEventListener("canplay", handleCanPlay);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (video.readyState >= 3) {
      setIsVideoLoaded(true);
      attemptPlay();
    }

    const handleUserInteraction = () => {
      if (video.paused) attemptPlay();
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("scroll", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);
    document.addEventListener("scroll", handleUserInteraction);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("scroll", handleUserInteraction);
    };
  }, []);

  // ── Cat movement interval ──
  useEffect(() => {
    if (catAction !== "running") return;

    const moveInterval = setInterval(() => {
      setCatPos((prev) => {
        const step = 2;
        let nextPos = isFacingRight ? prev + step : prev - step;
        if (nextPos >= 90) {
          setIsFacingRight(false);
          nextPos = 90;
        } else if (nextPos <= 10) {
          setIsFacingRight(true);
          nextPos = 10;
        }
        return nextPos;
      });
    }, 300);

    return () => clearInterval(moveInterval);
  }, [catAction, isFacingRight]);

  const interactWithCat = useCallback(
    (action: "jumping" | "eating" | "sleeping", msg: string) => {
      setCatAction(action);
      setCatMsg(msg);
      setTimeout(() => {
        setCatAction("running");
        setCatMsg("");
      }, 3000);
    },
    []
  );

  // ── RAF-throttled tilt handler ──
  const tiltRafRef = useRef<number | null>(null);
  const handleCardMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotionRef.current || isFlipped) return;
      const container = tiltRef.current;
      const glow = glowRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - py) * 14;
      const rotateY = (px - 0.5) * 14;

      if (tiltRafRef.current !== null) return;
      tiltRafRef.current = requestAnimationFrame(() => {
        container!.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        tiltRafRef.current = null;
        if (glow) {
          glow.style.opacity = "1";
          const glowColor = isPlaying ? "167, 139, 250" : "125, 211, 252";
          glow.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(${glowColor}, 0.25), transparent 50%)`;
        }
      });
    },
    [isFlipped, isPlaying]
  );

  const handleCardMouseLeave = useCallback(() => {
    if (isFlipped) return;
    const container = tiltRef.current;
    if (container) container.style.transform = "rotateX(0deg) rotateY(0deg)";
    if (glowRef.current) glowRef.current.style.opacity = "0";
  }, [isFlipped]);

  const { ref: aboutRef, visible: aboutVisible } = useRevealOnScroll();

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  // Audio is available but only plays on user interaction (togglePlay)
  // No autoplay to avoid competing with initial page load
  useEffect(() => {
    // Just mark audio as ready; user clicks play to hear
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    if (tiltRef.current) tiltRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    if (glowRef.current) glowRef.current.style.opacity = "0";
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      {/* Background Video Container */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e] z-0" />
        <div className="absolute inset-0 bg-black/60 z-10" />
        {!isVideoLoaded && !videoError && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e] z-20 flex items-center justify-center">
            <div className="text-white/30 text-xs tracking-widest uppercase">Loading...</div>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded && !videoError ? "opacity-100" : "opacity-0"}`}
          style={{ filter: "brightness(0.6)" }}
        >
          <source src="/video/background.mp4" type="video/mp4" />
        </video>
      </div>

      <ParticleCursorTrail />
      <PetalsBackground petalCount={12} startDelay={2500} />

      <style jsx global>{`
        @keyframes floatAnime {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(3deg);
          }
        }
        @keyframes equalizer {
          0%,
          100% {
            height: 4px;
          }
          50% {
            height: 18px;
          }
        }
        @keyframes jump {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes eat {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.85) translateY(5px);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
        @keyframes spinSlow {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes pulseAura {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.06);
          }
        }
        @keyframes sparkleFade {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(180deg);
          }
        }
        .animate-float {
          animation: floatAnime 4s ease-in-out infinite;
        }
        .eq-bar {
          width: 2px;
          height: 10px;
          border-radius: 1px;
          transition: background-color 0.3s;
        }
        .cat-jumping {
          animation: jump 0.5s ease-in-out infinite;
        }
        .cat-eating {
          animation: eat 0.5s ease-in-out infinite;
        }
        .ring-spin-glow {
          animation: spinSlow 8s linear infinite;
        }
        .ring-spin-glow-reverse {
          animation: spinSlow 8s linear infinite reverse;
        }
        .text-shimmer {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.4) 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 6s linear infinite;
        }
        .animate-pulse-aura {
          animation: pulseAura 3s ease-in-out infinite;
        }
        .animate-sparkle {
          animation: sparkleFade 0.9s ease-out forwards;
        }
        .group\/card {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .group\/card:hover {
          transform: translateY(-6px);
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .text-shimmer,
          .ring-spin-glow,
          .ring-spin-glow-reverse,
          .eq-bar,
          .cat-jumping,
          .cat-eating,
          .animate-pulse-aura,
          .animate-sparkle {
            animation: none !important;
          }
        }
      `}</style>

      <motion.main
        initial={false}
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24"
      >
        <div className="relative max-w-md w-full h-[640px]" style={{ perspective: "1400px" }}>
          <div
            className="absolute -inset-8 rounded-3xl opacity-0 group-hover/card:opacity-70 transition-all duration-700 pointer-events-none animate-pulse-aura"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.35) 0%, rgba(56,189,248,0.2) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <motion.div
            ref={tiltRef}
            onMouseMove={(e) => {
              handleCardMouseMove(e);
              handleCardSparkle(e);
            }}
            onMouseLeave={handleCardMouseLeave}
            className="w-full h-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group/card"
            style={{ transformStyle: "preserve-3d" }}
            variants={springUp}
            custom={0}
          >
            <div
              onClick={handleFlip}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleFlip();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={isFlipped ? "Flip card back to profile" : "Flip card to interact with mascot"}
              className="relative w-full h-full duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer shadow-2xl rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
              style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
              {/* CARD FRONT */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#121214]/95 to-[#050505]/95 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 flex flex-col items-center text-center overflow-hidden justify-between z-20 shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(0deg) translateZ(1px)",
                  borderColor: isPlaying ? "rgba(167, 139, 250, 0.4)" : "rgba(255, 255, 255, 0.08)",
                  boxShadow: isPlaying
                    ? "0 0 60px rgba(167, 139, 250, 0.2), inset 0 0 40px rgba(167, 139, 250, 0.05)"
                    : "0 20px 50px rgba(0,0,0,0.5)",
                  transition: "border-color 0.5s, box-shadow 0.5s",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                />
                <div ref={glowRef} className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 mix-blend-screen" />

                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover/card:opacity-40 transition-all duration-700"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(167,139,250,0.5) 0%, transparent 30%, rgba(56,189,248,0.35) 50%, transparent 80%, rgba(236,72,153,0.25) 100%)",
                  }}
                />

                <div
                  className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 rounded-tl-lg pointer-events-none z-30 transition-all duration-300 group-hover/card:scale-110"
                  style={{ borderColor: "rgba(167,139,250,0.5)" }}
                />
                <div
                  className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 rounded-tr-lg pointer-events-none z-30 transition-all duration-300 group-hover/card:scale-110"
                  style={{ borderColor: "rgba(56,189,248,0.5)" }}
                />
                <div
                  className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 rounded-bl-lg pointer-events-none z-30 transition-all duration-300 group-hover/card:scale-110"
                  style={{ borderColor: "rgba(236,72,153,0.5)" }}
                />
                <div
                  className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 rounded-br-lg pointer-events-none z-30 transition-all duration-300 group-hover/card:scale-110"
                  style={{ borderColor: "rgba(167,139,250,0.5)" }}
                />

                {sparkles.map((s) => (
                  <div
                    key={s.id}
                    className="absolute w-2.5 h-2.5 rounded-full pointer-events-none z-40 animate-sparkle"
                    style={{
                      left: s.x - 5,
                      top: s.y - 5,
                      background: "#a78bfa",
                      boxShadow: "0 0 8px rgba(167,139,250,0.8), 0 0 16px rgba(56,189,248,0.4)",
                    }}
                  />
                ))}

                <motion.div
                  className="flex flex-col items-center w-full relative z-10 mt-2"
                  variants={staggerContainer}
                  initial={false}
                  animate="visible"
                >
                  <motion.div className="relative mb-6 group" variants={springUp} custom={1}>
                    <div className="ring-spin-glow absolute -inset-1.5 bg-gradient-to-r from-purple-500 via-sky-500 to-pink-500 rounded-full blur-[10px] opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200" />
                    <div className="ring-spin-glow-reverse absolute -inset-1.5 bg-gradient-to-r from-purple-500 via-sky-500 to-pink-500 rounded-full blur-[2px] opacity-20" />
                    {!imgError ? (
                      <img
                        src="/profile.png"
                        alt="Alus Profile"
                        loading="lazy"
                        className={`relative w-28 h-28 rounded-full border-[3px] object-cover shadow-xl transition-all duration-500 ${isPlaying ? "border-purple-400/60 scale-105" : "border-zinc-800"}`}
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="relative w-28 h-28 rounded-full border-[3px] border-zinc-800 bg-zinc-900 flex items-center justify-center text-5xl shadow-xl">
                        😎
                      </div>
                    )}
                  </motion.div>

                  <motion.h1 className={`${display.className} text-3xl mb-1.5 tracking-wide drop-shadow-lg`} variants={springUp} custom={2}>
                    <GlitchText speed={3} enableShadows={true} enableOnHover={false}>
                      AluTheDelulu
                    </GlitchText>
                  </motion.h1>

                  <motion.p
                    className={`mb-5 text-sm uppercase tracking-[0.2em] font-bold transition-colors duration-500 ${isPlaying ? "text-purple-400" : "text-sky-400"}`}
                    variants={springUp}
                    custom={3}
                  >
                    &ldquo;Almaan&rdquo;
                  </motion.p>

                  <motion.p className="text-shimmer text-sm leading-relaxed max-w-sm mb-6 px-2 font-medium" variants={springUp} custom={4}>
                    Lazy gamer just builds stuff when bored because it feels nice to create something. Doing it for fun.
                  </motion.p>

                  <motion.div className="flex space-x-4 mb-2" variants={springUp} custom={5}>
                    <a
                      href="https://www.facebook.com/otaku.labbi/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Facebook"
                      className="w-11 h-11 bg-zinc-900/50 hover:bg-sky-500/20 border border-white/5 hover:border-sky-500/50 rounded-xl flex items-center justify-center text-zinc-400 hover:text-sky-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
                      title="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/gm_axostic/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Instagram"
                      className="w-11 h-11 bg-zinc-900/50 hover:bg-pink-500/20 border border-white/5 hover:border-pink-500/50 rounded-xl flex items-center justify-center text-zinc-400 hover:text-pink-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
                      title="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                    <a
                      href="https://steamcommunity.com/profiles/76561198813103776/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Steam"
                      className="w-11 h-11 bg-zinc-900/50 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/50 rounded-xl flex items-center justify-center text-zinc-400 hover:text-blue-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
                      title="Steam"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.979 0C5.678 0 .511 4.86.122 11.037l6.036 2.477c.576-.538 1.346-.872 2.194-.872.147 0 .29.015.432.043l2.86-4.154v-.035a3.819 3.819 0 013.815-3.816 3.819 3.819 0 013.816 3.816 3.819 3.819 0 01-3.816 3.815h-.275l-4.131 2.869c.013.145.022.289.022.435a3.961 3.961 0 01-3.571 3.929l.965 3.846C17.118 22.808 24 17.648 24 11.037 24 4.619 18.627 0 11.979 0zM6.098 18.033a2.68 2.68 0 01-2.671 2.678 2.68 2.68 0 01-2.671-2.678c0-.399.089-.777.246-1.116l-2.504-1.033A4.003 4.003 0 002.498 20a4.003 4.003 0 004.628-3.914l2.124.879a2.649 2.649 0 01-2.389 2.332 2.678 2.678 0 01-.763-.264zm10.598-1.644a2.722 2.722 0 110-5.444 2.722 2.722 0 010 5.444z" />
                      </svg>
                    </a>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      tabIndex={0}
                      role="img"
                      aria-label="Discord: Axostic"
                      className="w-11 h-11 bg-zinc-900/50 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/50 rounded-xl flex items-center justify-center text-zinc-400 hover:text-indigo-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214] group relative"
                      title="Discord: Axostic"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.074 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.01-.09-.024-.105a13.142 13.142 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.075 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.894.077.077 0 0 0-.025.106c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.073 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                      </svg>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-[10px] font-mono tracking-normal opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none text-indigo-300 border border-indigo-500/20 shadow-lg">
                        Axostic
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Music Player */}
                <div className="w-full bg-zinc-900/40 backdrop-blur-xl p-3.5 rounded-2xl border border-white/5 relative mt-4 z-10 shadow-inner">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all duration-500 shadow-md ${
                        isPlaying ? "bg-purple-500/20 text-purple-400 border border-purple-500/20" : "bg-sky-500/10 text-sky-400 border border-sky-500/10"
                      }`}
                    >
                      {isPlaying ? (
                        <div className="flex items-end gap-[3px] h-4.5">
                          <div
                            className="eq-bar bg-purple-400"
                            style={{ animation: "equalizer 0.6s ease-in-out infinite alternate" }}
                          />
                          <div
                            className="eq-bar bg-purple-400"
                            style={{ animation: "equalizer 0.4s ease-in-out infinite alternate 0.15s" }}
                          />
                          <div
                            className="eq-bar bg-purple-400"
                            style={{ animation: "equalizer 0.7s ease-in-out infinite alternate 0.3s" }}
                          />
                        </div>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Now Playing</p>
                      <p
                        className={`font-bold text-sm truncate transition-colors duration-500 ${isPlaying ? "text-purple-300" : "text-sky-300"}`}
                      >
                        school rooftop
                      </p>
                    </div>
                    <audio ref={audioRef} src="/music/school rooftop.mp3" loop className="hidden" />
                    <button
                      onClick={togglePlay}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214] ${
                        isPlaying
                          ? "hover:bg-purple-500/20 hover:border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(167,139,250,0.2)] focus-visible:ring-purple-400/60"
                          : "hover:bg-sky-500/20 hover:border-sky-500/30 text-sky-300 focus-visible:ring-sky-400/60"
                      }`}
                      title={isPlaying ? "Pause" : "Play"}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="w-full mt-5 flex flex-col gap-2 relative z-10">
                  <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-500 mb-1">Click anywhere to flip</div>
                  <Link
                    href="/projects"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-zinc-500 hover:from-zinc-800 hover:to-zinc-700 transition-all duration-300 text-sm font-bold flex items-center justify-center gap-2 shadow-lg group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
                  >
                    <span className="group-hover:rotate-12 transition-transform duration-300">🛠️</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 to-zinc-400 group-hover:from-white group-hover:to-zinc-300">
                      View My Projects
                    </span>
                  </Link>
                </div>
              </div>

              {/* CARD BACK */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#121214]/95 to-[#050505]/95 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between items-center text-center z-10 shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg) translateZ(1px)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                />
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-35 transition-all duration-700"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(236,72,153,0.4) 0%, transparent 30%, rgba(99,102,241,0.3) 50%, transparent 80%, rgba(56,189,248,0.2) 100%)",
                  }}
                />
                <div
                  className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 rounded-tl-lg pointer-events-none z-30 transition-all duration-300 group-hover/card:scale-110"
                  style={{ borderColor: "rgba(236,72,153,0.5)" }}
                />
                <div
                  className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 rounded-tr-lg pointer-events-none z-30 transition-all duration-300 group-hover:scale-110"
                  style={{ borderColor: "rgba(99,102,241,0.5)" }}
                />
                <div
                  className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 rounded-bl-lg pointer-events-none z-30 transition-all duration-300 group-hover/card:scale-110"
                  style={{ borderColor: "rgba(56,189,248,0.5)" }}
                />
                <div
                  className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 rounded-br-lg pointer-events-none z-30 transition-all duration-300 group-hover/card:scale-110"
                  style={{ borderColor: "rgba(236,72,153,0.5)" }}
                />

                <div className="w-full flex justify-between items-center border-b border-white/5 pb-4 mb-2 relative z-10">
                  <div className="text-left">
                    <h3 className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1">Card Mascot</h3>
                    <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Neko</h2>
                  </div>
                  <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-xl text-right shadow-inner">
                    <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest block mb-0.5">Status</span>
                    <span className="font-mono font-bold text-xs text-orange-400 capitalize drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]">
                      {catAction}
                    </span>
                  </div>
                </div>

                <div className="flex-1 w-full relative z-10 flex flex-col justify-end pb-10">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      interactWithCat("jumping", "Meow! ✨");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        interactWithCat("jumping", "Meow! ✨");
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Pet the cat mascot"
                    className={`absolute bottom-10 cursor-pointer rounded-full transition-all duration-200 ease-linear focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]
                      ${catAction === "jumping" ? "cat-jumping" : ""}
                      ${catAction === "eating" ? "cat-eating" : ""}
                    `}
                    style={{ left: `${catPos}%`, transform: `translateX(-50%) ${isFacingRight ? "scaleX(-1)" : "scaleX(1)"}` }}
                  >
                    {catMsg && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl animate-fadeIn">
                        {catMsg}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/90" />
                      </div>
                    )}
                    <div className="text-6xl hover:scale-110 transition-transform drop-shadow-2xl">
                      {catAction === "sleeping" ? "🐱" : "🐈"}
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
                </div>

                <div className="w-full mt-4 flex gap-3 relative z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      interactWithCat("eating", "Nom nom 🐟");
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-orange-500/5 hover:bg-orange-500/15 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 font-bold text-sm transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(251,146,60,0.05)] hover:shadow-[0_0_20px_rgba(251,146,60,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
                  >
                    🐟 Feed
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      interactWithCat("sleeping", "Zzz... 💤");
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 font-bold text-sm transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.05)] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
                  >
                    🌙 Sleep
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      interactWithCat("jumping", "Purrr 💖");
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-pink-500/5 hover:bg-pink-500/15 border border-pink-500/20 hover:border-pink-500/40 text-pink-400 font-bold text-sm transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(236,72,153,0.05)] hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
                  >
                    👋 Pet
                  </button>
                </div>

                <div className="w-full bg-zinc-900/30 border border-white/5 rounded-xl p-3 text-center mt-5 relative z-10 pointer-events-none">
                  <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em]">Click card to flip back</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={revealSpring}
        className="relative z-10 px-4 py-20 flex justify-center"
        style={{ contain: "layout style", contentVisibility: "auto", containIntrinsicSize: "auto 400px" }}
      >
        <div
          ref={aboutRef}
          className={`max-w-2xl w-full bg-[#050505]/95 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_0_80px_rgba(255,255,255,0.02)] transition-all duration-700 ease-out ${aboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className={`${display.className} text-xl md:text-2xl mb-6 flex items-center gap-3`}>
            <span className="text-sky-400 animate-pulse">Who is</span> AluTheDelulu?
          </h2>
          <div className="space-y-4 text-zinc-400 text-sm leading-relaxed font-medium">
            <p>
              I am Almaan. I'm not special. I'm basically the human equivalent of a &quot;lazy&quot; status effect in an RPG. I don't
              follow grand master plans; I just do things for fun, mostly because I've decided that everything I do is technically a
              &quot;level up.&quot;
            </p>
            <p>
              Did I finally take out the trash? That&apos;s a +10 to my domestic stats. Did I manage to exist today? That&apos;s a
              legendary-tier achievement. I&apos;m just out here existing and trying to gain real-life XP, one leisurely quest at a
              time. If you&apos;re looking for a hyped up machine, you&apos;ve hit the wrong NPC. But if you&apos;re looking for someone
              who treats breathing as a significant milestone in their character progression, that&apos;s me!!
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              {
                label: "Lazy",
                sub: "Hooman",
                design:
                  "text-sky-400 bg-sky-500/5 border-sky-500/20 group-hover/tile:bg-sky-500/10 group-hover/tile:border-sky-500/40 group-hover/tile:shadow-[0_0_15px_rgba(14,165,233,0.2)]",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                ),
              },
              {
                label: "Builder",
                sub: "When Bored",
                design:
                  "text-purple-400 bg-purple-500/5 border-purple-500/20 group-hover/tile:bg-purple-500/10 group-hover/tile:border-purple-500/40 group-hover/tile:shadow-[0_0_15px_rgba(167,139,250,0.2)]",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 4a2 2 0 114 0v1a2 2 0 002 2h3a2 2 0 012 2v3a2 2 0 01-2 2h-1a2 2 0 100 4h1a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-1a2 2 0 10-4 0v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-3a2 2 0 012-2h1a2 2 0 100-4H4a2 2 0 01-2-2V9a2 2 0 012-2h3a2 2 0 012 2V4z"
                    />
                  </svg>
                ),
              },
              {
                label: "Chill",
                sub: "Vibes",
                design:
                  "text-pink-400 bg-pink-500/5 border-pink-500/20 group-hover/tile:bg-pink-500/10 group-hover/tile:border-pink-500/40 group-hover/tile:shadow-[0_0_15px_rgba(236,72,153,0.2)]",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                ),
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className={`bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-center cursor-default transition-all duration-500 hover:-translate-y-2 group/tile ${aboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: aboutVisible ? `${150 + i * 120}ms` : "0ms" }}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 16, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 12 } }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border transition-all duration-300 animate-float group-hover/tile:scale-110 ${stat.design}`}
                  style={{ animationDelay: `${i * 0.4}s` }}
                >
                  {stat.icon}
                </div>
                <div className="text-base font-bold text-zinc-100 tracking-wide">{stat.label}</div>
                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-1">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <ScrollIndicator />
    </div>
  );
}
