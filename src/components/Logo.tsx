import React from 'react';

interface LogoProps {
  variant?: 'full' | 'horizontal' | 'emblem';
  mode?: 'light' | 'dark'; // light background or dark background
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FirmEmblemSVG: React.FC<{ mode?: 'light' | 'dark'; className?: string }> = ({
  mode = 'light',
  className = 'w-16 h-16'
}) => {
  const tealColor = mode === 'dark' ? '#2dd4bf' : '#0c4a47'; // Teal green
  const goldColor = mode === 'dark' ? '#e5c388' : '#b89b6a'; // Metallic gold/bronze
  const whiteOrTeal = mode === 'dark' ? '#0f172a' : '#ffffff';
  const textColor = mode === 'dark' ? '#ffffff' : '#0c4a47';

  return (
    <svg viewBox="0 0 300 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Laurel Wreath Left */}
      <g stroke={goldColor} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M 130 230 C 70 220 35 150 55 80 C 65 55 80 35 100 20" />
        {/* Left Leaves */}
        <path d="M 125 215 Q 100 210 90 195 Q 105 190 120 205 Z" fill={goldColor} />
        <path d="M 105 190 Q 80 180 70 160 Q 90 155 102 178 Z" fill={goldColor} />
        <path d="M 85 160 Q 60 145 55 125 Q 75 120 83 148 Z" fill={goldColor} />
        <path d="M 72 130 Q 48 110 48 90 Q 66 88 72 118 Z" fill={goldColor} />
        <path d="M 64 98 Q 45 75 50 55 Q 67 58 66 88 Z" fill={goldColor} />
        <path d="M 63 68 Q 50 42 62 25 Q 75 32 67 58 Z" fill={goldColor} />
        {/* Top left leaf tip in Teal */}
        <path d="M 72 40 Q 68 15 88 8 Q 92 28 78 40 Z" fill={tealColor} stroke={tealColor} />
      </g>

      {/* Laurel Wreath Right */}
      <g stroke={goldColor} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M 170 230 C 230 220 265 150 245 80 C 235 55 220 35 200 20" />
        {/* Right Leaves */}
        <path d="M 175 215 Q 200 210 210 195 Q 195 190 180 205 Z" fill={goldColor} />
        <path d="M 195 190 Q 220 180 230 160 Q 210 155 198 178 Z" fill={goldColor} />
        <path d="M 215 160 Q 240 145 245 125 Q 225 120 217 148 Z" fill={goldColor} />
        <path d="M 228 130 Q 252 110 252 90 Q 234 88 228 118 Z" fill={goldColor} />
        <path d="M 236 98 Q 255 75 250 55 Q 233 58 234 88 Z" fill={goldColor} />
        <path d="M 237 68 Q 250 42 238 25 Q 225 32 233 58 Z" fill={goldColor} />
        {/* Top right leaf tip in Teal */}
        <path d="M 228 40 Q 232 15 212 8 Q 208 28 222 40 Z" fill={tealColor} stroke={tealColor} />
      </g>

      {/* Center Structure: Scales of Justice */}
      {/* Top beam caps & loops */}
      <path d="M 115 35 Q 150 20 185 35" stroke={goldColor} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M 125 30 A 8 8 0 1 1 125 29" stroke={goldColor} strokeWidth="3" fill="none" />
      <path d="M 175 30 A 8 8 0 1 1 175 29" stroke={goldColor} strokeWidth="3" fill="none" />

      {/* Balance beam handle arch top */}
      <path d="M 130 18 C 130 8, 170 8, 170 18" stroke={tealColor} strokeWidth="3.5" fill="none" />

      {/* Hanging Strings Left */}
      <line x1="125" y1="38" x2="105" y2="85" stroke={goldColor} strokeWidth="2.5" />
      <line x1="125" y1="38" x2="145" y2="85" stroke={goldColor} strokeWidth="2.5" />
      {/* Scale Pan Left */}
      <path d="M 98 85 Q 125 110 152 85 Z" fill={goldColor} />

      {/* Hanging Strings Right */}
      <line x1="175" y1="38" x2="155" y2="85" stroke={goldColor} strokeWidth="2.5" />
      <line x1="175" y1="38" x2="195" y2="85" stroke={goldColor} strokeWidth="2.5" />
      {/* Scale Pan Right */}
      <path d="M 148 85 Q 175 110 202 85 Z" fill={goldColor} />

      {/* Central Column Base & Pillar */}
      {/* Pillar Body Outer Lines */}
      <line x1="138" y1="50" x2="138" y2="215" stroke={tealColor} strokeWidth="3" />
      <line x1="162" y1="50" x2="162" y2="215" stroke={tealColor} strokeWidth="3" />
      
      {/* Inner White Column with Vertical SUOOD text */}
      <rect x="140" y="52" width="20" height="160" fill={whiteOrTeal} stroke={tealColor} strokeWidth="2" rx="2" />
      
      {/* SUOOD Letters inside column */}
      <g fill={textColor} textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="19">
        <text x="150" y="78">S</text>
        <text x="150" y="108">U</text>
        <text x="150" y="138">O</text>
        <text x="150" y="168">O</text>
        <text x="150" y="198">D</text>
      </g>

      {/* Side Decorative Columns */}
      <line x1="130" y1="130" x2="130" y2="215" stroke={goldColor} strokeWidth="3" />
      <line x1="170" y1="130" x2="170" y2="215" stroke={goldColor} strokeWidth="3" />

      {/* Base Pedestal */}
      <rect x="115" y="215" width="70" height="8" fill={tealColor} rx="2" />
      <rect x="105" y="223" width="90" height="6" fill={goldColor} rx="2" />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  mode = 'light',
  className = '',
  size = 'md'
}) => {
  const isDark = mode === 'dark';
  const tealClass = isDark ? 'text-teal-300' : 'text-[#0c4a47]';
  const goldClass = isDark ? 'text-amber-200' : 'text-[#b89b6a]';
  const subTextClass = isDark ? 'text-slate-300' : 'text-slate-600';

  const emblemSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };

  if (variant === 'emblem') {
    return <FirmEmblemSVG mode={mode} className={`${emblemSizes[size]} ${className}`} />;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`} dir="rtl">
        <FirmEmblemSVG mode={mode} className={`${emblemSizes[size]} shrink-0`} />
        <div className="flex flex-col text-right leading-tight">
          <span className={`font-black tracking-tight text-base sm:text-lg ${tealClass}`}>
            سعود أحمد الشحي
          </span>
          <span className={`text-[11px] sm:text-xs font-bold ${goldClass}`}>
            للمحاماة والاستشارات القانونية
          </span>
          <span className="text-[9px] font-semibold tracking-wider text-slate-400 mt-0.5">
            SUOOD AHMED ALSHEHHI
          </span>
        </div>
      </div>
    );
  }

  // Full Variant (Stacked Logo)
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`} dir="rtl">
      <FirmEmblemSVG mode={mode} className={`${emblemSizes[size]} mb-2`} />
      
      {/* Arabic Main Name */}
      <h1 className={`font-black tracking-tight text-xl sm:text-2xl md:text-3xl leading-snug ${tealClass}`}>
        سعود أحمد الشحي
      </h1>
      
      {/* Arabic Subtitle */}
      <p className={`font-bold text-xs sm:text-sm md:text-base tracking-normal mt-0.5 ${goldClass}`}>
        للمحاماة والاستشارات القانونية
      </p>

      {/* English Main Name */}
      <h2 className={`font-extrabold tracking-widest text-xs sm:text-sm uppercase mt-1.5 ${tealClass}`}>
        SUOOD AHMED ALSHEHHI
      </h2>

      {/* English Subtitle */}
      <p className={`font-semibold tracking-widest text-[10px] sm:text-xs uppercase mt-0.5 ${goldClass}`}>
        ADVOCATES & LEGAL CONSULTANTS
      </p>
    </div>
  );
};

export default Logo;
