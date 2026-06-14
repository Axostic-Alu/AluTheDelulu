"use client";

import { type ReactNode } from "react";

interface RippleEffectProps {
  children: ReactNode;
  className?: string;
}

export default function RippleEffect({ children, className = "" }: RippleEffectProps) {
  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={(e) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transform: scale(0);
          animation: ripple-anim 0.6s ease-out forwards;
          pointer-events: none;
        `;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }}
    >
      {children}
      <style jsx>{`
        @keyframes ripple-anim {
          to { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </button>
  );
}
