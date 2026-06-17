"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { savingLogFeatures, type SavingLogFeature } from "@/data/projects";

const gradient = "from-emerald-500 via-teal-500 to-cyan-500";
const accent = "#10b981";

export default function SavingLogPage() {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const featured = showAllFeatures ? savingLogFeatures : savingLogFeatures.slice(0, 3);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.05),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(20,184,166,0.04),_transparent_60%)]" />
      <div className="fixed inset-0 -z-10 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 0L0 0 0 100' fill='none' stroke='%2310b981' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: "100px 100px",
      }} />

      <div className="max-w-5xl mx-auto px-6 py-20 md:px-16 md:py-28">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Projects</span>
          </Link>
        </motion.div>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* Left: App Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative mx-auto w-[280px] h-[580px] rounded-[3rem] border-4 border-zinc-700 bg-zinc-900 overflow-hidden shadow-2xl shadow-emerald-500/10">
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-10" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-700 z-20" />
              
              {/* App screen */}
              <div className="pt-10 px-4 pb-4 h-full flex flex-col" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)" }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold" style={{ color: accent }}>Saving Log</span>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-xs text-zinc-400">👤</span>
                  </div>
                </div>

                {/* Balance Card */}
                <div className="p-4 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <p className="text-xs text-zinc-500 mb-1">Current Balance</p>
                  <p className="text-3xl font-bold text-white">$2,847</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-emerald-400">+$127</span>
                    <span className="text-xs text-zinc-600">this week</span>
                  </div>
                </div>

                {/* Goal Meter */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400">Vacation Fund</span>
                    <span className="text-xs text-zinc-500">$1,200/$3,000</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${accent}, #14b8a6)` }}
                      initial={{ width: 0 }}
                      animate={{ width: "40%" }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="flex-1 space-y-2 overflow-hidden">
                  <p className="text-xs text-zinc-500 font-medium mb-3">Recent Activity</p>
                  {[
                    { name: "Coffee Shop", amount: -4.50, time: "2h ago" },
                    { name: "Salary Deposit", amount: 2400, time: "1d ago" },
                    { name: "Groceries", amount: -67.30, time: "2d ago" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                      <div>
                        <p className="text-xs text-zinc-300">{tx.name}</p>
                        <p className="text-[10px] text-zinc-600">{tx.time}</p>
                      </div>
                      <span className={`text-sm font-mono ${tx.amount > 0 ? "text-emerald-400" : "text-zinc-400"}`}>
                        {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Impulse Buy Alert */}
                <motion.div
                  className="mt-3 p-3 rounded-xl"
                  style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>🚨</span>
                    <span className="text-xs font-medium text-red-400">Impulse Alert!</span>
                  </div>
                  <p className="text-[11px] text-red-300/80">You've spent $45 on quick buys today. Take a breath?</p>
                </motion.div>
              </div>
            </div>

            {/* Floating glow */}
            <motion.div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full -z-10"
              style={{ background: `radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)` }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center"
          >
            <motion.span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-[0.2em] mb-4 w-fit"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: accent }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Mobile App · In Progress
            </motion.span>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                Saving Log
              </span>
            </h1>

            <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-xl">
              Your personal finance companion that makes saving money feel good. 
              Track spending, smash savings goals, and get AI-powered advice before you spend.
            </p>

            {/* Download + Show More Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <motion.a
                href="#"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-sm text-white relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={e => { e.preventDefault(); alert("Download coming soon! 🚀"); }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download App
                <motion.div
                  className="absolute inset-0 -translate-x-full"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                />
              </motion.a>

              <motion.button
                onClick={() => setShowAllFeatures(!showAllFeatures)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-medium text-sm text-zinc-300 bg-zinc-900/50 border border-zinc-700 hover:border-zinc-600 hover:text-white transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{showAllFeatures ? "Show Less" : "Show More"}</span>
                <motion.svg
                  className="w-4 h-4"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  animate={{ rotate: showAllFeatures ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Transactions", value: "1,247+" },
                { label: "Users", value: "500+" },
                { label: "Saved", value: "$12K+" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-3 rounded-xl text-center"
                  style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}
                >
                  <p className="text-xl font-bold tabular-nums" style={{ color: accent }}>{stat.value}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mb-20"
        >
          <motion.div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Everything you need</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Features
            </h2>
            <p className="text-zinc-500 mt-2 max-w-lg mx-auto">Built to help you save, one smart decision at a time.</p>
          </motion.div>

          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {featured.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
                  className="relative group p-5 rounded-2xl border bg-zinc-900/40 backdrop-blur-sm overflow-hidden cursor-pointer"
                  style={{
                    borderColor: "rgba(16,185,129,0.2)",
                    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(16,185,129,0.1), 0 0 0 1px rgba(16,185,129,0.15) inset"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                  onClick={() => setExpandedFeature(expandedFeature === feature.title ? null : feature.title)}
                >
                  {/* Accent bar */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{ background: `linear-gradient(180deg, #10b981, #14b8a6)` }}
                    initial={{ scaleY: 0 }}
                    whileHover={{ scaleY: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>

                  {/* Expand indicator */}
                  <div className="flex items-center gap-1 mt-3 text-xs text-zinc-600">
                    <span>{expandedFeature === feature.title ? "Less" : "More"}</span>
                    <motion.svg
                      className="w-3 h-3"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      animate={{ rotate: expandedFeature === feature.title ? 180 : 0 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Show More / Less button */}
          <motion.div className="text-center mt-8">
            <motion.button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: accent,
              }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{showAllFeatures ? "Show Less Features" : `Show All ${savingLogFeatures.length} Features`}</span>
              <motion.svg
                className="w-4 h-4"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                animate={{ rotate: showAllFeatures ? 180 : 0 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Download CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 md:p-12 rounded-3xl text-center overflow-hidden mb-16"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(20,184,166,0.05))",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)" }} />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to start saving?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Join 500+ users who are taking control of their finances. Download Saving Log and start your journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a
                href="#"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={e => { e.preventDefault(); alert("App Store — Coming soon! 🚀"); }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                <span>Download for iOS</span>
              </motion.a>
              <motion.a
                href="#"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-zinc-300 border border-zinc-700 hover:border-zinc-600 hover:text-white transition-all"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={e => { e.preventDefault(); alert("Google Play — Coming soon! 🚀"); }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.25.92-.59 1.19l-2.42 1.42L14.46 12l3.28-3.28 2.42 1.42zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/></svg>
                <span>Download for Android</span>
              </motion.a>
            </div>
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 mb-6 text-center">Built With</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["React Native", "TypeScript", "Firebase", "RevenueCat", "AI/ML", "Tailwind CSS"].map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-2 rounded-xl text-sm font-mono text-zinc-300 bg-zinc-900/50 border border-zinc-800"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pt-8 border-t border-zinc-800/50"
        >
          <p className="text-zinc-600 text-sm">
            Built with care by <span className="text-emerald-400 font-medium">AluTheDelulu</span>
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
