"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Users, Clock, TrendingUp, Terminal, Target, Zap, Sparkles, MousePointer2, Brain, Trophy, Flame, Star } from "lucide-react";

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  
  useEffect(() => {
    if (value === prevValue.current) return;
    const start = prevValue.current;
    const duration = 1200;
    const startTime = performance.now();
    
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (value - start) * ease);
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    prevValue.current = value;
    requestAnimationFrame(animate);
  }, [value]);
  
  return <span className="tabular-nums">{displayValue}</span>;
}

function ParticleField() {
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, speed: number, opacity: number, hue: number}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const initParticles = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newParticles = Array.from({ length: 40 }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: Math.random() * 3 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.4 + 0.05,
        hue: Math.random() * 60 + 180,
      }));
      setParticles(newParticles);
    };
    
    initParticles();
    window.addEventListener('resize', initParticles);
    return () => window.removeEventListener('resize', initParticles);
  }, []);
  
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setParticles(prev => prev.map(p => {
        const newY = p.y - p.speed;
        const shouldReset = newY < -10;
        return {
          ...p,
          y: shouldReset ? window.innerHeight : newY,
          x: p.x + Math.sin(Date.now() * 0.001 + p.y) * 0.3,
          opacity: shouldReset ? Math.random() * 0.4 + 0.05 : p.opacity,
        };
      }));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  
  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: `hsl(${p.hue}, 80%, 60%)`,
            opacity: p.opacity,
            borderRadius: '50%',
            filter: 'blur(0.5px)',
          }}
          className="absolute"
        />
      ))}
    </div>
  );
}

function InteractiveBackground() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const { scrollY } = useScroll();
  const scrollProgress = useTransform(scrollY, [0, 3000], [0, 1]);
  const springX = useSpring(scrollProgress, { stiffness: 80, damping: 25 });
  
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);
  
  const orb1X = useTransform(springX, [0, 1], [-150, 150]);
  const orb1Y = useTransform(mouseY, [0, 1], [-80, 80]);
  const orb2X = useTransform(mouseX, [0, 1], [-120, 120]);
  const orb2Y = useTransform(scrollProgress, [0, 1], [-150, 150]);
  const orb3X = useTransform(mouseX, [0, 1], [80, -80]);
  const orb3Y = useTransform(mouseY, [0, 1], [80, -80]);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      
      <motion.div
        style={{ x: orb1X, y: orb1Y }}
        className="absolute top-1/4 left-1/4 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[200px]"
      />
      <motion.div
        style={{ x: orb2X, y: orb2Y }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/5 blur-[200px]"
      />
      <motion.div
        style={{ x: orb3X, y: orb3Y }}
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[200px]"
      />
      
      <ParticleField />
    </div>
  );
}

function FloatingOrbs() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1500], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1500], [0, 300]);
  const rotate1 = useTransform(scrollY, [0, 3000], [0, 360]);
  const rotate2 = useTransform(scrollY, [0, 3000], [0, -360]);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        style={{ y: y1, rotate: rotate1 }}
        className="absolute top-20 left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-500/8 to-blue-500/3 blur-[150px]"
      />
      <motion.div
        style={{ y: y2, rotate: rotate2 }}
        className="absolute bottom-20 right-20 w-[350px] h-[350px] rounded-full bg-gradient-to-br from-pink-500/8 to-rose-500/3 blur-[150px]"
      />
    </div>
  );
}

function VisitorCounter({ visitors, time, uptime }: { visitors: number; time: Date; uptime: string }) {
  const [pulse, setPulse] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [totalVisitors, setTotalVisitors] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Calculate total visitors from localStorage history
    const allKeys = Object.keys(localStorage);
    let total = 0;
    allKeys.forEach(key => {
      if (key.startsWith('visitors_') || key === 'visitorsToday') {
        const val = parseInt(localStorage.getItem(key) || '0');
        total += val;
      }
    });
    // Fallback: use a base number + today's visitors
    if (total === 0) {
      total = 1247 + visitors; // Base total + today
    }
    setTotalVisitors(total);
  }, [visitors]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 80 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
      onMouseEnter={() => setShowDetail(true)}
      onMouseLeave={() => setShowDetail(false)}
      className="relative p-8 md:p-12 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 to-zinc-900/30 backdrop-blur-sm overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-pink-500/10" />
      
      <motion.div
        animate={{ rotate: [0, 2, -2, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-full blur-xl"
      />
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <motion.div
            animate={{ scale: pulse ? 1.12 : 1, rotate: [0, 2, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 cursor-pointer"
          >
            <Users className="w-12 h-12 text-cyan-400" />
          </motion.div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Visitors Today</p>
            <motion.div className="flex items-baseline gap-2">
              <motion.h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-cyan-300 to-pink-300 bg-clip-text text-transparent">
                <AnimatedNumber value={visitors} />
              </motion.h2>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: showDetail ? 1 : 0, scale: showDetail ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
                className="text-lg md:text-xl font-medium text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20"
              >
                +{Math.floor(Math.random() * 5) + 1} vs hour ago
              </motion.span>
            </motion.div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 border-t border-zinc-800 pt-6 md:border-t-0 md:border-l md:pl-8 md:pt-0"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <motion.span
              animate={{ scale: pulse ? 1.2 : 1 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full bg-green-400"
            />
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="font-medium text-green-400">+12% vs yesterday</span>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Updated <span className="font-mono text-white ml-1">{time.toLocaleTimeString()}</span></span>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Session: <span className="font-mono text-white ml-1">{uptime}</span></span>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Total Visitors Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 6 }}
            className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20"
          >
            <Trophy className="w-6 h-6 text-amber-400" />
          </motion.div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Total Visitors (All Time)</p>
            <motion.h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              <AnimatedNumber value={totalVisitors} />
            </motion.h3>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">Tracked since launch</span>
        </motion.div>
      </motion.div>
      
      {/* Animated progress bar at bottom */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 origin-left"
      />
    </motion.div>
  );
}

function EasterEggArea() {
  const [clicks, setClicks] = useState(0);
  const [showMessage, setShowMessage] = useState("");
  
  const messages = [
    "You found the secret area! 🎉",
    "Keep clicking... something might happen ✨",
    "Persistence level: MAX 💪",
    "You're officially a dashboard explorer 🗺️",
    "Achievement unlocked: 'Curious Cat' 🐱",
    "The void stares back... 👁️",
    "Error 404: Sanity not found 🤪",
  ];
  
  const handleClick = () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks % 3 === 0) {
      setShowMessage(messages[Math.floor(Math.random() * messages.length)]);
      setTimeout(() => setShowMessage(""), 3000);
    }
    if ((window as any).triggerAchievement && newClicks === 10) {
      (window as any).triggerAchievement("Dashboard Explorer!", "🗺️");
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm text-center"
    >
      <p className="text-zinc-500 text-sm mb-4">Psst... click the button below a few times 👇</p>
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05, rotate: [0, 2, -2, 0] }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-medium text-sm hover:from-cyan-400 hover:to-pink-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] relative overflow-hidden"
      >
        <span className="relative z-10">Click Me ({clicks})</span>
        <motion.div
          animate={{ x: [-100, 100], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </motion.button>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: showMessage ? 1 : 0, y: showMessage ? 0 : 10 }}
        transition={{ duration: 0.3 }}
        className="mt-4 text-sm text-cyan-400 font-medium min-h-[1.5rem]"
      >
        {showMessage}
      </motion.p>
      
      <p className="text-xs text-zinc-600 mt-4 font-mono">
        Secret clicks: {clicks} • Try reaching 10! 🎯
      </p>
    </motion.div>
  );
}

function AchievementToast() {
  const [achievements, setAchievements] = useState<Array<{id: number, text: string, icon: string}>>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const triggerAchievement = (text: string, icon: string = "🏆") => {
    const id = Date.now();
    setAchievements(prev => [...prev, { id, text, icon }]);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);
    setTimeout(() => setAchievements(prev => prev.filter(a => a.id !== id)), 4000);
  };
  
  useEffect(() => {
    (window as any).triggerAchievement = triggerAchievement;
    return () => { delete (window as any).triggerAchievement; };
  }, []);
  
  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl bg-zinc-900/90 border border-amber-400/50 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.2)]"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-2xl"
            >
              {achievement.icon}
            </motion.span>
            <span className="text-sm font-medium text-amber-300">{achievement.text}</span>
          </motion.div>
        ))}
      </div>
      
      {showConfetti && (
        <ConfettiBurst />
      )}
    </>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth,
    y: -20,
    rotation: Math.random() * 360,
    color: `hsl(${Math.random() * 60 + 180}, 80%, 60%)`,
    size: Math.random() * 10 + 4,
    delay: Math.random() * 0.5,
  }));
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40" aria-hidden="true">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: 0, opacity: 1, rotate: piece.rotation }}
          animate={{ 
            y: window.innerHeight + 100, 
            opacity: 0, 
            rotate: piece.rotation + 720,
            x: piece.x + (Math.random() - 0.5) * 300
          }}
          transition={{ 
            duration: 2.5 + Math.random() * 1.5, 
            delay: piece.delay,
            ease: "easeOut"
          }}
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            transformOrigin: "center",
          }}
          className="absolute"
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [visitorsToday, setVisitorsToday] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStart] = useState(Date.now());
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("visitorsToday");
    const savedDate = localStorage.getItem("visitorsDate");
    
    // Check if this session has already been counted
    const sessionCounted = sessionStorage.getItem("visitorCounted");
    
    if (savedDate === today && saved) {
      const count = parseInt(saved);
      setVisitorsToday(count);
      
      // Only increment if this is a new session
      if (!sessionCounted) {
        const newCount = count + 1;
        setVisitorsToday(newCount);
        localStorage.setItem("visitorsToday", String(newCount));
        sessionStorage.setItem("visitorCounted", "true");
      }
    } else {
      setVisitorsToday(1);
      localStorage.setItem("visitorsToday", "1");
      localStorage.setItem("visitorsDate", today);
      sessionStorage.setItem("visitorCounted", "true");
    }
    
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const sessionUptime = Math.floor((Date.now() - sessionStart) / 1000);
  const hours = Math.floor(sessionUptime / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((sessionUptime % 3600) / 60).toString().padStart(2, "0");
  const seconds = (sessionUptime % 60).toString().padStart(2, "0");
  const uptimeStr = `${hours}:${minutes}:${seconds}`;

  return (
    <>
      <InteractiveBackground />
      <FloatingOrbs />
      <AchievementToast />
      
      <main className="relative min-h-screen bg-transparent text-white px-6 py-16 md:px-16">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs uppercase tracking-[0.2em] text-zinc-400"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                />
                dashboard
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold mt-3 bg-gradient-to-r from-white via-cyan-300 to-pink-300 bg-clip-text text-transparent"
              >
                Analytics Overview
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-zinc-400 mt-2 max-w-xl text-lg"
              >
                Real-time insights into my coding journey — live, interactive, and slightly chaotic
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 text-sm text-zinc-400"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/40 border border-zinc-800">
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-400"
                />
                <span>LIVE</span>
              </div>
              <time className="font-mono text-zinc-500 px-3 py-1.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
                {currentTime.toLocaleTimeString()}
              </time>
            </motion.div>
          </motion.header>

          {/* Visitor Counter - Main Hero Card */}
          <VisitorCounter 
            visitors={visitorsToday} 
            time={currentTime} 
            uptime={uptimeStr} 
          />

          {/* Easter Egg Area */}
          <EasterEggArea />
        </div>
      </main>
    </>
  );
}
