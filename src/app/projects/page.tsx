"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { projects, savingLogFeatures, type Project } from "@/data/projects";

const categoryLabels: Record<Project["category"], string> = {
  web: "Web",
  mobile: "Mobile",
  tool: "Tool",
  experiment: "Experiment",
};

const categoryColors: Record<Project["category"], string> = {
  web: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  mobile: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  tool: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  experiment: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const statusColors: Record<Project["status"], string> = {
  live: "bg-green-500/20 text-green-400 border-green-500/30",
  "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  archived: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Project["category"] | "all">("all");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showSavingLogFeatures, setShowSavingLogFeatures] = useState(false);

  const filteredProjects = selectedCategory === "all" 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const categories: (Project["category"] | "all")[] = ["all", "web", "mobile", "tool", "experiment"];

  // Find the saving log project
  const savingLogProject = projects.find(p => p.slug === "saving-log");

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24 md:px-16 relative overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(96,165,250,0.04),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(167,139,250,0.04),_transparent_60%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 0L0 0 0 100' fill='none' stroke='%2360a5fa' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: "100px 100px",
      }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-[0.2em] mb-4"
            style={{ background: "rgba(96, 165, 250, 0.1)", border: "1px solid rgba(96, 165, 250, 0.2)", color: "#60a5fa" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Portfolio
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Projects
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            A collection of things I've built, broken, and learned from. Each project represents a problem I wanted to solve or a technology I wanted to explore.
          </p>
        </motion.header>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 flex flex-wrap gap-2"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                ${selectedCategory === cat 
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_20px_rgba(96,165,250,0.2)]" 
                  : "bg-zinc-900/50 text-zinc-400 border-zinc-700 hover:border-zinc-600 hover:text-zinc-200"
                }`}
            >
              {cat === "all" ? "All Projects" : categoryLabels[cat]}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              project.slug === "saving-log" ? (
                <SavingLogCard
                  key={project.id}
                  project={project}
                  index={index}
                  showFeatures={showSavingLogFeatures}
                  onToggleFeatures={() => setShowSavingLogFeatures(!showSavingLogFeatures)}
                  onExpand={() => setExpandedProject(project.id)}
                  isExpanded={expandedProject === project.id}
                  onClose={() => setExpandedProject(null)}
                />
              ) : (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onExpand={() => setExpandedProject(project.id)}
                  isExpanded={expandedProject === project.id}
                  onClose={() => setExpandedProject(null)}
                />
              )
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-zinc-500">No projects in this category yet.</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}

// === PROJECT CARD ===
function ProjectCard({ 
  project, 
  index, 
  onExpand, 
  isExpanded,
  onClose 
}: { 
  project: Project; 
  index: number;
  onExpand: () => void;
  isExpanded: boolean;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, type: "spring", stiffness: 200, damping: 25 }}
        className="relative group p-6 rounded-2xl border bg-gradient-to-br from-zinc-900/50 to-zinc-950/60 backdrop-blur-sm overflow-hidden cursor-pointer"
        style={{
          borderColor: hovered ? "rgba(96, 165, 250, 0.4)" : "rgba(61, 61, 61, 0.6)",
          boxShadow: hovered ? "0 25px 50px -25px rgba(96,165,250,0.2),0 0 0 1px rgba(96,165,250,0.1) inset" : "0 8px 30px -10px rgba(0,0,0,0.4)",
          transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onExpand}
      >
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: `linear-gradient(180deg, ${project.gradient})` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: hovered ? 1 : 0.4 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 100 : -100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border ${categoryColors[project.category]}`}>
                {categoryLabels[project.category]}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border ${statusColors[project.status]}`}>
                {project.status}
              </span>
            </div>
            {project.featured && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Featured
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {project.title}
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4 flex-1">{project.shortDescription}</p>

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50 mt-auto">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-zinc-400 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 hover:text-white hover:bg-zinc-800 transition-all"
                onClick={e => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
            )}
            {project.liveUrl && !project.liveUrl.startsWith("/projects/") && (
              <a
                href={project.liveUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all"
                onClick={e => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Live
              </a>
            )}
            <span className="ml-auto text-[11px] text-zinc-600">Details →</span>
          </div>
        </div>
      </motion.article>

      {/* Expanded View Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-zinc-800 p-6 md:p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-end mb-4">
                <button onClick={onClose} className="p-2 rounded-xl bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${categoryColors[project.category]}`}>{categoryLabels[project.category]}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${statusColors[project.status]}`}>{project.status}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{project.title}</h2>
              <p className="text-zinc-300 mb-6 leading-relaxed">{project.fullDescription}</p>


              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-medium text-white">Key Highlights</h3>
                {project.highlights.map(h => (
                  <div key={h} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${project.gradient})` }}>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-sm text-zinc-300">{h}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-zinc-300 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                    View on GitHub
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// === SAVING LOG SHOWCASE CARD ===
function SavingLogCard({
  project,
  index,
  showFeatures,
  onToggleFeatures,
  onExpand,
  isExpanded,
  onClose,
}: {
  project: Project;
  index: number;
  showFeatures: boolean;
  onToggleFeatures: () => void;
  onExpand: () => void;
  isExpanded: boolean;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const accent = "#10b981";

  const displayedFeatures = showFeatures ? savingLogFeatures : savingLogFeatures.slice(0, 3);

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, type: "spring", stiffness: 200, damping: 25 }}
        className="relative group p-6 rounded-2xl border bg-gradient-to-br from-zinc-900/50 to-zinc-950/60 backdrop-blur-sm overflow-hidden"
        style={{
          borderColor: hovered ? "rgba(16, 185, 129, 0.4)" : "rgba(61, 61, 61, 0.6)",
          boxShadow: hovered ? "0 25px 50px -25px rgba(16,185,129,0.2),0 0 0 1px rgba(16,185,129,0.1) inset" : "0 8px 30px -10px rgba(0,0,0,0.4)",
          transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Gradient accent */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: `linear-gradient(180deg, ${project.gradient})` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: hovered ? 1 : 0.4 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 100 : -100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                Mobile
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                In Progress
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Featured
            </span>
          </div>

          {/* Title + Desc */}
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            {project.title}
            <span className="text-[11px] font-mono text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-800/50">v1.0</span>
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">{project.shortDescription}</p>

          {/* Download Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <a
              href="https://drive.google.com/file/d/1lSremHUZhWMKUSmZZYNj0IkCmMOCpkyk/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.25.92-.59 1.19l-2.42 1.42L14.46 12l3.28-3.28 2.42 1.42zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/></svg>
              Download for Android
            </a>
            <motion.button
              onClick={e => { e.stopPropagation(); onExpand(); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 hover:text-white transition-all ml-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Full Page</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </motion.button>
          </div>



          {/* "Show More" Features Toggle */}
          <div className="border-t border-zinc-800/50 pt-4 mt-auto">
            <button
              onClick={e => { e.stopPropagation(); onToggleFeatures(); }}
              className="flex items-center justify-between w-full text-left group"
            >
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                {showFeatures ? "Hide Details" : "Show More"}
              </span>
              <motion.svg
                className="w-4 h-4 text-zinc-500"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                animate={{ rotate: showFeatures ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>

            <AnimatePresence>
              {showFeatures && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3">
                    {savingLogFeatures.map((feature, i) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}
                      >
                        <span className="text-xl flex-shrink-0 mt-0.5">{feature.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{feature.title}</p>
                          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.article>

      {/* Full Page Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-zinc-800 p-6 md:p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                  <p className="text-zinc-400 text-sm mt-1">{project.shortDescription}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>



              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-3">All Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savingLogFeatures.map((feature) => (
                    <div key={feature.title} className="p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{feature.icon}</span>
                        <h4 className="font-medium text-white">{feature.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800">
                <a
                  href="https://drive.google.com/file/d/1lSremHUZhWMKUSmZZYNj0IkCmMOCpkyk/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.25.92-.59 1.19l-2.42 1.42L14.46 12l3.28-3.28 2.42 1.42zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/></svg>
                  Download for Android
                </a>
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-zinc-300 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                    GitHub
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
