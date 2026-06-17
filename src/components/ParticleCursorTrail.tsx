"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number; // 1 -> 0
  maxLife: number;
  hue: keyof typeof COLORS;
}

const COLORS = {
  sky: "125, 211, 252",
  violet: "167, 139, 250",
  white: "224, 236, 255",
};

const COLOR_KEYS = Object.keys(COLORS) as Array<keyof typeof COLORS>;

export default function ParticleCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    let particles: Particle[] = [];
    let lastSpawn = 0;

    const spawn = (x: number, y: number) => {
      const hue = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.45 - 0.1,
        size: Math.random() * 2 + 1,
        life: 1,
        maxLife: Math.random() * 25 + 35,
        hue,
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 50) return;
      lastSpawn = now;
      spawn(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", handlePointerMove);

    let frameId: number;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      particles = particles.filter((p) => p.life > 0);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1 / p.maxLife;

        const alpha = Math.max(p.life, 0) * 0.8;
        const rgb = COLORS[p.hue];

        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        // shadowBlur intentionally omitted for scroll performance
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40 pointer-events-none mix-blend-screen"
      aria-hidden="true"
    />
  );
}
