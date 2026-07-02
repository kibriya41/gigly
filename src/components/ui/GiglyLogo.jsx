import React from 'react';

export default function GiglyLogo({ className = '', iconClassName = '', textClassName = '', size = 36, showText = true }) {
  // SVG proportions are 100x100
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg
        className={`shrink-0 ${iconClassName}`}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gigly-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
          
          <mask id="gigly-logo-mask">
            {/* Everything white is rendered */}
            <rect width="100" height="100" fill="black" />
            
            {/* Gear outer shape */}
            <circle cx="50" cy="50" r="26" fill="white" />
            
            {/* 8 teeth around the gear */}
            <rect x="44" y="6" width="12" height="18" rx="3.5" fill="white" transform="rotate(0 50 50)" />
            <rect x="44" y="6" width="12" height="18" rx="3.5" fill="white" transform="rotate(45 50 50)" />
            <rect x="44" y="6" width="12" height="18" rx="3.5" fill="white" transform="rotate(90 50 50)" />
            <rect x="44" y="6" width="12" height="18" rx="3.5" fill="white" transform="rotate(135 50 50)" />
            <rect x="44" y="6" width="12" height="18" rx="3.5" fill="white" transform="rotate(180 50 50)" />
            <rect x="44" y="6" width="12" height="18" rx="3.5" fill="white" transform="rotate(225 50 50)" />
            <rect x="44" y="6" width="12" height="18" rx="3.5" fill="white" transform="rotate(270 50 50)" />
            <rect x="44" y="6" width="12" height="18" rx="3.5" fill="white" transform="rotate(315 50 50)" />
            
            {/* Gear hollow center cutout (black) */}
            <circle cx="50" cy="50" r="14" fill="black" />
            
            {/* Lightning bolt cutout (black) */}
            <path 
              d="M 54 6 L 33 46 L 47 46 L 27 94 L 59 48 L 44 48 Z" 
              fill="black" 
              fillRule="evenodd"
            />
          </mask>
        </defs>

        {/* The visible gear with gradient applied via mask */}
        <rect
          width="100"
          height="100"
          fill="url(#gigly-logo-grad)"
          mask="url(#gigly-logo-mask)"
        />
      </svg>

      {showText && (
        <span className={`font-sans font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-[#00E5FF] to-[#0066FF] ${textClassName}`}>
          Gigly
        </span>
      )}
    </div>
  );
}
