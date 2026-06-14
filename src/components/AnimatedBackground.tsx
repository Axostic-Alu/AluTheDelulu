"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
  pulsePhase: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const PARTICLE_COUNT = 100;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() * 60 + 260,
        life: 0,
        maxLife: Math.random() * 300 + 200,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    }

    function init() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    // Mouse tracking with smooth interpolation
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });

    function drawConnection(p1: Particle, p2: Particle) {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 150;

      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.15;
        ctx!.beginPath();
        ctx!.moveTo(p1.x, p1.y);
        ctx!.lineTo(p2.x, p2.y);
        ctx!.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
      }
    }

    function animate() {
      if (!canvas || !ctx) return;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Attract/repel from mouse
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200 * 0.02;
          p.speedX += (dx / dist) * force;
          p.speedY += (dy / dist) * force;
        }

        // Damping
        p.speedX *= 0.99;
        p.speedY *= 0.99;

        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;
        p.pulsePhase += 0.02;

        // Wrap around
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Pulse opacity
        const pulse = Math.sin(p.pulsePhase) * 0.2 + 0.8;
        const alpha = p.opacity * pulse;

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 80%, ${alpha})`;
        ctx.fill();

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          drawConnection(p, particles[j]);
        }

        // Respawn if too old
        if (p.life > p.maxLife) {
          particles[i] = createParticle();
        }
      }

      // Draw mouse glow ring
      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        const mg = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 120
        );
        mg.addColorStop(0, 'rgba(108, 92, 231, 0.04)');
        mg.addColorStop(0.5, 'rgba(168, 85, 247, 0.02)');
        mg.addColorStop(1, 'rgba(108, 92, 231, 0)');
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 120, 0, Math.PI * 2);
        ctx.fillStyle = mg;
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0.6 }}
    />
  );
}
