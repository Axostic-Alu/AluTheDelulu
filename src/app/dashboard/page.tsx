"use client";

import {
  motion, useScroll, useTransform, useSpring,
  useMotionValue, AnimatePresence, animate, useInView
} from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Users, Clock, TrendingUp, Terminal, Trophy,
  Sun, Moon, Share2, Download, X, Globe
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════ */
type Theme = "dark" | "light";
function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("dashboard_theme") as Theme;
    return saved ?? "dark";
  });
  
  useEffect(() => {
    localStorage.setItem("dashboard_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  
  return { theme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark") };
}

/* ══════════════════════════════════════════════════════
   FIREBASE & ANALYTICS HOOK
══════════════════════════════════════════════════════ */
import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, doc, getDoc, setDoc, increment, 
  onSnapshot, collection, deleteDoc 
} from "firebase/firestore";

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

function useAnalytics() {
  const [today, setToday] = useState(0);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let loadedToday = false;
    let loadedTotal = false;

    const checkDone = () => {
      if (loadedToday && loadedTotal) setLoading(false);
    };

    // Fallback timer: force loading to false after 3s if Firebase is blocked
    const fallbackTimer = setTimeout(() => setLoading(false), 3000);

    // 1. INCREMENT VISITS (Total & Today)
    const trackVisit = async () => {
      try {
        const todayId = getTodayDocId();
        const todayRef = doc(db, "visitors", todayId);
        const totalRef = doc(db, "visitors", "__total__");

        if (sessionStorage.getItem(SESSION_KEY) !== "true") {
          sessionStorage.setItem(SESSION_KEY, "true");
          console.log("🚀 New session detected! Incrementing database...");
          
          const snap = await getDoc(todayRef);
          if (snap.exists()) {
            await setDoc(todayRef, { count: increment(1) }, { merge: true });
          } else {
            await setDoc(todayRef, { count: 1, date: todayId });
          }
          await setDoc(totalRef, { count: increment(1) }, { merge: true });
        } else {
          console.log("ℹ️ View already counted for this session. (Close tab to reset)");
        }
      } catch (e: any) {
        console.error("❌ Failed to increment views:", e.message);
      }
    };
    trackVisit();

    // 2. LISTEN TO LIVE TOTALS
    const u1 = onSnapshot(
      doc(db, "visitors", getTodayDocId()), 
      (s) => { 
        setToday(s.exists() ? s.data().count ?? 0 : 0); 
        loadedToday = true; checkDone(); 
      },
      (error) => {
        console.error("❌ Firebase Error (Today):", error.message);
        loadedToday = true; checkDone();
      }
    );
    
    const u2 = onSnapshot(
      doc(db, "visitors", "__total__"), 
      (s) => { 
        setTotal(s.exists() ? s.data().count ?? 0 : 0); 
        loadedTotal = true; checkDone(); 
      },
      (error) => {
        console.error("❌ Firebase Error (Total):", error.message);
        loadedTotal = true; checkDone();
      }
    );

    // 3. PRESENCE SYSTEM (Live Active Users)
    const sessionId = Math.random().toString(36).substring(2, 15);
    const presenceRef = doc(db, "active_visitors", sessionId);
    
    // Initial heartbeat
    setDoc(presenceRef, { timestamp: Date.now() }).catch(e => 
      console.error("❌ Active presence error:", e.message)
    );
    
    // Ping database every 15 seconds
    const hb = setInterval(() => {
      setDoc(presenceRef, { timestamp: Date.now() }, { merge: true }).catch(() => {});
    }, 15000);

    // Listen to all active users
    const u3 = onSnapshot(
      collection(db, "active_visitors"), 
      (snap) => {
        const now = Date.now();
        let count = 0;
        snap.forEach((d) => {
          if (now - d.data().timestamp < 30000) count++;
        });
        setActive(Math.max(1, count));
      },
      (error) => console.error("❌ Firebase Error (Active):", error.message)
    );

    // Clean up when user closes tab
    const cleanup = () => { deleteDoc(presenceRef).catch(() => {}); };
    window.addEventListener("beforeunload", cleanup);

    return () => {
      clearTimeout(fallbackTimer);
      u1(); u2(); u3();
      clearInterval(hb);
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
    };
  }, []);

  return { today, total, active, loading };
}

/* ══════════════════════════════════════════════════════
   CURSOR TRAIL
══════════════════════════════════════════════════════ */
function CursorTrail({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Array<{ x: number; y: number; age: number; hue: number }>>([]);
  const mouse = useRef({ x: -999, y: -999, active: false });
  const raf = useRef<number>(0);
  const hueRef = useRef(200);
  const velRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      velRef.current.x = e.clientX - velRef.current.prevX;
      velRef.current.y = e.clientY - velRef.current.prevY;
      velRef.current.prevX = e.clientX; velRef.current.prevY = e.clientY;
      mouse.current = { x: e.clientX, y: e.clientY, active: true };
      hueRef.current = (hueRef.current + 1.8) % 360;
      points.current.push({ x: e.clientX, y: e.clientY, age: 0, hue: hueRef.current });
      if (points.current.length > 80) points.current.shift();
    };
    
    const onLeave = () => { mouse.current.active = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const isDark = theme === "dark";
    const MAX_R = isDark ? 28 : 22;

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      points.current = points.current.map(p => ({ ...p, age: p.age + 0.032 })).filter(p => p.age < 1);

      for (let i = 1; i < points.current.length; i++) {
        const p = points.current[i];
        const prev = points.current[i - 1];
        const t = i / points.current.length;
        const life = 1 - p.age;
        const alpha = life * t;
        const r = MAX_R * t * (1 - p.age * 0.5);
        const hue = p.hue;
        const light = isDark ? 70 : 50;

        const g1 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.5);
        g1.addColorStop(0, `hsla(${hue},100%,${light}%,${alpha * 0.35})`);
        g1.addColorStop(0.5, `hsla(${hue},90%,${light - 10}%,${alpha * 0.12})`);
        g1.addColorStop(1, `hsla(${hue},80%,50%,0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = g1; ctx.fill();

        const g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 1.6);
        g2.addColorStop(0, `hsla(${hue},100%,${light + 10}%,${alpha * 0.7})`);
        g2.addColorStop(1, `hsla(${hue},100%,${light}%,0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = g2; ctx.fill();

        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `hsla(${hue},100%,${isDark ? 90 : 70}%,${alpha * 0.95})`;
        ctx.lineWidth = r * 0.28;
        ctx.lineCap = "round";
        ctx.shadowColor = `hsla(${hue},100%,${light}%,${alpha})`;
        ctx.shadowBlur = isDark ? 22 : 14;
        ctx.stroke(); ctx.shadowBlur = 0;
      }

      if (mouse.current.active && points.current.length > 2) {
        const tip = points.current[points.current.length - 1];
        const hue = tip.hue;
        const speed = Math.sqrt(velRef.current.x ** 2 + velRef.current.y ** 2);
        const tipR = MAX_R * 1.8 + Math.min(speed * 0.4, 12);

        const gc = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, tipR * 2);
        gc.addColorStop(0, `hsla(${hue},100%,${isDark ? 85 : 65}%,0.5)`);
        gc.addColorStop(0.4, `hsla(${hue},90%,60%,0.2)`);
        gc.addColorStop(1, `hsla(${hue},80%,50%,0)`);
        ctx.beginPath(); ctx.arc(tip.x, tip.y, tipR * 2, 0, Math.PI * 2);
        ctx.fillStyle = gc; ctx.fill();

        const gcore = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, tipR * 0.5);
        gcore.addColorStop(0, `hsla(${(hue + 40) % 360},100%,98%,0.98)`);
        gcore.addColorStop(0.5, `hsla(${hue},100%,${isDark ? 80 : 60}%,0.8)`);
        gcore.addColorStop(1, `hsla(${hue},100%,60%,0)`);
        ctx.beginPath(); ctx.arc(tip.x, tip.y, tipR * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = gcore; ctx.fill();

        ctx.beginPath(); ctx.arc(tip.x - tipR * 0.15, tip.y - tipR * 0.15, tipR * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };
    
    raf.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999, mixBlendMode: theme === "dark" ? "screen" : "multiply" }}
      aria-hidden="true" />
  );
}

/* ══════════════════════════════════════════════════════
   ANIMATED NUMBER 
══════════════════════════════════════════════════════ */
function AnimatedNumber({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const currentText = node.textContent?.replace(/,/g, "") || "0";
    const startValue = parseInt(currentText, 10);

    const controls = animate(startValue, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate(val) { node.textContent = Math.round(val).toLocaleString(); }
    });
    return () => controls.stop();
  }, [value]);

  return <span ref={nodeRef} className="tabular-nums">{value.toLocaleString()}</span>;
}

/* ══════════════════════════════════════════════════════
   SCROLL REVEAL WRAPPER
══════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 48, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, type: "spring", stiffness: 60, damping: 18 }}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   ANIMATED GRADIENT BORDER CARD
══════════════════════════════════════════════════════ */
function GlowCard({ children, theme, className = "", delay = 0 }: {
  children: React.ReactNode; theme: Theme; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mx = useMotionValue(0.5); 
  const my = useMotionValue(0.5);
  const rotX = useSpring(useTransform(my, [0, 1], [3, -3]), { stiffness: 200, damping: 30 });
  const rotY = useSpring(useTransform(mx, [0, 1], [-3, 3]), { stiffness: 200, damping: 30 });

  const onMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  const backgroundStyle = {
    background: theme === "dark" ? "rgba(14,14,20,0.8)" : "rgba(255,255,255,0.8)",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
  };

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 48, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.75, delay, type: "spring", stiffness: 55, damping: 18 }}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      onMouseMove={onMouse} 
      onMouseLeave={onLeave}
      className={`relative rounded-3xl backdrop-blur-sm overflow-hidden ${className}`}
      {...backgroundStyle as any}>
      <motion.div
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: "linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6,#fbbf24,#22d3ee)",
          backgroundSize: "300% 100%",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          padding: "1px", opacity: 0.45,
        }}
      />
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   PARTICLE FIELD
══════════════════════════════════════════════════════ */
function ParticleField({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{ x: number; y: number; size: number; speed: number; opacity: number; hue: number; wobble: number }>>([]);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);

    const hues = theme === "dark" ? [190, 210, 230, 250, 270] : [270, 320, 30, 180, 45];
    particles.current = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 2.2 + 0.4, speed: Math.random() * 0.35 + 0.08,
      opacity: Math.random() * 0.35 + 0.05, hue: hues[i % 5], wobble: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001;
      particles.current.forEach(p => {
        p.y -= p.speed;
        p.x += Math.sin(t * 0.8 + p.wobble) * 0.35;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        const l = theme === "dark" ? 65 : 55;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, ${l}%, ${p.opacity})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, ${l}%, 0.6)`; ctx.shadowBlur = 6;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ opacity: 0.8 }} />;
}

/* ══════════════════════════════════════════════════════
   INTERACTIVE BACKGROUND
══════════════════════════════════════════════════════ */
function InteractiveBackground({ theme }: { theme: Theme }) {
  const mx = useMotionValue(0.5); 
  const my = useMotionValue(0.5);
  const { scrollY } = useScroll();
  const scrollP = useTransform(scrollY, [0, 3000], [0, 1]);
  const springScroll = useSpring(scrollP, { stiffness: 60, damping: 25 });
  const breathe = useMotionValue(1);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { 
      mx.set(e.clientX / window.innerWidth); 
      my.set(e.clientY / window.innerHeight); 
    };
    window.addEventListener("mousemove", handleMouseMove); 
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mx, my]);

  useEffect(() => {
    let t = 0; let rafId: number;
    const tick = () => { t += 0.008; breathe.set(1 + Math.sin(t) * 0.12); rafId = requestAnimationFrame(tick); };
    rafId = requestAnimationFrame(tick); 
    return () => cancelAnimationFrame(rafId);
  }, [breathe]);

  const smx = useSpring(mx, { stiffness: 40, damping: 20 });
  const smy = useSpring(my, { stiffness: 40, damping: 20 });

  const o1x = useTransform(smx, [0, 1], [-100, 100]);
  const o1y = useTransform(smy, [0, 1], [-80, 80]);
  const o2x = useTransform(smx, [0, 1], [80, -80]);
  const o2y = useTransform(springScroll, [0, 1], [-120, 120]);
  const o3x = useTransform(smy, [0, 1], [-60, 60]);
  const o3y = useTransform(smx, [0, 1], [60, -60]);

  const bg = theme === "dark"
    ? "linear-gradient(135deg,#030308,#080814,#030308)"
    : "linear-gradient(135deg,#fdf4ff,#fff0f6,#f0fdf9,#fffbeb)";

  const orbsDark = [
    { x: o1x, y: o1y, pos: "25% 25%", size: 650, col: "6,182,212", a: 0.07 },
    { x: o2x, y: o2y, pos: "75% 70%", size: 550, col: "236,72,153", a: 0.06 },
    { x: o3x, y: o3y, pos: "50% 45%", size: 480, col: "99,102,241", a: 0.05 },
  ];
  const orbsLight = [
    { x: o1x, y: o1y, pos: "20% 25%", size: 650, col: "168,85,247", a: 0.14 },
    { x: o2x, y: o2y, pos: "78% 65%", size: 550, col: "244,63,94", a: 0.11 },
    { x: o3x, y: o3y, pos: "50% 40%", size: 500, col: "245,158,11", a: 0.10 },
    { x: o1x, y: o3y, pos: "35% 75%", size: 420, col: "20,184,166", a: 0.09 },
  ];
  const orbs = theme === "dark" ? orbsDark : orbsLight;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div style={{ position: "absolute", inset: 0, background: bg }} />
      {orbs.map((o, i) => (
        <motion.div key={i}
          style={{
            x: o.x, y: o.y, scale: breathe, position: "absolute",
            left: o.pos.split(" ")[0], top: o.pos.split(" ")[1],
            width: o.size, height: o.size, background: `rgba(${o.col},${o.a})`,
            filter: "blur(140px)", borderRadius: "50%", transform: "translate(-50%,-50%)",
          }}
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
  return (
    <motion.button onClick={toggle} whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
      aria-label="Toggle theme"
      className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
      style={{
        background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)",
        border: theme === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)",
        color: theme === "dark" ? "#e4e4e7" : "#18181b",
      }}>
      <AnimatePresence mode="wait">
        <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
          {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </motion.div>
      </AnimatePresence>
      {theme === "dark" ? "Dark" : "Light"}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════
   VISITOR COUNTER (NOW WITH LIVE ACTIVE USERS)
══════════════════════════════════════════════════════ */
function VisitorCounter({ visitors, total, activeUsers, time, uptime, theme, loading }: {
  visitors: number; total: number; activeUsers: number; time: Date; uptime: string; theme: Theme; loading: boolean;
}) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => { const id = setInterval(() => setPulse(p => !p), 1200); return () => clearInterval(id); }, []);

  const muted = theme === "dark" ? "#71717a" : "#6b7280";
  const chip = { background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)" };
  const divider = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textCol = theme === "dark" ? "#e4e4e7" : "#18181b";
  const numGrad = theme === "dark" ? "linear-gradient(90deg,#fff,#67e8f9,#f9a8d4)" : "linear-gradient(90deg,#7c3aed,#db2777,#f59e0b)";
  const totalGrad = theme === "dark" ? "linear-gradient(90deg,#fcd34d,#fb923c)" : "linear-gradient(90deg,#0ea5e9,#6366f1)";

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 16 } }
  };

  return (
    <div className="p-8 md:p-12">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div variants={itemVariants} className="flex items-center gap-6">
            <motion.div
              animate={{
                scale: pulse ? 1.14 : 1,
                boxShadow: pulse
                  ? "0 0 32px rgba(6,182,212,0.5), 0 0 64px rgba(6,182,212,0.2)"
                  : "0 0 12px rgba(6,182,212,0.2)",
                rotate: [0, 2, -2, 0],
              }}
              transition={{ scale: { duration: 1.2, ease: "easeInOut" }, rotate: { duration: 5, repeat: Infinity } }}
              className="p-5 rounded-2xl flex-shrink-0"
              style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)" }}>
              <Users className="w-10 h-10 text-cyan-400" />
            </motion.div>
            <div>
              <motion.p variants={itemVariants} className="text-xs uppercase tracking-[0.18em]" style={{ color: muted }}>
                Visitors today
              </motion.p>
              <motion.h2 variants={itemVariants}
                className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent leading-none"
                style={{ backgroundImage: numGrad }}>
                {loading
                  ? <motion.span animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 1.5, repeat: Infinity }}>—</motion.span>
                  : <AnimatedNumber value={visitors} />}
              </motion.h2>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}
            className="flex flex-wrap items-center gap-3 text-sm border-t pt-6 md:border-t-0 md:border-l md:pl-8 md:pt-0"
            style={{ borderColor: divider }}>
            {[
              { 
                icon: <><motion.span animate={{ scale: pulse ? 1.4 : 1 }} className="w-2 h-2 rounded-full bg-green-400 inline-block" /><TrendingUp className="w-3.5 h-3.5 text-green-400" /></>, 
                label: <span className="text-green-400 font-medium">{activeUsers} Active Now</span> 
              },
              { icon: <Clock className="w-3.5 h-3.5" style={{ color: muted }} />, label: <span style={{ color: muted }}>Updated <span className="font-mono" style={{ color: textCol }}>{time.toLocaleTimeString()}</span></span> },
              { icon: <Terminal className="w-3.5 h-3.5 text-blue-400" />, label: <span style={{ color: muted }}>Session <span className="font-mono" style={{ color: textCol }}>{uptime}</span></span> },
            ].map((c, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05, y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-default" style={chip}>
                {c.icon}{c.label}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={itemVariants}
          className="mt-8 pt-8 border-t flex items-center gap-4"
          style={{ borderColor: divider }}>
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="p-3 rounded-xl flex-shrink-0"
            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}>
            <Trophy className="w-6 h-6 text-amber-400" />
          </motion.div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: muted }}>Total · all time</p>
            <h3 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: totalGrad }}>
              {loading
                ? <motion.span animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 1.5, repeat: Infinity }}>—</motion.span>
                : <AnimatedNumber value={total} />}
            </h3>
          </div>
        </motion.div>
      </motion.div>
    </div>
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
  const muted = theme === "dark" ? "#71717a" : "#6b7280";
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 8, repeat: Infinity }}
          className="p-2.5 rounded-xl" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <Globe className="w-5 h-5 text-indigo-400" />
        </motion.div>
        <div>
          <h2 className="font-semibold text-base" style={{ color: theme === "dark" ? "#e4e4e7" : "#18181b" }}>World Clocks</h2>
          <p className="text-xs" style={{ color: muted }}>Live times across key timezones</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TIMEZONES.map((tz, i) => (
          <motion.div key={tz.tz}
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 120, damping: 18 }}
            whileHover={{ scale: 1.04, y: -3, boxShadow: `0 8px 32px ${tz.color}22` }}
            className="p-4 rounded-2xl transition-shadow"
            style={{ background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: theme === "dark" ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{tz.flag}</span>
              <span className="text-xs font-medium" style={{ color: muted }}>{tz.label}</span>
            </div>
            <p className="font-mono text-xl font-bold" style={{ color: tz.color }}>
              {time.toLocaleTimeString("en-US", { timeZone: tz.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </p>
            <p className="text-xs mt-1" style={{ color: muted }}>
              {time.toLocaleDateString("en-US", { timeZone: tz.tz, weekday: "short", month: "short", day: "numeric" })}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SHARE CARD
══════════════════════════════════════════════════════ */
function ShareCard({ visitorsToday, totalVisitors, theme }: { visitorsToday: number; totalVisitors: number; theme: Theme }) {
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const muted = theme === "dark" ? "#71717a" : "#6b7280";
  const textCol = theme === "dark" ? "#e4e4e7" : "#18181b";

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
  }

  const generateCard = useCallback(() => {
    setGenerating(true);
    const canvas = canvasRef.current!;
    const W = 1200; const H = 630; canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#07071a"); bg.addColorStop(0.5, "#0e0e28"); bg.addColorStop(1, "#07071a");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    [[250, 200, "6,182,212", 0.28], [950, 430, "236,72,153", 0.22], [600, 580, "139,92,246", 0.18]].forEach(([x, y, col, a]) => {
      const g = ctx.createRadialGradient(+x, +y, 0, +x, +y, 350);
      g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    for (let x = 40; x < W; x += 40) for (let y = 40; y < H; y += 40) { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill(); }
    const bar = ctx.createLinearGradient(0, 0, W, 0);
    bar.addColorStop(0, "#22d3ee"); bar.addColorStop(0.5, "#a78bfa"); bar.addColorStop(1, "#f472b6");
    ctx.fillStyle = bar; ctx.fillRect(0, H - 5, W, 5);
    roundRect(ctx, 60, 55, 145, 40, 20); ctx.fillStyle = "rgba(34,197,94,0.15)"; ctx.fill();
    ctx.fillStyle = "#4ade80"; ctx.font = "bold 16px monospace"; ctx.fillText("● LIVE", 82, 80);
    ctx.font = "bold 54px system-ui,sans-serif";
    const tg = ctx.createLinearGradient(60, 0, 700, 0);
    tg.addColorStop(0, "#fff"); tg.addColorStop(0.5, "#67e8f9"); tg.addColorStop(1, "#f9a8d4");
    ctx.fillStyle = tg; ctx.fillText("Analytics Dashboard", 60, 178);
    ctx.font = "500 18px system-ui"; ctx.fillStyle = "#52525b"; ctx.fillText("VISITORS TODAY", 60, 258);
    ctx.font = "bold 118px system-ui";
    const ng = ctx.createLinearGradient(60, 0, 500, 0); ng.addColorStop(0, "#67e8f9"); ng.addColorStop(1, "#a78bfa");
    ctx.fillStyle = ng; ctx.fillText(visitorsToday.toLocaleString(), 60, 385);
    ctx.font = "500 18px system-ui"; ctx.fillStyle = "#52525b"; ctx.fillText("ALL-TIME TOTAL", 700, 258);
    ctx.font = "bold 82px system-ui";
    const ag = ctx.createLinearGradient(700, 0, 1150, 0); ag.addColorStop(0, "#fcd34d"); ag.addColorStop(1, "#fb923c");
    ctx.fillStyle = ag; ctx.fillText(totalVisitors.toLocaleString(), 700, 375);
    ctx.font = "500 22px monospace"; ctx.fillStyle = "#3f3f46";
    ctx.fillText(new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }), 60, 500);
    ctx.font = "16px monospace"; ctx.fillStyle = "#27272a"; ctx.fillText("dashboard.dev · built with passion", 60, 590);
    setPreviewUrl(canvas.toDataURL("image/png")); setGenerating(false);
  }, [visitorsToday, totalVisitors]);

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement("a"); a.href = previewUrl;
    a.download = `dashboard-${new Date().toISOString().split("T")[0]}.png`; a.click();
  };

  return (
    <div className="p-6 md:p-8">
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}
            className="p-2.5 rounded-xl" style={{ background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.2)" }}>
            <Share2 className="w-5 h-5 text-pink-400" />
          </motion.div>
          <div>
            <h2 className="font-semibold text-base" style={{ color: textCol }}>Share Card</h2>
            <p className="text-xs" style={{ color: muted }}>Generate a PNG to share on social media</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button onClick={generateCard} disabled={generating}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-black disabled:opacity-50"
            style={{ background: "linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6)" }}>
            {generating ? "Generating…" : previewUrl ? "Regenerate" : "Generate PNG"}
          </motion.button>
          <AnimatePresence>
            {previewUrl && (
              <motion.button onClick={download} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.08)", color: textCol, border: "1px solid rgba(255,255,255,0.12)" }}>
                <Download className="w-4 h-4" />Download
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="relative rounded-2xl overflow-hidden"
            style={{ border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}>
            <img src={previewUrl} alt="Share card preview" className="w-full rounded-2xl" />
            <motion.button onClick={() => setPreviewUrl(null)} whileHover={{ scale: 1.1 }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl flex items-center justify-center py-12 text-sm"
            style={{ background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)", border: theme === "dark" ? "1px dashed rgba(255,255,255,0.1)" : "1px dashed rgba(0,0,0,0.1)", color: muted }}>
            Hit Generate to preview your 1200×630 share card
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   EASTER EGG
══════════════════════════════════════════════════════ */
function EasterEgg({ theme }: { theme: Theme }) {
  const [clicks, setClicks] = useState(0);
  const [msg, setMsg] = useState("");
  const [burst, setBurst] = useState(false);
  const msgs = ["Found the secret! 🎉","Keep going... ✨","Persistence: MAX 💪","Official explorer 🗺️","Curious Cat mode 🐱","Error 404: Sanity 🤪"];
  const handleClick = () => {
    const n = clicks + 1; setClicks(n);
    if (n % 3 === 0) { setMsg(msgs[Math.floor(Math.random() * msgs.length)]); setTimeout(() => setMsg(""), 3000); }
    if (n % 5 === 0) { setBurst(true); setTimeout(() => setBurst(false), 700); }
    if ((window as any).triggerAchievement && n === 10) (window as any).triggerAchievement("Dashboard Explorer!", "🗺️");
  };
  const muted = theme === "dark" ? "#71717a" : "#6b7280";
  return (
    <div className="p-6 text-center">
      <p className="text-sm mb-4" style={{ color: muted }}>Psst… click a few times 👇</p>
      <motion.button onClick={handleClick}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
        animate={burst ? { scale: [1, 1.3, 0.9, 1.1, 1], rotate: [0, -6, 6, -3, 0] } : {}}
        className="relative px-7 py-3 rounded-xl font-medium text-sm text-black overflow-hidden"
        style={{ background: "linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6)" }}>
        <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <span className="relative z-10">Click Me ({clicks})</span>
      </motion.button>
      <AnimatePresence>
        {msg && (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mt-4 text-sm text-cyan-400 font-medium">{msg}</motion.p>
        )}
      </AnimatePresence>
      <p className="text-xs mt-4 font-mono" style={{ color: muted }}>Secret clicks: {clicks} · Try reaching 10! 🎯</p>
    </div>
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
      <AnimatePresence>
        {list.map(a => (
          <motion.div key={a.id}
            initial={{ opacity: 0, x: 120, scale: 0.85 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 120, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl"
            style={{ background: "rgba(9,9,11,0.92)", border: "1px solid rgba(245,158,11,0.35)", boxShadow: "0 0 32px rgba(245,158,11,0.15)" }}>
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.6, repeat: 2 }} className="text-xl">{a.icon}</motion.span>
            <span className="text-sm font-medium text-amber-300">{a.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { theme, toggle } = useTheme();
  const { today, total, active, loading } = useAnalytics();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStart] = useState(Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const uptimeStr = [Math.floor(elapsed / 3600), Math.floor((elapsed % 3600) / 60), elapsed % 60]
    .map(n => String(n).padStart(2, "0")).join(":");

  const textPrimary = theme === "dark" ? "#f4f4f5" : "#18181b";
  const textMuted = theme === "dark" ? "#71717a" : "#6b7280";
  const chipStyle = {
    background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.09)",
  };

  if (!mounted) return null;

  return (
    <>
      <InteractiveBackground theme={theme} />
      <CursorTrail theme={theme} />
      <AchievementToast />

      <main className="relative min-h-screen bg-transparent px-6 py-16 md:px-16" style={{ color: textPrimary }}>
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.header
            initial={{ opacity: 0, y: -28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 70, damping: 18 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.span
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs uppercase tracking-[0.22em]"
                style={{ ...chipStyle, color: textMuted }}>
                <motion.span animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-400" />
                dashboard
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, type: "spring", stiffness: 80 }}
                className="text-4xl md:text-6xl font-bold mt-3 bg-clip-text"
                style={{
                  backgroundImage: theme === "dark"
                    ? "linear-gradient(90deg,#fff,#67e8f9,#f9a8d4)"
                    : "linear-gradient(90deg,#7c3aed,#db2777,#f59e0b)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  color: "transparent", display: "inline-block",
                }}>
                Analytics Overview
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="mt-2 max-w-xl text-base" style={{ color: textMuted }}>
                Real-time insights — absolute counts, ambient vibes, worldwide time
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-3">
              <ThemeToggle theme={theme} toggle={toggle} />
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ ...chipStyle, color: textMuted }}>
                <motion.span animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }} className="w-2 h-2 rounded-full bg-green-400" />
                LIVE
              </div>
              <motion.time className="font-mono text-sm px-3 py-2 rounded-lg"
                style={{ ...chipStyle, color: textMuted }}
                animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                {currentTime.toLocaleTimeString()}
              </motion.time>
            </motion.div>
          </motion.header>

          <GlowCard theme={theme} delay={0.1}>
            <VisitorCounter visitors={today} total={total} activeUsers={active}
              time={currentTime} uptime={uptimeStr} theme={theme} loading={loading} />
          </GlowCard>

          <GlowCard theme={theme} delay={0.2}>
            <WorldClocks time={currentTime} theme={theme} />
          </GlowCard>

          <GlowCard theme={theme} delay={0.3}>
            <ShareCard visitorsToday={today} totalVisitors={total} theme={theme} />
          </GlowCard>

          <Reveal delay={0.1}>
            <div className="rounded-3xl backdrop-blur-sm"
              style={{
                background: theme === "dark" ? "rgba(14,14,20,0.7)" : "rgba(255,255,255,0.7)",
                border: theme === "dark" ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
              }}>
              <EasterEgg theme={theme} />
            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}
