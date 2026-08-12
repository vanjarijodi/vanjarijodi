import React from 'react';
import { useApp } from '../context/AppContext';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'emblem' | 'full' | 'stacked' | 'horizontal';
  themeColor?: 'saffron' | 'gold' | 'light';
  showSubtitle?: boolean;
}

export const VanjariJodiLogo: React.FC<LogoProps> = ({
  className = '',
  size = 54,
  variant = 'full',
  showSubtitle = true,
}) => {
  const { siteConfig, language } = useApp();
  const [imgError, setImgError] = React.useState(false);

  const customLogoUrl = siteConfig?.logoUrl;
  const logoTitle = siteConfig?.logoTitle || 'वंजारी जोडी';
  const logoSubtitle = siteConfig?.logoSubtitle || 'वर-वधू शोध';
  const hideLogoText = siteConfig?.hideLogoText || false;

  React.useEffect(() => {
    setImgError(false);
  }, [customLogoUrl]);

  // SVG Emblem matching the Bride & Groom Heart-Circle Emblem
  const renderSVGEmblem = (extraClass = '') => (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${extraClass} ${className}`}
    >
      <defs>
        {/* Soft Background Radial */}
        <radialGradient id="vjBgSoft" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="100%" stopColor="#FFF7EC" />
        </radialGradient>

        {/* Orange Arc Gradient */}
        <linearGradient id="vjOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9100" />
          <stop offset="50%" stopColor="#E65100" />
          <stop offset="100%" stopColor="#BF360C" />
        </linearGradient>

        {/* Teal Arc Gradient */}
        <linearGradient id="vjTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#26A69A" />
          <stop offset="50%" stopColor="#00695C" />
          <stop offset="100%" stopColor="#004D40" />
        </linearGradient>

        {/* Gold Accent */}
        <linearGradient id="vjGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>

        {/* Soft Shadow */}
        <filter id="vjSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#800C1E" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Outer Soft Circle Background */}
      <circle cx="120" cy="120" r="110" fill="url(#vjBgSoft)" filter="url(#vjSoftShadow)" />

      {/* Outer Ornate Circular Border */}
      <circle cx="120" cy="120" r="102" stroke="url(#vjTealGrad)" strokeWidth="3" />
      <circle cx="120" cy="120" r="96" stroke="url(#vjOrangeGrad)" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
      <circle cx="120" cy="120" r="92" stroke="url(#vjGoldGrad)" strokeWidth="1.5" />

      {/* Decorative Ornate Beads around Outer Ring */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 120 + 99 * Math.cos(rad);
        const cy = 120 + 99 * Math.sin(rad);
        return (
          <circle key={i} cx={cx} cy={cy} r="3" fill={i % 2 === 0 ? "#E65100" : "#00695C"} />
        );
      })}

      {/* Auspicious Star / Bindi Accent Above */}
      <polygon points="120,38 122.5,45 130,45 124,49.5 126.5,57 120,52.5 113.5,57 116,49.5 110,45 117.5,45" fill="url(#vjOrangeGrad)" />

      {/* Flowing Interlocking Heart Loops (Orange & Teal) */}
      <g strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Left Orange Heart Loop */}
        <path
          d="M 120,185 C 80,185 45,150 45,115 C 45,85 70,65 95,75 C 110,81 120,95 120,105"
          stroke="url(#vjOrangeGrad)"
        />
        {/* Right Teal Heart Loop */}
        <path
          d="M 120,185 C 160,185 195,150 195,115 C 195,85 170,65 145,75 C 130,81 120,95 120,105"
          stroke="url(#vjTealGrad)"
        />
      </g>

      {/* BRIDE ILLUSTRATION (Left) */}
      <g id="bride">
        {/* Head / Ghunghat */}
        <path d="M 68,98 C 68,82 82,72 96,82 C 92,98 88,112 85,125 C 75,122 68,112 68,98 Z" fill="#00695C" />
        <path d="M 72,92 C 72,84 80,78 90,82" stroke="#FFD54F" strokeWidth="2" fill="none" />
        {/* Face */}
        <circle cx="85" cy="98" r="10" fill="#FFCC80" />
        {/* Bindi */}
        <circle cx="89" cy="95" r="1.5" fill="#C62828" />
        {/* Saree / Torso */}
        <path d="M 76,112 Q 85,110 95,120 Q 90,138 80,135 Z" fill="#004D40" stroke="#FFB300" strokeWidth="1" />
        {/* Gold Necklace */}
        <path d="M 80,108 Q 85,114 90,108" fill="none" stroke="#FFD54F" strokeWidth="2" />
      </g>

      {/* GROOM ILLUSTRATION (Right) */}
      <g id="groom">
        {/* Turban / Pheta */}
        <path d="M 144,82 C 144,72 156,68 168,74 C 172,82 168,92 162,96 C 150,96 144,90 144,82 Z" fill="#E65100" />
        <path d="M 148,76 Q 160,72 166,80" stroke="#FFD54F" strokeWidth="2" fill="none" />
        {/* Face */}
        <circle cx="155" cy="98" r="10" fill="#FFCC80" />
        {/* Kurta / Torso */}
        <path d="M 145,112 Q 155,110 165,120 Q 160,138 150,135 Z" fill="#FFA000" stroke="#E65100" strokeWidth="1" />
      </g>

      {/* JOINED HANDS (NAMASTE GESTURE IN CENTER) */}
      <g transform="translate(120, 115)">
        <path
          d="M -6,10 L -2,-4 C -2,-8 2,-8 2,-4 L 6,10 C 2,13 -2,13 -6,10 Z"
          fill="#FFE0B2"
          stroke="#E65100"
          strokeWidth="1"
        />
        {/* Heart icon inside hands */}
        <path
          d="M 0,2 C -3,-2 -7,1 0,6 C 7,1 3,-2 0,2 Z"
          fill="#E65100"
        />
      </g>

      {/* Decorative Golden Heart Bottom Center */}
      <path
        d="M 120,140 C 110,128 92,138 108,154 L 120,166 L 132,154 C 148,138 130,128 120,140 Z"
        fill="url(#vjGoldGrad)"
        opacity="0.95"
      />
      <path
        d="M 120,145 C 114,136 102,142 112,153 L 120,160 L 128,153 C 138,142 126,136 120,145 Z"
        fill="#E65100"
      />
    </svg>
  );

  // If custom logo URL is provided by admin, wrap it inside a beautiful container
  // that provides perfect contrast on any background (light or dark) and maintains ratio.
  const renderCustomLogoImg = (imgHeight = size) => {
    const adjustedHeight = imgHeight;
    return (
      <div 
        className="flex items-center justify-center bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-amber-300/80 shrink-0 select-none overflow-hidden transition-all duration-300 hover:shadow-md"
        style={{ 
          height: `${adjustedHeight}px`,
          minWidth: `${adjustedHeight}px`,
          maxWidth: '220px', // Prevent super wide logo from pushing other header elements
        }}
      >
        <img
          src={customLogoUrl}
          alt={logoTitle}
          style={{ 
            maxHeight: '100%',
            maxWidth: '100%',
          }}
          className="object-contain shrink-0"
          referrerPolicy="no-referrer"
          onError={() => {
            setImgError(true);
          }}
        />
      </div>
    );
  };

  const logoGraphic = (customLogoUrl && !imgError) ? renderCustomLogoImg(size) : renderSVGEmblem();

  // If set to hide text or variant is emblem, only render the image/graphic itself
  if (variant === 'emblem' || hideLogoText) {
    return <div className={`inline-flex items-center shrink-0 ${className}`}>{logoGraphic}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center space-y-2 ${className}`}>
        <div className="relative transform hover:scale-105 transition-transform duration-300">
          {logoGraphic}
        </div>

        <div className="flex flex-col items-center">
          <span 
            className="text-2xl sm:text-4xl font-normal tracking-wide select-none transition-all leading-normal drop-shadow-xs"
            style={{
              fontFamily: "'Yatra One', serif",
              color: '#A71930',
              textShadow: '1px 1px 0px #FFE082, 2px 2px 0px #FFB300, 4px 4px 10px rgba(167, 25, 48, 0.25)'
            }}
          >
            {logoTitle}
          </span>
          {showSubtitle && (
            <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-[#00695C] bg-amber-50 px-3 py-1 rounded-full border border-amber-300 mt-1.5 shadow-2xs">
              {logoSubtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default 'full' or 'horizontal' brand logo layout
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 ${className}`}>
      <div className="relative shrink-0 transform hover:scale-105 transition-transform duration-300">
        {logoGraphic}
      </div>

      <div className="flex flex-col min-w-0 justify-center">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span 
            className="text-lg sm:text-2xl md:text-3xl lg:text-3.5xl font-normal leading-tight whitespace-nowrap tracking-wide select-none transition-all"
            style={{
              fontFamily: "'Yatra One', serif",
              color: '#A71930',
              textShadow: '1px 1px 0px #FFE082, 1.5px 1.5px 0px #FFB300, 3px 3px 6px rgba(167, 25, 48, 0.2)'
            }}
          >
            {logoTitle}
          </span>
          <span className="text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-[#800C1E] border border-amber-300 font-black uppercase tracking-wider shadow-xs shrink-0 hidden sm:inline-block">
            {language === 'en' ? 'Official' : 'अधिकृत'}
          </span>
        </div>

        {showSubtitle && (
          <div className="mt-0.5">
            <p className="text-[9px] sm:text-xs font-black text-[#00695C]/90 leading-none whitespace-nowrap tracking-wider">
              {logoSubtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

