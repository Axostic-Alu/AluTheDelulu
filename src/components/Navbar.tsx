"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { List, X, GameController, User, House, Books, Quotes, Gauge, BookOpen } from "@phosphor-icons/react";

const navItems = [
  { label: "Home", href: "/", icon: House },
  { label: "About", href: "/#about", icon: User },
  { label: "Games", href: "/#games", icon: GameController },
  { label: "Projects", href: "/projects", icon: Books },
  { label: "Quotes", href: "/quotes", icon: Quotes },
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Guestbook", href: "/guestbook", icon: BookOpen },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.04] bg-[var(--color-bg)]/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-orbitron text-sm font-bold tracking-widest uppercase"
        >
          <span className="gradient-text">Alu</span>
          <span className="text-[var(--color-text-muted)]">TheDelulu</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-all hover:bg-white/[0.04] hover:text-[var(--color-text-primary)]"
              >
                <Icon size={14} className="transition-transform group-hover:scale-110" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center md:hidden"
          aria-label="Toggle menu"
        >
          {open ? (
            <X size={22} className="text-[var(--color-text-primary)]" />
          ) : (
            <List size={22} className="text-[var(--color-text-secondary)]" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/[0.04] bg-[var(--color-bg)]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col px-6 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[var(--color-text-secondary)] transition-all hover:bg-white/[0.04] hover:text-[var(--color-text-primary)]"
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
