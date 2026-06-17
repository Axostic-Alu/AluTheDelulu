"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { projects, savingLogFeatures, type Project } from "@/data/projects";

const categoryLabels: Record<Project["category"], string> = {
  web: "Web",
  mobile: "Mobile",
  tool: "Tool",
  experiment: "Experiment",
};

const categoryColors: Record<Project["category"], string> = {
  web: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  mobile: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  tool: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  experiment: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const statusColors: Record<Project["status"], string> = {
  live: "bg-green-500/10 text-green-400 border-green-500/20",
  "in-progress": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

// ─── Interactive 3D Tilt Hook ──────────────────────────────────────────

function useTilt(ref: React.RefObject<HTMLElement | null>) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      setTilt({ x: dy * -8, y: dx * 8 });
    };

    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref]);

  return tilt;
}

// ─── Mouse Glow Follower ───────────────────────────────────────────────

function MouseGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 hidden lg:block"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(96,165,250,0.04), transparent 40%)`,
      }}
    />
  );
}

// ─── Scroll-Reveal Wrapper ─────────────────────────────────────────────

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Rich Animated Background ─────────────────────────────────────────

function StarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    type Star   = { x: number; y: number; size: number; baseAlpha: number; twinkleSpeed: number; phase: number; hue: number };
    type Shoot  = { x: number; y: number; len: number; speed: number; angle: number; alpha: number; active: boolean };
    type Aurora = { y: number; hue: number; speed: number; phase: number; amp: number };
    type Nebula = { x: number; y: number; r: number; hue: number; alpha: number; drift: number; phase: number };

    let starsNear: Star[] = [], starsMid: Star[] = [], starsFar: Star[] = [];
    let shooters: Shoot[] = [];
    let auroras: Aurora[] = [];
    let nebulas: Nebula[] = [];

    function makeShooter(): Shoot {
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height * 0.45,
        len: Math.random() * 180 + 80,
        speed: Math.random() * 14 + 8,
        angle: (Math.random() * 30 + 15) * (Math.PI / 180),
        alpha: 0,
        active: false,
      };
    }

    const makeStars = (count: number, minSz: number, maxSz: number, aLo: number, aHi: number): Star[] =>
      Array.from({ length: count }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size: Math.random() * (maxSz - minSz) + minSz,
        baseAlpha: Math.random() * (aHi - aLo) + aLo,
        twinkleSpeed: Math.random() * 0.9 + 0.2,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.88 ? (Math.random() > 0.5 ? 200 : 280) : 0,
      }));

    const init = () => {
      const W = canvas!.width, H = canvas!.height;
      const total = Math.min(Math.floor((W * H) / 5000), 320);
      starsFar  = makeStars(Math.floor(total * 0.55), 0.2, 0.8,  0.12, 0.4);
      starsMid  = makeStars(Math.floor(total * 0.32), 0.6, 1.4,  0.3,  0.65);
      starsNear = makeStars(Math.floor(total * 0.13), 1.2, 2.6,  0.55, 0.95);
      shooters  = Array.from({ length: 6 }, makeShooter);
      auroras = [
        { y: H * 0.13, hue: 190, speed: 0.00042, phase: 0,   amp: H * 0.046 },
        { y: H * 0.24, hue: 265, speed: 0.00031, phase: 2.1, amp: H * 0.036 },
        { y: H * 0.36, hue: 320, speed: 0.00055, phase: 4.2, amp: H * 0.028 },
      ];
      nebulas = Array.from({ length: 5 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 280 + 120,
        hue: ([220, 260, 180, 300, 200] as number[])[Math.floor(Math.random() * 5)],
        alpha: Math.random() * 0.026 + 0.007,
        drift: (Math.random() - 0.5) * 0.014,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
      init();
    };

    const drawStarLayer = (stars: Star[], t: number) => {
      for (const s of stars) {
        const twinkle = Math.sin(t * s.twinkleSpeed + s.phase) * 0.5 + 0.5;
        const a = twinkle * s.baseAlpha;
        const colored = s.hue !== 0;

        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx!.fillStyle = colored ? `hsla(${s.hue},80%,82%,${a})` : `rgba(255,255,255,${a})`;
        ctx!.fill();

        if (s.size > 1.0 && a > 0.38) {
          const g = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 5.5);
          const base = colored ? `hsla(${s.hue},85%,72%,` : `rgba(180,210,255,`;
          g.addColorStop(0, `${base}${a * 0.55})`);
          g.addColorStop(1, `${base}0)`);
          ctx!.beginPath(); ctx!.arc(s.x, s.y, s.size * 5.5, 0, Math.PI * 2);
          ctx!.fillStyle = g; ctx!.fill();
        }

        if (s.size > 1.9 && a > 0.72) {
          ctx!.strokeStyle = `rgba(255,255,255,${a * 0.32})`;
          ctx!.lineWidth = 0.6;
          const arm = s.size * 4.5;
          ctx!.beginPath(); ctx!.moveTo(s.x - arm, s.y); ctx!.lineTo(s.x + arm, s.y); ctx!.stroke();
          ctx!.beginPath(); ctx!.moveTo(s.x, s.y - arm); ctx!.lineTo(s.x, s.y + arm); ctx!.stroke();
        }
      }
    };

    const drawAuroras = (t: number) => {
      const W = canvas!.width;
      for (const a of auroras) {
        for (let layer = 0; layer < 3; layer++) {
          const fade = Math.sin(t * 0.28 + a.phase + layer) * 0.38 + 0.62;
          const layerAlpha = (0.024 - layer * 0.007) * fade;
          const layerH = a.amp * (1 - layer * 0.28);
          const pts = 64; const step = W / pts;

          ctx!.beginPath();
          for (let i = 0; i <= pts; i++) {
            const x = i * step;
            const w1 = Math.sin(x * 0.0028 + t * a.speed * 1000 + a.phase) * layerH;
            const w2 = Math.sin(x * 0.0068 + t * a.speed * 600  + a.phase * 1.4) * layerH * 0.45;
            const y  = a.y + w1 + w2;
            i === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
          }
          ctx!.lineTo(W, a.y + layerH * 4);
          ctx!.lineTo(0,  a.y + layerH * 4);
          ctx!.closePath();

          const grad = ctx!.createLinearGradient(0, a.y - layerH, 0, a.y + layerH * 4);
          grad.addColorStop(0,    `hsla(${a.hue},88%,66%,0)`);
          grad.addColorStop(0.28, `hsla(${a.hue},88%,66%,${layerAlpha})`);
          grad.addColorStop(0.65, `hsla(${a.hue + 28},75%,56%,${layerAlpha * 0.55})`);
          grad.addColorStop(1,    `hsla(${a.hue},82%,60%,0)`);
          ctx!.fillStyle = grad; ctx!.fill();
        }
      }
    };

    const drawNebulas = (t: number) => {
      for (const n of nebulas) {
        n.x += n.drift;
        if (n.x > canvas!.width  + n.r) n.x = -n.r;
        if (n.x < -n.r) n.x = canvas!.width + n.r;
        const pulse = Math.sin(t * 0.13 + n.phase) * 0.28 + 0.72;
        const g = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0,   `hsla(${n.hue},72%,56%,${n.alpha * pulse})`);
        g.addColorStop(0.5, `hsla(${n.hue + 18},62%,46%,${n.alpha * pulse * 0.45})`);
        g.addColorStop(1,   `hsla(${n.hue},60%,42%,0)`);
        ctx!.beginPath(); ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fillStyle = g; ctx!.fill();
      }
    };

    const drawShooters = () => {
      for (const s of shooters) {
        if (!s.active) {
          if (Math.random() < 0.0025) {
            s.active = true;
            s.x = Math.random() * canvas!.width;
            s.y = Math.random() * canvas!.height * 0.4;
            s.alpha = 1;
          }
          continue;
        }
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.013;
        if (s.alpha <= 0 || s.x > canvas!.width + 60 || s.y > canvas!.height + 60) {
          Object.assign(s, makeShooter()); continue;
        }
        const tx = s.x - Math.cos(s.angle) * s.len;
        const ty = s.y - Math.sin(s.angle) * s.len;
        const grad = ctx!.createLinearGradient(tx, ty, s.x, s.y);
        grad.addColorStop(0,   `rgba(255,255,255,0)`);
        grad.addColorStop(0.7, `rgba(180,225,255,${s.alpha * 0.38})`);
        grad.addColorStop(1,   `rgba(255,255,255,${s.alpha})`);
        ctx!.beginPath(); ctx!.moveTo(tx, ty); ctx!.lineTo(s.x, s.y);
        ctx!.strokeStyle = grad; ctx!.lineWidth = 1.6; ctx!.stroke();

        const tg = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, 7);
        tg.addColorStop(0, `rgba(255,255,255,${s.alpha * 0.92})`);
        tg.addColorStop(1, `rgba(180,220,255,0)`);
        ctx!.beginPath(); ctx!.arc(s.x, s.y, 7, 0, Math.PI * 2);
        ctx!.fillStyle = tg; ctx!.fill();
      }
    };

    const animate = (time: number) => {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const t = time * 0.001;
      drawNebulas(t);
      drawAuroras(t);
      drawStarLayer(starsFar, t);
      drawStarLayer(starsMid, t);
      drawStarLayer(starsNear, t);
      drawShooters();
      animId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Project["category"] | "all">("all");
  const [expandedProject, setExpandedProject] = useState<Project | null>(null);
  const [showSavingLogFeatures, setShowSavingLogFeatures] = useState(false);

  const filteredProjects = selectedCategory === "all"
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  const categories: (Project["category"] | "all")[] = ["all", "web", "mobile", "tool", "experiment"];

  return (
    <>
      <StarsBackground />
      <div className="fixed inset-0 -z-20 bg-black" aria-hidden="true" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(96,165,250,0.04),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(167,139,250,0.02),_transparent_50%)]" aria-hidden="true" />

      <main className="min-h-screen text-white px-6 py-24 md:px-16 relative">
      <MouseGlow />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-[0.2em] mb-4 bg-zinc-900 border border-zinc-800 text-zinc-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Portfolio
          </motion.span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 text-white">
            Projects
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            A collection of things I've built, broken, and learned from. Each project represents a problem I wanted to solve or a technology I wanted to explore.
          </p>
        </motion.header>

        {/* Category Filter */}
        <ScrollReveal>
          <div className="mb-12 flex flex-wrap gap-1.5 bg-zinc-900/40 p-1 rounded-xl border border-zinc-800/60 w-fit backdrop-blur-md">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors duration-300 ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-zinc-800/80 border border-zinc-700/40 rounded-lg shadow-md"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">
                    {cat === "all" ? "All Projects" : categoryLabels[cat]}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Project Grid */}
        <motion.div
          layout="position"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <ScrollReveal key={project.id} delay={index * 0.05}>
                <motion.div
                  layout="position"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="h-full"
                >
                  {project.slug === "saving-log" ? (
                    <SavingLogCard
                      project={project}
                      showFeatures={showSavingLogFeatures}
                      onToggleFeatures={() => setShowSavingLogFeatures(!showSavingLogFeatures)}
                      onExpand={() => setExpandedProject(project)}
                    />
                  ) : (
                    <ProjectCard
                      project={project}
                      onExpand={() => setExpandedProject(project)}
                    />
                  )}
                </motion.div>
              </ScrollReveal>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-zinc-800/60 rounded-2xl"
          >
            <p className="text-zinc-500 text-sm">No projects in this category.</p>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {expandedProject && (
          <ExpandedProjectModal
            project={expandedProject}
            onClose={() => setExpandedProject(null)}
          />
        )}
      </AnimatePresence>
    </main>
    </>
  );
}

// ─── Standard Card with 3D Tilt ────────────────────────────────────────

function ProjectCard({ project, onExpand }: { project: Project; onExpand: () => void }) {
  const cardRef = useRef<HTMLElement>(null);
  const tilt = useTilt(cardRef);

  return (
    <motion.article
      ref={cardRef}
      layoutId={`card-container-${project.id}`}
      onClick={onExpand}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ perspective: "800px", transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      className="group relative p-6 h-full rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-sm hover:bg-zinc-900/30 hover:border-zinc-700 transition-colors duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${categoryColors[project.category]}`}>
            {categoryLabels[project.category]}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>

        <motion.h3 layoutId={`card-title-${project.id}`} className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {project.title}
        </motion.h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">{project.shortDescription}</p>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50 mt-auto">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 bg-zinc-900/60 border border-zinc-800 hover:text-white transition-colors"
            onClick={e => e.stopPropagation()}
          >
            GitHub
          </a>
        )}
        <span className="ml-auto text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors flex items-center gap-1">
          Explore <span className="transform group-hover:translate-x-0.5 transition-transform duration-200">→</span>
        </span>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-teal-500/5 blur-2xl" />
      </div>
    </motion.article>
  );
}

// ─── Deep Dive Button ──────────────────────────────────────────────────

function DeepDiveButton({ onClick }: { onClick: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState("Deep Dive");
  const [angle, setAngle] = useState(0);
  const rafRef = useRef<number>(0);
  const typeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const FULL_TEXT = "Deep Dive";

  // ── Rotating border angle ──
  useEffect(() => {
    if (!hovered) return;
    const tick = () => { setAngle(a => (a + 1.8) % 360); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hovered]);

  // ── Typewriter on hover ──
  useEffect(() => {
    if (typeRef.current) clearTimeout(typeRef.current);
    if (hovered) {
      // erase then retype
      let i = FULL_TEXT.length;
      const erase = () => {
        if (i > 0) { i--; setTypedText(FULL_TEXT.slice(0, i)); typeRef.current = setTimeout(erase, 40); }
        else { i = 0; const retype = () => { if (i <= FULL_TEXT.length) { setTypedText(FULL_TEXT.slice(0, i)); i++; typeRef.current = setTimeout(retype, 55); } }; retype(); }
      };
      typeRef.current = setTimeout(erase, 80);
    } else {
      setTypedText(FULL_TEXT);
    }
    return () => { if (typeRef.current) clearTimeout(typeRef.current); };
  }, [hovered]);

  // ── Magnetic pull ──
  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    setPos({ x: dx * 0.28, y: dy * 0.28 });
  };

  const onMouseLeave = () => {
    setHovered(false);
    setPos({ x: 0, y: 0 });
  };

  const gradient = `conic-gradient(from ${angle}deg, #22d3ee, #a78bfa, #f472b6, #fbbf24, #22d3ee)`;

  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      animate={{ x: pos.x, y: pos.y, borderRadius: hovered ? "999px" : "12px" }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
      className="relative ml-auto flex items-center gap-1.5 px-4 py-2 text-xs font-semibold overflow-hidden"
      style={{ background: "transparent" }}
    >
      {/* Rotating conic gradient border */}
      <motion.span
        aria-hidden="true"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{ padding: "1.5px", background: gradient, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}
      />

      {/* Static border when not hovered */}
      <motion.span
        aria-hidden="true"
        animate={{ opacity: hovered ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 rounded-[inherit] pointer-events-none border border-zinc-700/60"
      />

      {/* Inner bg */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-[1.5px] rounded-[inherit] pointer-events-none transition-colors duration-300"
        style={{ background: hovered ? "rgba(20,20,28,0.95)" : "rgba(24,24,27,0.5)" }}
      />

      {/* Shimmer sweep */}
      {hovered && (
        <motion.span
          aria-hidden="true"
          initial={{ x: "-120%" }}
          animate={{ x: "220%" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)" }}
        />
      )}

      {/* Text */}
      <motion.span
        className="relative z-10 font-mono tracking-wide"
        animate={{ color: hovered ? "#e2e8f0" : "#71717a" }}
        transition={{ duration: 0.2 }}
      >
        {typedText}
        {hovered && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="ml-0.5 inline-block w-[1px] h-[10px] bg-cyan-400 align-middle"
          />
        )}
      </motion.span>

      {/* Arrow icon */}
      <motion.span
        className="relative z-10"
        animate={{
          x: hovered ? 3 : 0,
          opacity: hovered ? 1 : 0.4,
          color: hovered ? "#22d3ee" : "#71717a",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      >
        →
      </motion.span>
    </motion.button>
  );
}

// ─── Saving Log Card with 3D Tilt ──────────────────────────────────────

function SavingLogCard({
  project,
  showFeatures,
  onToggleFeatures,
  onExpand,
}: {
  project: Project;
  showFeatures: boolean;
  onToggleFeatures: () => void;
  onExpand: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const tilt = useTilt(cardRef);

  return (
    <motion.article
      ref={cardRef}
      layoutId={`card-container-${project.id}`}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ perspective: "800px", transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      className="group relative p-6 h-full rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-sm hover:border-zinc-700 transition-colors duration-300 flex flex-col overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rotate-45 translate-x-8 translate-y-[-10px] shadow-lg" />
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            Mobile
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            Active
          </span>
        </div>
      </div>

      <motion.h3 layoutId={`card-title-${project.id}`} className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        {project.title}
        <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800/50">v1.0</span>
      </motion.h3>
      <p className="text-zinc-400 text-sm leading-relaxed mb-4">{project.shortDescription}</p>

      <div className="flex items-center gap-2 mb-6">
        <a
          href="https://drive.google.com/file/d/1lSremHUZhWMKUSmZZYNj0IkCmMOCpkyk/view?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-zinc-800 to-zinc-700 hover:brightness-110 transition-all border border-zinc-700/60"
        >
          Get Android APK
        </a>
        <DeepDiveButton onClick={onExpand} />
      </div>

      <div className="border-t border-zinc-800/50 pt-4 mt-auto">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFeatures(); }}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
            {showFeatures ? "Collapse" : "Quick View Features"}
          </span>
          <motion.svg
            animate={{ rotate: showFeatures ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-3 h-3 text-zinc-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>

        <AnimatePresence initial={false}>
          {showFeatures && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2">
                {savingLogFeatures.slice(0, 2).map((feature) => (
                  <div key={feature.title} className="p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/40">
                    <p className="text-xs font-medium text-zinc-300">{feature.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{feature.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 blur-2xl" />
      </div>
    </motion.article>
  );
}

// ─── Expanded Modal ────────────────────────────────────────────────────

function ExpandedProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const isSavingLog = project.slug === "saving-log";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-md transform-gpu">
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      <motion.div
        layoutId={`card-container-${project.id}`}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-zinc-800/80 p-6 md:p-8 shadow-2xl overflow-x-hidden"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${categoryColors[project.category]}`}>
                  {categoryLabels[project.category]}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${statusColors[project.status]}`}>
                  {project.status}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                {project.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Overview</h3>
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                {project.fullDescription || project.shortDescription}
              </p>
            </div>

            {isSavingLog ? (
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savingLogFeatures.map((feature) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{feature.icon}</span>
                        <h4 className="text-xs font-bold text-zinc-200">{feature.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              project.highlights && project.highlights.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Highlights</h3>
                  <div className="space-y-2">
                    {project.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/20 border border-zinc-900/60">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        <span className="text-sm text-zinc-300 leading-normal">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {project.techStack && project.techStack.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-900/60 border border-zinc-800 text-zinc-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-zinc-900">
              {isSavingLog ? (
                <a
                  href="https://drive.google.com/file/d/1lSremHUZhWMKUSmZZYNj0IkCmMOCpkyk/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-white hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  Download APK
                </a>
              ) : (
                project.liveUrl && !project.liveUrl.startsWith("/projects/") && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-white hover:bg-zinc-200 transition-colors shadow-lg"
                  >
                    Live Demo
                  </a>
                )
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
                >
                  Source Code
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}