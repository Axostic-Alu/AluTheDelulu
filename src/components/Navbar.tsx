"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X, User, GameController, Quotes, Gauge } from "@phosphor-icons/react";

// ─── Individual link colors ──────────────────────────────────────────
const linkColors: Record<string, string> = {
  Home: "text-sky-400 hover:text-sky-300",
  Projects: "text-violet-400 hover:text-violet-300",
  Guestbook: "text-emerald-400 hover:text-emerald-300",
  "World Cup": "text-amber-400 hover:text-amber-300",
  About: "text-pink-400 hover:text-pink-300",
  Games: "text-orange-400 hover:text-orange-300",
  Quotes: "text-yellow-400 hover:text-yellow-300",
  Dashboard: "text-rose-400 hover:text-rose-300",
};

const linkActiveColors: Record<string, string> = {
  Home: "bg-sky-500/15 text-sky-300",
  Projects: "bg-violet-500/15 text-violet-300",
  Guestbook: "bg-emerald-500/15 text-emerald-300",
  "World Cup": "bg-amber-500/15 text-amber-300",
  About: "bg-pink-500/15 text-pink-300",
  Games: "bg-orange-500/15 text-orange-300",
  Quotes: "bg-yellow-500/15 text-yellow-300",
  Dashboard: "bg-rose-500/15 text-rose-300",
};

const barLinks = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Guestbook", href: "/guestbook" },
  { label: "Games", href: "/games" },
  { label: "World Cup", href: "/worldcup" },
];

const drawerLinks = [
  { label: "About", href: "/#about", icon: User },
  { label: "Quotes", href: "/quotes", icon: Quotes },
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.04] bg-[var(--color-bg)]/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo — far left */}
        <Link
          href="/"
          className="font-orbitron text-sm font-bold tracking-widest uppercase whitespace-nowrap"
        >
          <span className="gradient-text">Alu</span>
          <span className="text-[var(--color-text-muted)]">TheDelulu</span>
        </Link>

        {/* Bar Links — pushed far right with ml-auto, + hamburger */}
        <div className="flex items-center gap-1 ml-auto">
          {barLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`hidden sm:inline-flex px-3 py-1.5 text-sm rounded-lg transition-all ${
                  active ? linkActiveColors[link.label] : linkColors[link.label]
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Hamburger button */}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center ml-2 w-9 h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-zinc-500 transition-all"
            aria-label="Toggle menu"
          >
            {open ? (
              <X size={18} className="text-[var(--color-text-primary)]" />
            ) : (
              <List size={18} className="text-[var(--color-text-secondary)]" />
            )}
          </button>
        </div>
      </div>

      {/* Drawer — pinned to far left border */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-white/[0.04] bg-[var(--color-bg)]/95 backdrop-blur-xl shadow-xl"
          >
            <div className="flex flex-col px-6 py-4 space-y-1 max-w-sm">
              {/* Mobile: bar links repeated inside drawer */}
              <div className="sm:hidden flex flex-col space-y-1 pb-2 mb-2 border-b border-white/[0.06]">
                {barLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                        active
                          ? linkActiveColors[link.label]
                          : linkColors[link.label]
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Drawer-only links (shown on all screens) */}
              {drawerLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                      active
                        ? linkActiveColors[item.label]
                        : linkColors[item.label]
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
