"use client";

import { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  r: number;          // radius / size
  petalCount: number; // number of petals in this blossom piece
  angle: number;
  rotationSpeed: number;
  fallSpeed: number;
  swayAmplitude: number;
  swaySpeed: number;
  phase: number;
  color: string;
  alpha: number;
  shape: "round" | "pointed" | "heart";
}

const PETAL_COLORS = [
  "255, 182, 193", // light pink
  "255, 192, 203", // pink
  "255, 105, 180", // hot pink
  "218, 112, 214", // orchid
  "221, 160, 221", // plum
  "255, 228, 225", // misty rose
  "255, 240, 245", // lavender blush
  "230, 230, 250", // lavender
  "255, 255, 255", // white
  "252, 228, 236", // very light pink
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Draw a petal shape on the canvas at origin (0,0), rotated
function drawPetalShape(
  ctx: CanvasRenderingContext2D,
  size: number,
  shape: "round" | "pointed" | "heart"
) {
  ctx.beginPath();
  switch (shape) {
    case "round":
      // Rounded petal (ellipse-like)
      ctx.ellipse(0, 0, size, size * 1.4, 0, 0, Math.PI * 2);
      break;
    case "pointed":
      // Pointed petal (teardrop-like)
      ctx.moveTo(0, -size * 1.5);
      ctx.bezierCurveTo(
        size * 0.8, -size * 0.8,
        size * 0.8, size * 0.8,
        0, size * 1.2
      );
      ctx.bezierCurveTo(
        -size * 0.8, size * 0.8,
        -size * 0.8, -size * 0.8,
        0, -size * 1.5
      );
      break;
    case "heart":
      // Heart-ish petal
      ctx.moveTo(0, size * 0.3);
      ctx.bezierCurveTo(
        -size * 1.2, -size * 0.6,
        -size * 0.6, -size * 1.5,
        0, -size * 0.8
      );
      ctx.bezierCurveTo(
        size * 0.6, -size * 1.5,
        size * 1.2, -size * 0.6,
        0, size * 0.3
      );
      break;
  }
  ctx.closePath();
}

export default function PetalsBackground({ petalCount = 60, startDelay = 0 }: { petalCount?: number; startDelay?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let petals: Petal[] = [];
    let width = 0;
    let height = 0;
    let isPaused = false;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let frameSkip = 0;

    // Pause during active scroll, resume after scroll stops
    const handleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      isPaused = true;
      scrollTimer = setTimeout(() => {
        isPaused = false;
      }, 200);
    };

    // Pause when tab is hidden
    const handleVisibility = () => {
      if (document.hidden) {
        isPaused = true;
      } else {
        isPaused = false;
      }
    };

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;

      // Initialize or recreate petals proportionally
      const targetCount = Math.min(petalCount, Math.floor(width / 20));
      petals = [];
      for (let i = 0; i < targetCount; i++) {
        petals.push(createPetal(width, height));
      }
    }

    function createPetal(w: number, h: number): Petal {
      return {
        x: Math.random() * w,
        y: Math.random() * h - h * 0.1,
        r: randomBetween(3, 9),
        petalCount: Math.floor(randomBetween(2, 5)),
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: randomBetween(-0.02, 0.02),
        fallSpeed: randomBetween(0.3, 1.2),
        swayAmplitude: randomBetween(20, 60),
        swaySpeed: randomBetween(0.003, 0.01),
        phase: Math.random() * Math.PI * 2,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        alpha: randomBetween(0.15, 0.45),
        shape: (["round", "pointed", "heart"] as const)[Math.floor(Math.random() * 3)],
      };
    }

    resize();

    // Startup delay: don't start the RAF loop until after startDelay ms
    // This prevents canvas animation from competing with initial page render
    let started = false;
    const startTimer = setTimeout(() => {
      started = true;
    }, startDelay);

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    function draw() {
      if (!canvas || !ctx) return;

      // Skip frames when paused, tab hidden, or before startup delay
      if (isPaused || document.hidden || !started) {
        animId = requestAnimationFrame(draw);
        return;
      }

      // Throttle to ~30fps when scrolling was recent
      frameSkip = (frameSkip + 1) % 2;
      if (frameSkip !== 0) {
        animId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const t = Date.now();

      for (const p of petals) {
        // Fall
        p.y += p.fallSpeed;

        // Sway
        const swayX = Math.sin(t * p.swaySpeed + p.phase) * p.swayAmplitude * 0.01;
        p.x += swayX;

        // Rotate
        p.angle += p.rotationSpeed;

        // Reset when off screen
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
          p.angle = Math.random() * Math.PI * 2;
          p.rotationSpeed = randomBetween(-0.02, 0.02);
          p.fallSpeed = randomBetween(0.3, 1.2);
        }

        // Wrap x
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;

        // Draw petal cluster
        const petalSize = p.r;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        const baseAlpha = p.alpha * (0.7 + 0.3 * Math.sin(t * 0.001 + p.phase));

        for (let i = 0; i < p.petalCount; i++) {
          const angleOffset = (i / p.petalCount) * Math.PI * 2;
          const distOffset = petalSize * 0.3;

          ctx.save();
          ctx.rotate(angleOffset);
          ctx.translate(distOffset, 0);

          const shadeVariation = 1 - (i / p.petalCount) * 0.3;
          ctx.fillStyle = `rgba(${p.color}, ${baseAlpha * shadeVariation})`;
          ctx.strokeStyle = `rgba(${p.color}, ${baseAlpha * shadeVariation * 0.3})`;
          ctx.lineWidth = 0.5;

          const sizeVariation = petalSize * (0.8 + (i / p.petalCount) * 0.4);
          drawPetalShape(ctx, sizeVariation, p.shape);
          ctx.fill();
          ctx.stroke();

          ctx.restore();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(startTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [petalCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}
