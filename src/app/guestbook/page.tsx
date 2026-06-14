"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  addGuestbookEntry,
  getGuestbookEntries,
  type GuestbookEntry,
} from "@/lib/guestbook";

/* ── Rain Canvas Background ── */
function RainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let drops: { x: number; y: number; speed: number; length: number; opacity: number }[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initDrops() {
      drops = [];
      for (let i = 0; i < 150; i++) {
        drops.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          speed: Math.random() * 4 + 2,
          length: Math.random() * 20 + 10,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const drop of drops) {
        drop.y += drop.speed;
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 0.5, drop.y + drop.length);
        ctx.strokeStyle = `rgba(96, 165, 250, ${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animId = requestAnimationFrame(animate);
    }

    resize();
    initDrops();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.5 }}
    />
  );
}

/* ── Sparkle particle for decorative flair ── */
function Sparkles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full"
          style={{
            background: "var(--color-accent)",
            boxShadow: "0 0 6px var(--color-accent), 0 0 12px var(--color-accent-2)",
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            y: [0, -30],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Glowing orb decorations ── */
function GlowingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <motion.div
        className="absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--color-accent-2)" }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.1, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 h-60 w-60 rounded-full opacity-10 blur-[80px]"
        style={{ background: "var(--color-accent-3)" }}
        animate={{ scale: [1, 1.3, 1], x: [-20, 20, -20] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── Main Page ── */
export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGuestbookEntries(100);
      setEntries(data);
    } catch {
      setError("Failed to load messages. Refresh to try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const newEntry = await addGuestbookEntry(name.trim(), message.trim());
      setEntries(prev => [newEntry, ...prev]);
      setName("");
      setMessage("");
    } catch {
      setError("Couldn't post your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <RainBackground />
      <Sparkles />
      <GlowingOrbs />

      <main
        className="relative z-10 min-h-screen"
        style={{ color: "var(--color-text-primary)" }}
      >
        {/* Decorative top gradient line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--color-accent), var(--color-accent-2), transparent)",
            opacity: 0.5,
          }}
        />

        <div className="relative max-w-2xl mx-auto px-6 py-24 md:px-16">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center md:text-left"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] mb-4"
              style={{
                borderColor: "rgba(59, 130, 246, 0.3)",
                color: "var(--color-accent)",
                background: "rgba(59, 130, 246, 0.08)",
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.1)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              / community
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-3 gradient-text">
              Guestbook
            </h1>
            <p
              className="mt-3 max-w-lg mx-auto md:mx-0 text-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Sign the wall. Leave a message. Be nice.
            </p>
          </motion.div>

          {/* ── Form ── */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-12 rounded-xl p-[1px]"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), var(--color-accent-2), var(--color-accent-3))",
            }}
          >
            <div
              className="relative rounded-xl p-6 backdrop-blur-xl overflow-hidden"
              style={{
                background: "rgba(12, 12, 20, 0.85)",
              }}
            >
              {/* Shine overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)",
                }}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-3 text-xs font-medium"
                  style={{ color: "var(--color-accent)" }}
                >
                  {error}
                </motion.p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 relative z-10">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={30}
                  className="col-span-1 px-4 py-2.5 rounded-lg text-sm transition-all duration-300"
                  style={{
                    background: "rgba(20, 20, 31, 0.8)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    color: "var(--color-text-primary)",
                    caretColor: "var(--color-accent)",
                  }}
                  onFocus={e => {
                    e.target.style.outline = "none";
                    e.target.style.borderColor = "var(--color-accent)";
                    e.target.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.15)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "rgba(59, 130, 246, 0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <input
                  type="text"
                  placeholder="Leave a message..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={200}
                  className="col-span-1 sm:col-span-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-300"
                  style={{
                    background: "rgba(20, 20, 31, 0.8)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    color: "var(--color-text-primary)",
                    caretColor: "var(--color-accent)",
                  }}
                  onFocus={e => {
                    e.target.style.outline = "none";
                    e.target.style.borderColor = "var(--color-accent)";
                    e.target.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.15)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "rgba(59, 130, 246, 0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {message.length}/200 · {name.length}/30
                </span>
                <button
                  type="submit"
                  disabled={!name.trim() || !message.trim() || submitting}
                  className="relative px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group"
                  style={{
                    background:
                      !name.trim() || !message.trim() || submitting
                        ? "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))"
                        : "linear-gradient(135deg, var(--color-accent), var(--color-accent-2))",
                    boxShadow:
                      !name.trim() || !message.trim() || submitting
                        ? "none"
                        : "0 0 20px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  {/* Button shine */}
                  <span
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    }}
                  />
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block h-3 w-3 rounded-full border-2 border-white/30 border-t-white"
                      />
                      Sending...
                    </span>
                  ) : (
                    "Sign Wall →"
                  )}
                </button>
              </div>
            </div>
          </motion.form>

          {/* ── Entries ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 rounded-full border-2"
                style={{
                  borderColor: "rgba(59, 130, 246, 0.2)",
                  borderTopColor: "var(--color-accent)",
                }}
              />
              <motion.p
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Loading messages...
              </motion.p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              className="space-y-4"
            >
              {entries.map(entry => (
                <motion.div
                  key={entry.id}
                  variants={{ hidden: { opacity: 0, y: 20, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1 } }}
                  className="group relative rounded-xl p-[1px] transition-all duration-500"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1), rgba(236,72,153,0.05))",
                  }}
                  whileHover={{
                    scale: 1.01,
                    transition: { duration: 0.3 },
                  }}
                >
                  {/* Glossy card body */}
                  <div
                    className="relative rounded-xl p-4 overflow-hidden backdrop-blur-xl"
                    style={{
                      background: "rgba(12, 12, 20, 0.7)",
                    }}
                  >
                    {/* Shine sweep */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{
                        background:
                          "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
                      }}
                    />

                    {/* Neon glow on hover */}
                    <div
                      className="pointer-events-none absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl rounded-xl"
                      style={{
                        background:
                          "radial-gradient(ellipse at top, rgba(59,130,246,0.15), transparent 70%)",
                      }}
                    />

                    <div className="flex items-center justify-between mb-1.5 relative z-10">
                      <div className="flex items-center gap-2">
                        {/* Avatar dot */}
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--color-accent), var(--color-accent-2))",
                            color: "white",
                            boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)",
                          }}
                        >
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--color-accent)" }}
                        >
                          {entry.name}
                        </span>
                      </div>
                      <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                        {entry.timestamp instanceof Date
                          ? entry.timestamp.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed relative z-10"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {entry.message}
                    </p>

                    {/* Bottom accent line */}
                    <div
                      className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Footer count ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs mt-10"
            style={{ color: "var(--color-text-muted)" }}
          >
            {entries.length} message{entries.length !== 1 ? "s" : ""} on the wall
            <span className="mx-2">·</span>
            <span style={{ color: "var(--color-accent)" }}>sign the guestbook</span>
          </motion.p>
        </div>
      </main>
    </>
  );
}
