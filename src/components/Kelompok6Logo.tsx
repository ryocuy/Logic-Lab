import React from 'react';

const Kelompok6Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className || "w-10 h-10"}
      aria-label="Kelompok 6 Logo"
    >
      <defs>
        <radialGradient id="kelompok6_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#kelompok6_glow)" />
      <circle cx="50" cy="50" r="40" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
      <text 
        x="50%" 
        y="58%" 
        textAnchor="middle" 
        fill="hsl(var(--primary))" 
        fontSize="40" 
        fontFamily="inherit" 
        fontWeight="bold"
      >
        6
      </text>
      <text 
        x="50%" 
        y="35%" 
        textAnchor="middle" 
        fill="hsl(var(--accent))" 
        fontSize="18" 
        fontFamily="inherit" 
        fontWeight="600"
      >
        K
      </text>
    </svg>
  );
};

export default Kelompok6Logo;
