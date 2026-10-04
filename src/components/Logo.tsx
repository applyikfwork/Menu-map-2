import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

export const MenuMapLogo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 800 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Soft shadow */}
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#FF5A36" floodOpacity="0.18" />
        </filter>
        {/* Gradients */}
        <linearGradient id="pinLeftGrad" x1="200" y1="100" x2="400" y2="600" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7A50" />
          <stop offset="100%" stopColor="#FF4A2A" />
        </linearGradient>
        <linearGradient id="pinRightGrad" x1="400" y1="100" x2="600" y2="600" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF5A36" />
          <stop offset="100%" stopColor="#E63815" />
        </linearGradient>
        <linearGradient id="plateOrange" x1="160" y1="600" x2="640" y2="760" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B4A" />
          <stop offset="100%" stopColor="#FA4422" />
        </linearGradient>
      </defs>

      <g filter="url(#logoShadow)">
        {/* 1. Teal background side pillars */}
        <rect x="180" y="360" width="55" height="230" rx="4" fill="#0EA593" />
        <rect x="565" y="360" width="55" height="230" rx="4" fill="#0EA593" />

        {/* 2. Bottom Serving Plate */}
        {/* Outer White Plate Fill */}
        <ellipse cx="400" cy="660" rx="245" ry="78" fill="#FFFFFF" />
        {/* Outer Coral Ring of Plate */}
        <ellipse cx="400" cy="660" rx="245" ry="78" stroke="url(#plateOrange)" strokeWidth="32" fill="none" />
        {/* Inner Golden-Yellow Ring */}
        <ellipse cx="400" cy="662" rx="160" ry="46" stroke="#FBBF24" strokeWidth="22" fill="none" />
        {/* Center base shadow */}
        <ellipse cx="400" cy="662" rx="85" ry="22" fill="#FEF3C7" opacity="0.6" />

        {/* 3. Main Map Pin (Pin Body) */}
        {/* Left half of pin */}
        <path
          d="M 400 90 
             C 275 90 180 185 180 310 
             C 180 435 340 580 400 645 
             L 400 395 
             C 342 395 295 348 295 290 
             C 295 232 342 185 400 185 
             Z"
          fill="url(#pinLeftGrad)"
        />

        {/* Right half of pin */}
        <path
          d="M 400 90 
             C 525 90 620 185 620 310 
             C 620 435 460 580 400 645 
             L 400 395 
             C 458 395 505 348 505 290 
             C 505 232 458 185 400 185 
             Z"
          fill="url(#pinRightGrad)"
        />

        {/* 4. Open Book / Menu in the upper circle hole */}
        <g id="openMenu">
          {/* Left Page (lighter teal) */}
          <polygon
            points="315,225 395,255 395,385 315,355"
            fill="#2DD4BF"
          />
          {/* Right Page (darker emerald teal) */}
          <polygon
            points="485,225 395,255 395,385 485,355"
            fill="#0F766E"
          />
          {/* Center spine highlight */}
          <line x1="395" y1="255" x2="395" y2="385" stroke="#14B8A6" strokeWidth="4" />
        </g>

        {/* 5. White Stylized Fork inside pin body */}
        <g id="whiteFork">
          {/* Fork Curved Handle */}
          <path
            d="M 488 285
               C 505 340 480 415 450 455
               C 440 468 430 480 422 495
               L 395 470
               C 405 450 420 435 432 415
               C 450 380 460 330 452 288
               Z"
            fill="#FFFFFF"
          />

          {/* Fork Head Base & Prongs */}
          <g transform="translate(390, 480) rotate(-42)">
            {/* Fork Base Cup */}
            <path
              d="M -30,0 C -30,28 30,28 30,0 L 22,-50 L -22,-50 Z"
              fill="#FFFFFF"
            />
            {/* Prongs (4 slots) */}
            <rect x="-26" y="-105" width="9" height="65" rx="4.5" fill="#FFFFFF" />
            <rect x="-10" y="-105" width="8" height="65" rx="4" fill="#FFFFFF" />
            <rect x="4" y="-105" width="8" height="65" rx="4" fill="#FFFFFF" />
            <rect x="18" y="-105" width="9" height="65" rx="4.5" fill="#FFFFFF" />
          </g>
        </g>

        {/* Subtle center pin tip anchor point */}
        <circle cx="400" cy="640" r="6" fill="#FFFFFF" opacity="0.6" />
      </g>
    </svg>
  );
};
