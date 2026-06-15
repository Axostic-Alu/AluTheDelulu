"use client";

import { type ReactNode } from "react";

interface ShimmerGlassProps {
  children: ReactNode;
  className?: string;
}

export default function ShimmerGlass({ children, className = "" }: ShimmerGlassProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl ${className}`}
    >
      {/* Shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -inset-full animate-[shimmer_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-[1]">{children}</div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(12deg); }
          100% { transform: translateX(200%) rotate(12deg); }
        }
      `}</style>
    </div>
  );
}
