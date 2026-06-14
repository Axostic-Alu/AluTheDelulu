"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Users, Clock, TrendingUp, Terminal, Trophy,
  Sun, Moon, Volume2, VolumeX, Share2, Download, X, Globe
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════ */
type Theme = "dark" | "light";

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("dashboard_theme") as Theme) ?? "dark";
  });
  useEffect(() => {
    localStorage.setItem("dashboard_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}

/* ══════════════════════════════════════════════════════
   FIREBASE
══════════════════════════════════════════════════════ */
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, increment, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATYJy0G2MCRrQVr7pg7EhN7VtUhPThYkI",
  authDomain: "alu-website-d3284.firebaseapp.com",
  projectId: "alu-website-d3284",
  storageBucket: "alu-website-d3284.firebasestorage.app",
  messagingSenderId: "649200204559",
  appId: "1:649200204559:web:cc33e2b5cd42f992309c7a",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const SESSION_KEY = "dashboard_session_counted";

function getTodayDocId() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

async function incrementVisitorCount(): Promise<void> {
  if (sessionStorage.getItem(SESSION_KEY) === "true") return;
  sessionStorage.setItem(SESSION_KEY, "true");

  const todayId = getTodayDocId();
  const todayRef = doc(db, "visitors", todayId);
  const totalRef = doc(db, "visitors", "__total__");

  const todaySnap = await getDoc(todayRef);
  if (todaySnap.exists()) {
    await setDoc(todayRef, { count: increment(1) }, { merge: true });
  } else {
    await setDoc(todayRef, { count: 1, date: todayId });
  }
  await setDoc(totalRef, { count: increment(1) }, { merge: true });
}

function useLiveVisitors(): { today: number; total: number; loading: boolean } {
  const [today, setToday] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const todayId = getTodayDocId();
    const todayRef = doc(db, "visitors", todayId);
    const totalRef = doc(db, "visitors", "__total__");

    incrementVisitorCount().catch(console.error);

    const unsubToday = onSnapshot(todayRef, snap => {
      setToday(snap.exists() ? (snap.data().count ?? 0) : 0);
      setLoading(false);
    });
    const unsubTotal = onSnapshot(totalRef, snap => {
      setTotal(snap.exists() ? (snap.data().count ?? 0) : 0);
    });

    return () => { unsubToday(); unsubTotal(); };
  }, []);

  return { today, total, loading };
}

/* ══════════════════════════════════════════════════════
   AMBIENT SOUND
══════════════════════════════════════════════════════ */
type SoundType = "off" | "rain" | "whitenoise" | "lofi";

function useAmbientSound() {
  const [sound, setSound] = useState<SoundType>("off");
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const stopAll = useCallback(() => {
    nodesRef.current.forEach(n => { try { (n as any).stop?.(); } catch {} });
    nodesRef.current = [];
    ctxRef.current?.close();
    ctxRef.current = null;
  }, []);

  const startRain = useCallback((ctx: AudioContext) => {
    const bufSize = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1200;
    const gain = ctx.createGain(); gain.gain.value = 0.15;
    src.connect(lp); lp.connect(gain); gain.connect(ctx.destination);
    src.start();
    nodesRef.current = [src, lp, gain];
  }, []);

  const startWhiteNoise = useCallback((ctx: AudioContext) => {
    const bufSize = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const gain = ctx.createGain(); gain.gain.value = 0.08;
    src.connect(gain); gain.connect(ctx.destination);
    src.start();
    nodesRef.current = [src, gain];
  }, []);

  const startLofi = useCallback((ctx: AudioContext) => {
    const notes = [261.63, 311.13, 369.99, 440.00, 523.25];
    const nodes: AudioNode[] = [];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine"; osc.frequency.value = freq;
      const gain = ctx.createGain(); gain.gain.value = 0.02;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.3 + i * 0.07;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.01;
      lfo.connect(lfoGain); lfoGain.connect(gain.gain);
      osc.connect(gain); gain.connect(ctx.destination);
      lfo.start(); osc.start();
      nodes.push(osc, lfo, gain, lfoGain);
    });
    nodesRef.current = nodes;
  }, []);

  useEffect(() => {
    stopAll();
    if (sound === "off") return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctxRef.current = ctx;
    if (sound === "rain") startRain(ctx);
    else if (sound === "whitenoise") startWhiteNoise(ctx);
    else if (sound === "lofi") startLofi(ctx);
    return stopAll;
  }, [sound, stopAll, startRain, startWhiteNoise, startLofi]);

  return { sound, setSound };
}

/* ══════════════════════════════════════════════════════
   CURSOR TRAIL
══════════════════════════════════════════════════════ */
function CursorTrail({ theme }: { theme: Theme }) {
  const [trail, setTrail] = useState<Array<{ id: number; x: number; y: number; hue: number }>>([]);
  const counter = useRef(0);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const id = counter.current++;
      const hue = (Date.now() / 20) % 360;
      setTrail(prev => [...prev.slice(-18), { id, x: e.clientX, y: e.clientY, hue }]);
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {trail.map((p, i) => {
        const age = i / trail.length;
        const size = 6 + age * 10;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: p.x - size / 2,
              top: p.y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `hsl(${p.hue}, 90%, ${theme === "dark" ? 65 : 50}%)`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ANIMATED NUMBER
══════════════════════════════════════════════════════ */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current; const dur = 900; const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(start + (value - start) * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    prev.current = value; requestAnimationFrame(step);
  }, [value]);
  return <span className="tabular-nums">{display.toLocaleString()}</span>;
}

/* ══════════════════════════════════════════════════════
   PARTICLE FIELD
══════════════════════════════════════════════════════ */
function ParticleField({ theme }: { theme: Theme }) {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speed: number; opacity: number; hue: number }>>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    // Light mode: broader hue range — purples, pinks, ambers, teals
    setParticles(Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * r.width,
      y: Math.random() * r.height,
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * (theme === "dark" ? 0.4 : 0.35) + 0.05,
      hue: theme === "dark" ? Math.random() * 60 + 180 : [270, 320, 45, 180, 30][i % 5],
    })));
  }, [theme]);

  useEffect(() => {
    let frame: number;
    const go = () => {
      setParticles(prev => prev.map(p => {
        const ny = p.y - p.speed; const reset = ny < -10;
        return { ...p, y: reset ? window.innerHeight : ny, x: p.x + Math.sin(Date.now() * 0.001 + p.y) * 0.3 };
      }));
      frame = requestAnimationFrame(go);
    };
    frame = requestAnimationFrame(go);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: p.x, top: p.y,
          width: p.size, height: p.size,
          backgroundColor: `hsl(${p.hue}, ${theme === "dark" ? 70 : 80}%, ${theme === "dark" ? 60 : 55}%)`,
          opacity: p.opacity, borderRadius: "50%",
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   INTERACTIVE BACKGROUND
══════════════════════════════════════════════════════ */
function InteractiveBackground({ theme }: { theme: Theme }) {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const { scrollY } = useScroll();
  const scrollProgress = useTransform(scrollY, [0, 3000], [0, 1]);
  const springX = useSpring(scrollProgress, { stiffness: 80, damping: 25 });
  useEffect(() => {
    const h = (e: MouseEvent) => { mouseX.set(e.clientX / window.innerWidth); mouseY.set(e.clientY / window.innerHeight); };
    window.addEventListener("mousemove", h); return () => window.removeEventListener("mousemove", h);
  }, [mouseX, mouseY]);

  const o1x = useTransform(springX, [0, 1], [-150, 150]);
  const o1y = useTransform(mouseY, [0, 1], [-80, 80]);
  const o2x = useTransform(mouseX, [0, 1], [-120, 120]);
  const o2y = useTransform(scrollProgress, [0, 1], [-150, 150]);
  const o3x = useTransform(mouseX, [0, 1], [80, -80]);
  const o3y = useTransform(mouseY, [0, 1], [80, -80]);

  // Light mode: vivid multi-colour orbs — violet, rose, amber, teal
  const bg = theme === "dark"
    ? "linear-gradient(135deg,#050505,#0a0a0f,#050505)"
    : "linear-gradient(135deg,#fdf4ff,#fff1f5,#f0fdf9,#fffbeb)";

  const orbs = theme === "dark"
    ? [
        { x: o1x, y: o1y, pos: "top-1/4 left-1/4", size: "600px", bg: "rgba(6,182,212,0.06)" },
        { x: o2x, y: o2y, pos: "bottom-1/4 right-1/4", size: "500px", bg: "rgba(236,72,153,0.06)" },
        { x: o3x, y: o3y, pos: "top-1/2 left-1/2", size: "400px", bg: "rgba(99,102,241,0.05)" },
      ]
    : [
        { x: o1x, y: o1y, pos: "top-1/4 left-1/4", size: "600px", bg: "rgba(168,85,247,0.12)" },
        { x: o2x, y: o2y, pos: "bottom-1/3 right-1/4", size: "500px", bg: "rgba(244,63,94,0.1)" },
        { x: o3x, y: o3y, pos: "top-1/2 left-1/2", size: "450px", bg: "rgba(245,158,11,0.09)" },
        { x: o1x, y: o3y, pos: "top-2/3 left-1/3", size: "380px", bg: "rgba(20,184,166,0.09)" },
      ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div style={{ position: "absolute", inset: 0, background: bg }} />
      {orbs.map((o, i) => (
        <motion.div key={i} style={{ x: o.x, y: o.y, background: o.bg, filter: "blur(160px)" }}
          className={`absolute ${o.pos} -translate-x-1/2 -translate-y-1/2 rounded-full`}
          style={{ x: o.x, y: o.y, width: o.size, height: o.size, background: o.bg, filter: "blur(160px)" }}
        />
      ))}
      <ParticleField theme={theme} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════════════════════ */
function ThemeToggle({ theme, toggle }: { theme: Theme; toggle: () => void }) {
  const s = {
    borderColor: theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
    color: theme === "dark" ? "#e4e4e7" : "#18181b",
  };
  return (
    <motion.button onClick={toggle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors text-sm font-medium"
      style={s}>
      <motion.div animate={{ rotate: theme === "dark" ? 0 : 180 }} transition={{ duration: 0.4 }}>
        {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </motion.div>
      {theme === "dark" ? "Dark" : "Light"}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════
   AMBIENT SOUND TOGGLE
══════════════════════════════════════════════════════ */
function SoundToggle({ sound, setSound, theme }: { sound: SoundType; setSound: (s: SoundType) => void; theme: Theme }) {
  const [open, setOpen] = useState(false);
  const options: { key: SoundType; label: string; icon: string }[] = [
    { key: "off", label: "Off", icon: "🔇" },
    { key: "rain", label: "Rain", icon: "🌧️" },
    { key: "whitenoise", label: "White noise", icon: "🌊" },
    { key: "lofi", label: "Lo-fi tones", icon: "🎵" },
  ];
  const chip = {
    background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)",
    color: theme === "dark" ? "#e4e4e7" : "#18181b",
  };

  return (
    <div className="relative">
      <motion.button onClick={() => setOpen(o => !o)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors"
        style={{ ...chip, borderColor: sound !== "off" ? "#22d3ee" : undefined, color: sound !== "off" ? "#22d3ee" : chip.color }}>
        {sound === "off" ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        {sound === "off" ? "Sound" : options.find(o => o.key === sound)?.label}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-12 right-0 rounded-2xl overflow-hidden z-50 min-w-[160px] shadow-xl"
            style={{ ...chip, border: "1px solid " + (theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)") }}>
            {options.map(o => (
              <button key={o.key} onClick={() => { setSound(o.key); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-white/10"
                style={{ color: sound === o.key ? "#22d3ee" : (theme === "dark" ? "#e4e4e7" : "#18181b") }}>
                <span>{o.icon}</span>{o.label}
                {sound === o.key && <span className="ml-auto text-cyan-400">✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   VISITOR COUNTER CARD
══════════════════════════════════════════════════════ */
function VisitorCounter({ visitors, total, time, uptime, theme, loading }: {
  visitors: number; total: number; time: Date; uptime: string; theme: Theme; loading: boolean;
}) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => { const id = setInterval(() => setPulse(p => !p), 1000); return () => clearInterval(id); }, []);

  const card = {
    background: theme === "dark" ? "rgba(18,18,22,0.75)" : "rgba(255,255,255,0.75)",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
    color: theme === "dark" ? "#e4e4e7" : "#18181b",
  };
  const muted = theme === "dark" ? "#71717a" : "#6b7280";
  const chip = { background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" };
  const divider = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  // Light mode: vivid gradient for the big number
  const numGrad = theme === "dark"
    ? "linear-gradient(90deg,#fff,#67e8f9,#f9a8d4)"
    : "linear-gradient(90deg,#7c3aed,#db2777,#f59e0b)";
  const totalGrad = theme === "dark"
    ? "linear-gradient(90deg,#fcd34d,#fb923c)"
    : "linear-gradient(90deg,#0ea5e9,#6366f1)";

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: "spring", stiffness: 80 }}
      className="relative p-8 md:p-12 rounded-3xl overflow-hidden backdrop-blur-sm" style={card}>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <motion.div animate={{ scale: pulse ? 1.1 : 1 }} transition={{ duration: 1 }}
            className="p-5 rounded-2xl" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <Users className="w-10 h-10 text-cyan-400" />
          </motion.div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em]" style={{ color: muted }}>Visitors today</p>
            <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: numGrad }}>
              {loading ? <span className="opacity-30">—</span> : <AnimatedNumber value={visitors} />}
            </h2>

          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm border-t pt-6 md:border-t-0 md:border-l md:pl-8 md:pt-0" style={{ borderColor: divider }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={chip}>
            <motion.span animate={{ scale: pulse ? 1.3 : 1 }} className="w-2 h-2 rounded-full bg-green-400" />
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 font-medium">Live</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={chip}>
            <Clock className="w-3.5 h-3.5" style={{ color: muted }} />
            <span style={{ color: muted }}>Updated <span className="font-mono" style={{ color: card.color }}>{time.toLocaleTimeString()}</span></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={chip}>
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span style={{ color: muted }}>Session <span className="font-mono" style={{ color: card.color }}>{uptime}</span></span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: divider }}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em]" style={{ color: muted }}>Total · all time</p>
            <h3 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: totalGrad }}>
              {loading ? <span className="opacity-30">—</span> : <AnimatedNumber value={total} />}
            </h3>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   WORLD CLOCKS
══════════════════════════════════════════════════════ */
const TIMEZONES = [
  { label: "New York", tz: "America/New_York", flag: "🇺🇸", color: "#38bdf8" },
  { label: "London", tz: "Europe/London", flag: "🇬🇧", color: "#a78bfa" },
  { label: "Dubai", tz: "Asia/Dubai", flag: "🇦🇪", color: "#fb923c" },
  { label: "Dhaka", tz: "Asia/Dhaka", flag: "🇧🇩", color: "#4ade80" },
  { label: "Tokyo", tz: "Asia/Tokyo", flag: "🇯🇵", color: "#f472b6" },
  { label: "Sydney", tz: "Australia/Sydney", flag: "🇦🇺", color: "#fbbf24" },
];

function WorldClocks({ time, theme }: { time: Date; theme: Theme }) {
  const card = {
    background: theme === "dark" ? "rgba(18,18,22,0.75)" : "rgba(255,255,255,0.75)",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
    color: theme === "dark" ? "#e4e4e7" : "#18181b",
  };
  const muted = theme === "dark" ? "#71717a" : "#6b7280";

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="p-6 md:p-8 rounded-3xl backdrop-blur-sm" style={card}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <Globe className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="font-semibold text-base">World Clocks</h2>
          <p className="text-xs" style={{ color: muted }}>Live times across key timezones</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TIMEZONES.map(tz => {
          const formatted = time.toLocaleTimeString("en-US", { timeZone: tz.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
          const dateStr = time.toLocaleDateString("en-US", { timeZone: tz.tz, weekday: "short", month: "short", day: "numeric" });
          return (
            <motion.div key={tz.tz} whileHover={{ scale: 1.02 }}
              className="p-4 rounded-2xl"
              style={{ background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: theme === "dark" ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{tz.flag}</span>
                <span className="text-xs font-medium" style={{ color: muted }}>{tz.label}</span>
              </div>
              <p className="font-mono text-xl font-bold" style={{ color: tz.color }}>{formatted}</p>
              <p className="text-xs mt-1" style={{ color: muted }}>{dateStr}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   SHARE CARD GENERATOR
══════════════════════════════════════════════════════ */
function ShareCard({ visitorsToday, totalVisitors, theme }: { visitorsToday: number; totalVisitors: number; theme: Theme }) {
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const card = {
    background: theme === "dark" ? "rgba(18,18,22,0.75)" : "rgba(255,255,255,0.75)",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
    color: theme === "dark" ? "#e4e4e7" : "#18181b",
  };
  const muted = theme === "dark" ? "#71717a" : "#6b7280";

  const generateCard = useCallback(() => {
    setGenerating(true);
    const canvas = canvasRef.current!;
    const W = 1200; const H = 630;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#09090f");
    bgGrad.addColorStop(0.5, "#0f0f1a");
    bgGrad.addColorStop(1, "#09090f");
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

    // Orb 1 — cyan
    const orb1 = ctx.createRadialGradient(250, 200, 0, 250, 200, 350);
    orb1.addColorStop(0, "rgba(6,182,212,0.25)"); orb1.addColorStop(1, "transparent");
    ctx.fillStyle = orb1; ctx.fillRect(0, 0, W, H);

    // Orb 2 — pink
    const orb2 = ctx.createRadialGradient(950, 430, 0, 950, 430, 300);
    orb2.addColorStop(0, "rgba(236,72,153,0.2)"); orb2.addColorStop(1, "transparent");
    ctx.fillStyle = orb2; ctx.fillRect(0, 0, W, H);

    // Orb 3 — violet
    const orb3 = ctx.createRadialGradient(600, 600, 0, 600, 600, 250);
    orb3.addColorStop(0, "rgba(139,92,246,0.15)"); orb3.addColorStop(1, "transparent");
    ctx.fillStyle = orb3; ctx.fillRect(0, 0, W, H);

    // Grid dots
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let x = 40; x < W; x += 40) for (let y = 40; y < H; y += 40) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }

    // Bottom gradient bar
    const bar = ctx.createLinearGradient(0, 0, W, 0);
    bar.addColorStop(0, "#22d3ee"); bar.addColorStop(0.5, "#a78bfa"); bar.addColorStop(1, "#f472b6");
    ctx.fillStyle = bar; ctx.fillRect(0, H - 5, W, 5);

    // Live badge
    ctx.fillStyle = "rgba(34,197,94,0.15)";
    roundRect(ctx, 60, 60, 130, 38, 19);
    ctx.fill();
    ctx.fillStyle = "#4ade80"; ctx.beginPath(); ctx.arc(85, 79, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#4ade80"; ctx.font = "bold 16px monospace"; ctx.fillText("● LIVE", 97, 84);

    // Title
    ctx.font = "bold 52px system-ui,-apple-system,sans-serif";
    const titleGrad = ctx.createLinearGradient(60, 0, 600, 0);
    titleGrad.addColorStop(0, "#ffffff"); titleGrad.addColorStop(0.5, "#67e8f9"); titleGrad.addColorStop(1, "#f9a8d4");
    ctx.fillStyle = titleGrad; ctx.fillText("Analytics Dashboard", 60, 180);

    // Today visitors
    ctx.font = "500 18px system-ui,sans-serif"; ctx.fillStyle = "#71717a"; ctx.fillText("VISITORS TODAY", 60, 260);
    ctx.font = "bold 110px system-ui,sans-serif";
    const numGrad = ctx.createLinearGradient(60, 0, 460, 0);
    numGrad.addColorStop(0, "#67e8f9"); numGrad.addColorStop(1, "#a78bfa");
    ctx.fillStyle = numGrad; ctx.fillText(visitorsToday.toLocaleString(), 60, 380);

    // Total
    ctx.font = "500 18px system-ui,sans-serif"; ctx.fillStyle = "#71717a"; ctx.fillText("ALL-TIME TOTAL", 700, 260);
    ctx.font = "bold 80px system-ui,sans-serif";
    const totalGrad = ctx.createLinearGradient(700, 0, 1100, 0);
    totalGrad.addColorStop(0, "#fcd34d"); totalGrad.addColorStop(1, "#fb923c");
    ctx.fillStyle = totalGrad; ctx.fillText(totalVisitors.toLocaleString(), 700, 370);

    // Date
    const now = new Date();
    ctx.font = "500 22px monospace"; ctx.fillStyle = "#52525b";
    ctx.fillText(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }), 60, 500);

    // Footer
    ctx.font = "16px monospace"; ctx.fillStyle = "#3f3f46";
    ctx.fillText("dashboard.dev · built with passion", 60, 590);

    const url = canvas.toDataURL("image/png");
    setPreviewUrl(url);
    setGenerating(false);
  }, [visitorsToday, totalVisitors]);

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement("a"); a.href = previewUrl;
    a.download = `dashboard-${new Date().toISOString().split("T")[0]}.png`; a.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="p-6 md:p-8 rounded-3xl backdrop-blur-sm" style={card}>
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.2)" }}>
            <Share2 className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="font-semibold text-base">Share Card</h2>
            <p className="text-xs" style={{ color: muted }}>Generate a PNG to share on social media</p>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button onClick={generateCard} disabled={generating}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-black transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6)" }}>
            {generating ? "Generating…" : previewUrl ? "Regenerate" : "Generate PNG"}
          </motion.button>
          {previewUrl && (
            <motion.button onClick={download} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: card.color, border: "1px solid rgba(255,255,255,0.12)" }}>
              <Download className="w-4 h-4" />Download
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {previewUrl && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <img src={previewUrl} alt="Share card preview" className="w-full rounded-2xl" />
            <button onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!previewUrl && (
        <div className="rounded-2xl flex items-center justify-center py-12 text-sm"
          style={{ background: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: theme === "dark" ? "1px dashed rgba(255,255,255,0.1)" : "1px dashed rgba(0,0,0,0.1)", color: muted }}>
          Hit Generate to preview your 1200×630 share card
        </div>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   EASTER EGG
══════════════════════════════════════════════════════ */
function EasterEgg({ theme }: { theme: Theme }) {
  const [clicks, setClicks] = useState(0);
  const [msg, setMsg] = useState("");
  const msgs = ["Found the secret area! 🎉","Keep going... ✨","Persistence: MAX 💪","Official explorer 🗺️","Achievement: Curious Cat 🐱","Error 404: Sanity not found 🤪"];
  const handleClick = () => {
    const n = clicks + 1; setClicks(n);
    if (n % 3 === 0) { setMsg(msgs[Math.floor(Math.random() * msgs.length)]); setTimeout(() => setMsg(""), 3000); }
    if ((window as any).triggerAchievement && n === 10) (window as any).triggerAchievement("Dashboard Explorer!", "🗺️");
  };
  const card = { background: theme === "dark" ? "rgba(18,18,22,0.6)" : "rgba(255,255,255,0.6)", border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" };
  const muted = theme === "dark" ? "#71717a" : "#6b7280";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="p-6 rounded-2xl backdrop-blur-sm text-center" style={card}>
      <p className="text-sm mb-4" style={{ color: muted }}>Psst… click the button a few times 👇</p>
      <motion.button onClick={handleClick} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        className="px-6 py-2.5 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-cyan-400 to-pink-400 hover:from-cyan-300 hover:to-pink-300 transition-all">
        Click Me ({clicks})
      </motion.button>
      <motion.p animate={{ opacity: msg ? 1 : 0 }} className="mt-4 text-sm text-cyan-400 font-medium min-h-[1.5rem]">{msg}</motion.p>
      <p className="text-xs mt-3 font-mono" style={{ color: muted }}>Secret clicks: {clicks} · Try reaching 10! 🎯</p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   ACHIEVEMENT TOAST
══════════════════════════════════════════════════════ */
function AchievementToast() {
  const [list, setList] = useState<Array<{ id: number; text: string; icon: string }>>([]);
  const trigger = useCallback((text: string, icon = "🏆") => {
    const id = Date.now();
    setList(prev => [...prev, { id, text, icon }]);
    setTimeout(() => setList(prev => prev.filter(a => a.id !== id)), 4000);
  }, []);
  useEffect(() => { (window as any).triggerAchievement = trigger; return () => { delete (window as any).triggerAchievement; }; }, [trigger]);
  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none">
      {list.map(a => (
        <motion.div key={a.id} initial={{ opacity: 0, x: 200 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 200 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/90 border border-amber-400/40 backdrop-blur-xl">
          <span className="text-xl">{a.icon}</span>
          <span className="text-sm font-medium text-amber-300">{a.text}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { theme, toggle } = useTheme();
  const { sound, setSound } = useAmbientSound();
  const { today: visitorsToday, total: totalVisitors, loading } = useLiveVisitors();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStart] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const uptimeStr = [Math.floor(elapsed / 3600), Math.floor((elapsed % 3600) / 60), elapsed % 60]
    .map(n => String(n).padStart(2, "0")).join(":");

  const textPrimary = theme === "dark" ? "#f4f4f5" : "#18181b";
  const textMuted = theme === "dark" ? "#71717a" : "#6b7280";
  const chipStyle = { background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)", border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)" };

  return (
    <>
      <InteractiveBackground theme={theme} />
      <CursorTrail theme={theme} />
      <AchievementToast />

      <main className="relative min-h-screen bg-transparent px-6 py-16 md:px-16" style={{ color: textPrimary }}>
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs uppercase tracking-[0.2em]" style={{ ...chipStyle, color: textMuted }}>
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-400" />
                dashboard
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mt-3 bg-clip-text"
                style={{
                  backgroundImage: theme === "dark"
                    ? "linear-gradient(90deg,#fff,#67e8f9,#f9a8d4)"
                    : "linear-gradient(90deg,#7c3aed,#db2777,#f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  display: "inline-block",
                }}>
                Analytics Overview
              </h1>
              <p className="mt-2 max-w-xl text-base" style={{ color: textMuted }}>
                Real-time insights — absolute counts, ambient vibes, worldwide time
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <SoundToggle sound={sound} setSound={setSound} theme={theme} />
              <ThemeToggle theme={theme} toggle={toggle} />
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ ...chipStyle, color: textMuted }}>
                <motion.span animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 rounded-full bg-green-400" />
                LIVE
              </div>
              <time className="font-mono text-sm px-3 py-2 rounded-lg" style={{ ...chipStyle, color: textMuted }}>
                {currentTime.toLocaleTimeString()}
              </time>
            </div>
          </motion.header>

          <VisitorCounter visitors={visitorsToday} total={totalVisitors} time={currentTime} uptime={uptimeStr} theme={theme} loading={loading} />
          <WorldClocks time={currentTime} theme={theme} />
          <ShareCard visitorsToday={visitorsToday} totalVisitors={totalVisitors} theme={theme} />
          <EasterEgg theme={theme} />
        </div>
      </main>
    </>
  );
}
