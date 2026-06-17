import React from 'react';
import './GlitchText.css';

interface GlitchTextProps {
  children: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ 
  children, 
  speed = 1, 
  enableShadows = true, 
  enableOnHover = true, 
  className = '' 
}) => {
  const inlineStyles = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': enableShadows ? '-1.5px 0 #a78bfa' : 'none', 
    '--before-shadow': enableShadows ? '1.5px 0 #38bdf8' : 'none'  
  } as React.CSSProperties;

  const hoverClass = enableOnHover ? 'enable-on-hover' : '';

  return (
    <span className={`glitch ${hoverClass} ${className}`} style={inlineStyles} data-text={children}>
      {children}
    </span>
  );
};

export default GlitchText;