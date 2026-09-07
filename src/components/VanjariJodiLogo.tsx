import React from 'react';
import { useApp } from '../context/AppContext';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'emblem' | 'full' | 'stacked' | 'horizontal';
  themeColor?: 'saffron' | 'gold' | 'light';
  showSubtitle?: boolean;
  autoCompactOnMobile?: boolean;
}

export const VanjariJodiLogo: React.FC<LogoProps> = ({
  className = '',
  size = 40,
  variant = 'full',
  showSubtitle = true,
  autoCompactOnMobile = false,
}) => {
  const { siteConfig, language } = useApp();
  const [imgError, setImgError] = React.useState(false);

  const customLogoUrl = siteConfig?.logoUrl || '/logo.png';
  const scalePercent = Number(siteConfig?.logoScalePercent) || 100;
  const scaleFactor = Math.max(0.4, Math.min(2.5, scalePercent / 100));
  
  // Effective size scaled by admin config
  const effectiveSize = Math.round(size * scaleFactor);

  const isEnglish = language === 'en';
  const logoTitle = isEnglish 
    ? (siteConfig?.logoTitleEn || 'Vanjari Jodi') 
    : (siteConfig?.logoTitle || 'वंजारी जोडी');
  const logoSubtitle = isEnglish 
    ? (siteConfig?.logoSubtitleEn || 'Matrimony & Matchmaking') 
    : (siteConfig?.logoSubtitle || 'वर-वधू शोध');
  const hideLogoText = siteConfig?.hideLogoText || false;

  React.useEffect(() => {
    setImgError(false);
  }, [customLogoUrl]);

  // Authentic Bhagwan Baba Portrait
  const bhagwanBabaImg = "https://upload.wikimedia.org/wikipedia/commons/5/50/Bhagawanbaba.png";

  // SVG Official Royal Circular Emblem matching the user's official insignia
  const renderSVGEmblem = (extraClass = '') => {
    const emblemSize = variant === 'full' ? Math.min(effectiveSize, 46) : effectiveSize;
    return (
      <svg
        viewBox="0 0 400 400"
        style={{ width: `${emblemSize}px`, height: `${emblemSize}px` }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 object-contain select-none drop-shadow-md ${extraClass}`}
      >
        <defs>
          {/* Deep Royal Crimson Radial Background */}
          <radialGradient id="vjMaroonRadial" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#7A0A19" />
            <stop offset="60%" stopColor="#4D040E" />
            <stop offset="100%" stopColor="#2A0106" />
          </radialGradient>

          {/* Radiant Sunburst Halo for Saint */}
          <radialGradient id="vjSunburst" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FFD54F" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#FF8F00" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7A0A19" stopOpacity="0" />
          </radialGradient>

          {/* Premium Metallic Gold Gradient */}
          <linearGradient id="vjGoldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="20%" stopColor="#FDD835" />
            <stop offset="45%" stopColor="#FFEE58" />
            <stop offset="70%" stopColor="#F57F17" />
            <stop offset="90%" stopColor="#FFF59D" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          {/* Saffron Turban Gradient */}
          <linearGradient id="vjSaffronPheta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9800" />
            <stop offset="40%" stopColor="#FF6D00" />
            <stop offset="75%" stopColor="#E65100" />
            <stop offset="100%" stopColor="#BF360C" />
          </linearGradient>

          {/* Skin Tone Gradient for Saint Baba */}
          <linearGradient id="vjSkinTone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD180" />
            <stop offset="60%" stopColor="#FFB74D" />
            <stop offset="100%" stopColor="#FFA726" />
          </linearGradient>

          {/* Dark Gold Gradient for Shadows & Borders */}
          <linearGradient id="vjGoldDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9A825" />
            <stop offset="50%" stopColor="#E65100" />
            <stop offset="100%" stopColor="#5D4037" />
          </linearGradient>

          {/* 3D Emboss Text Filter */}
          <filter id="vjGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* 1. OUTER GOLDEN FILIGREE RIM */}
        <circle cx="200" cy="200" r="196" fill="url(#vjGoldMetallic)" />
        <circle cx="200" cy="200" r="191" fill="#2A0106" />
        <circle cx="200" cy="200" r="187" fill="url(#vjGoldDark)" />

        {/* 2. INNER CRIMSON CIRCULAR DISK */}
        <circle cx="200" cy="200" r="182" fill="url(#vjMaroonRadial)" />

        {/* Triangular & Beaded Border Filigree (Ray Teeth) */}
        {[...Array(36)].map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const x1 = 200 + 185 * Math.cos(angle);
          const y1 = 200 + 185 * Math.sin(angle);
          return (
            <circle key={i} cx={x1} cy={y1} r="2" fill="#FFE082" />
          );
        })}
        <circle cx="200" cy="200" r="183" stroke="url(#vjGoldMetallic)" strokeWidth="1.5" strokeDasharray="3 4" />
        <circle cx="200" cy="200" r="177" stroke="#FFE082" strokeWidth="1" opacity="0.5" />

        {/* Sacred Temple Silhouettes in Backdrop */}
        <g opacity="0.22" fill="#FFE082">
          {/* Left Temple Shikhara */}
          <polygon points="90,185 105,130 120,185" />
          <polygon points="100,135 105,115 110,135" />
          {/* Right Temple Shikhara */}
          <polygon points="280,185 295,130 310,185" />
          <polygon points="290,135 295,115 300,135" />
        </g>

        {/* 3. SHINING HALO FOR SAINT BHAGWAN BABA */}
        <circle cx="200" cy="118" r="76" fill="url(#vjSunburst)" />

        {/* Halo Radial Ray Lines */}
        {[...Array(28)].map((_, i) => {
          const angle = (i * 12.85 * Math.PI) / 180;
          const x1 = 200 + 40 * Math.cos(angle);
          const y1 = 118 + 40 * Math.sin(angle);
          const x2 = 200 + 72 * Math.cos(angle);
          const y2 = 118 + 72 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FFE082"
              strokeWidth="1.2"
              opacity="0.4"
            />
          );
        })}

        {/* 4. FLANKING CALLIGRAPHY */}
        {/* Left: संस्कार आपले... */}
        <g filter="url(#vjGoldGlow)">
          <text
            x="84"
            y="110"
            fill="#FFF9C4"
            fontSize="15"
            fontWeight="900"
            fontFamily="'Baloo 2', 'Yatra One', serif"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            संस्कार
          </text>
          <text
            x="84"
            y="130"
            fill="#FFD54F"
            fontSize="14"
            fontWeight="900"
            fontFamily="'Baloo 2', 'Yatra One', serif"
            textAnchor="middle"
          >
            आपले...
          </text>
        </g>

        {/* Right: संबंध आपले... */}
        <g filter="url(#vjGoldGlow)">
          <text
            x="316"
            y="110"
            fill="#FFF9C4"
            fontSize="15"
            fontWeight="900"
            fontFamily="'Baloo 2', 'Yatra One', serif"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            संबंध
          </text>
          <text
            x="316"
            y="130"
            fill="#FFD54F"
            fontSize="14"
            fontWeight="900"
            fontFamily="'Baloo 2', 'Yatra One', serif"
            textAnchor="middle"
          >
            आपले...
          </text>
        </g>

        {/* 5. SHRI SANT BHAGWAN BABA SEATED PORTRAIT WITH SAFFRON PHETA & GARLAND */}
        <g transform="translate(200, 118)">
          {/* Circular Golden Ring Frame */}
          <circle cx="0" cy="-6" r="48" fill="url(#vjGoldDark)" stroke="url(#vjGoldMetallic)" strokeWidth="2.5" filter="url(#vjGoldGlow)" />
          <circle cx="0" cy="-6" r="45" fill="#4A020B" />

          {/* Saint Bhagwan Baba Illustrated Portrait */}
          <g transform="translate(0, -6)">
            {/* White Kurta Body */}
            <path
              d="M -36,44 C -36,22 -20,18 0,18 C 20,18 36,22 36,44 Z"
              fill="#FAFAFA"
              stroke="#E0E0E0"
              strokeWidth="1"
            />
            {/* Kurta Neckline */}
            <path d="M -8,18 L 0,30 L 8,18" fill="none" stroke="#FFD54F" strokeWidth="1.5" />

            {/* Neck & Face */}
            <path d="M -8,14 L -8,22 C -8,25 8,25 8,22 L 8,14 Z" fill="url(#vjSkinTone)" />
            <ellipse cx="0" cy="5" rx="17" ry="19" fill="url(#vjSkinTone)" />

            {/* Saffron Pheta (Turban) */}
            <g>
              {/* Turban Base / Head wrap */}
              <path
                d="M -22,-3 C -26,-15 -12,-32 0,-34 C 12,-32 26,-15 22,-3 C 18,2 -18,2 -22,-3 Z"
                fill="url(#vjSaffronPheta)"
              />
              {/* Turban Folds / Pleats */}
              <path
                d="M -20,-8 C -10,-24 10,-24 20,-8 C 10,-18 -10,-18 -20,-8 Z"
                fill="#FF6D00"
                opacity="0.8"
              />
              <path
                d="M -16,-18 C -5,-30 5,-30 16,-18"
                stroke="#FFD54F"
                strokeWidth="1"
                fill="none"
              />
              {/* Turban Top Peak / Shira */}
              <path
                d="M -8,-28 C -3,-38 3,-38 8,-28 Z"
                fill="#FFA000"
              />
            </g>

            {/* Facial Features */}
            {/* Eyes & Brows */}
            <path d="M -10,1 C -7,-2 -3,-2 0,0" stroke="#3E2723" strokeWidth="1.2" fill="none" />
            <path d="M 0,0 C 3,-2 7,-2 10,1" stroke="#3E2723" strokeWidth="1.2" fill="none" />
            <ellipse cx="-5" cy="4" rx="2" ry="1.5" fill="#212121" />
            <ellipse cx="5" cy="4" rx="2" ry="1.5" fill="#212121" />

            {/* Tilak on Forehead (White Chandan Urdhvapundra + Red Chandan) */}
            <path d="M -2,-8 L -2,0 L 2,0 L 2,-8 Z" fill="#FFFDE7" />
            <circle cx="0" cy="-3" r="1.5" fill="#C62828" />

            {/* Nose */}
            <path d="M 0,3 L 0,9 L 2,10" stroke="#E65100" strokeWidth="1" fill="none" />

            {/* Moustache */}
            <path
              d="M -9,12 C -4,11 0,13 0,13 C 0,13 4,11 9,12 C 6,15 0,15 0,15 C 0,15 -6,15 -9,12 Z"
              fill="#212121"
            />

            {/* Fragrant Green Tulsi / Bel Leaf Garland */}
            <path
              d="M -24,24 C -12,38 12,38 24,24 C 14,34 -14,34 -24,24 Z"
              fill="#2E7D32"
              stroke="#1B5E20"
              strokeWidth="1"
            />
            {/* White Floral Garland (Mogra) */}
            <path
              d="M -28,30 C -14,46 14,46 28,30 C 16,42 -16,42 -28,30 Z"
              fill="#FFFDE7"
              stroke="#FBC02D"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
          </g>
        </g>

        {/* 6. CENTRAL GOLDEN HEART MEDALLION (BRIDE & GROOM SILHOUETTES) */}
        <g transform="translate(200, 180)" filter="url(#vjGoldGlow)">
          {/* Outer Golden Heart Rim */}
          <path
            d="M 0,-8 C -32,-42 -60,0 0,44 C 60,0 32,-42 0,-8 Z"
            fill="url(#vjGoldMetallic)"
            stroke="#FFF9C4"
            strokeWidth="2.5"
          />

          {/* Inner Maroon Heart Cavity */}
          <path
            d="M 0,-4 C -26,-34 -48,2 0,37 C 48,2 26,-34 0,-4 Z"
            fill="#3B0108"
          />

          {/* Groom Silhouette (Left in Heart) with Marathi Pheta */}
          <g transform="translate(-16, 12) scale(0.75)">
            {/* Groom Face */}
            <path
              d="M -6,2 C -12,-8 2,-14 10,-6 C 12,2 6,10 -2,13 C -5,15 -10,8 -6,2 Z"
              fill="#FFE082"
            />
            {/* Groom Pheta */}
            <path
              d="M -5,-5 C -10,-15 8,-18 14,-8 Z"
              fill="#FFA000"
            />
            {/* Groom Torso / Kurta */}
            <path
              d="M -8,14 C -10,24 14,24 12,14 Z"
              fill="#FFE082"
            />
          </g>

          {/* Bride Silhouette (Right in Heart) with Traditional Bun & Ornaments */}
          <g transform="translate(16, 12) scale(0.75)">
            {/* Bride Face */}
            <path
              d="M 6,2 C 12,-8 -2,-14 -10,-6 C -12,2 -6,10 2,13 C 5,15 10,8 6,2 Z"
              fill="#FFE082"
            />
            {/* Hair Bun with Shevanti Flowers */}
            <circle cx="10" cy="-4" r="5" fill="#FFF9C4" />
            <circle cx="10" cy="-4" r="2.5" fill="#FFA000" />
            {/* Bride Saree Pallu & Torso */}
            <path
              d="M 8,14 C 10,24 -14,24 -12,14 Z"
              fill="#FFE082"
            />
          </g>
        </g>

        {/* 7. ORNAMENTAL GOLDEN WINGS & FILIGREE EMBELLISHMENTS */}
        <g filter="url(#vjGoldGlow)">
          {/* Left Flourish */}
          <path
            d="M 55,232 C 100,216 135,226 168,236 C 125,241 90,248 55,232 Z"
            fill="url(#vjGoldMetallic)"
          />
          {/* Right Flourish */}
          <path
            d="M 345,232 C 300,216 265,226 232,236 C 275,241 310,248 345,232 Z"
            fill="url(#vjGoldMetallic)"
          />
        </g>

        {/* 8. 3D GOLDEN BOLD CALLIGRAPHY: "वंजारी जोडी™" */}
        <g filter="url(#vjGoldGlow)">
          {/* Dark 3D Shadow Backdrop */}
          <text
            x="200"
            y="262"
            fill="#1E0105"
            fontSize="48"
            fontWeight="900"
            fontFamily="'Baloo 2', 'Yatra One', 'Rozha One', serif"
            textAnchor="middle"
            stroke="#1E0105"
            strokeWidth="9"
            strokeLinejoin="round"
          >
            वंजारी जोडी
          </text>
          {/* Golden Stroke Contour */}
          <text
            x="200"
            y="260"
            fill="#6A0815"
            fontSize="48"
            fontWeight="900"
            fontFamily="'Baloo 2', 'Yatra One', 'Rozha One', serif"
            textAnchor="middle"
            stroke="url(#vjGoldMetallic)"
            strokeWidth="5"
            strokeLinejoin="round"
          >
            वंजारी जोडी
          </text>
          {/* Primary Golden Metallic Text */}
          <text
            x="200"
            y="260"
            fill="url(#vjGoldMetallic)"
            fontSize="48"
            fontWeight="900"
            fontFamily="'Baloo 2', 'Yatra One', 'Rozha One', serif"
            textAnchor="middle"
            letterSpacing="1.2"
          >
            वंजारी जोडी
          </text>
          {/* Trademark Sign */}
          <text
            x="345"
            y="234"
            fill="#FFE082"
            fontSize="11"
            fontWeight="bold"
          >
            TM
          </text>
        </g>

        {/* 9. ARCHED GOLDEN BANNER: "वधू-वर परिचय केंद्र" */}
        <g transform="translate(200, 296)" filter="url(#vjGoldGlow)">
          {/* Banner Body */}
          <path
            d="M -130,-15 L 130,-15 C 142,-15 148,-4 138,9 L 130,16 L -130,16 L -138,9 C -148,-4 -142,-15 -130,-15 Z"
            fill="url(#vjGoldMetallic)"
            stroke="#FFF9C4"
            strokeWidth="1.8"
          />
          {/* Banner Fold Ribbons */}
          <polygon points="-142,-7 -158,-14 -152,3 -158,18 -138,9" fill="#D87A00" />
          <polygon points="142,-7 158,-14 152,3 158,18 138,9" fill="#D87A00" />

          {/* Banner Text */}
          <text
            x="0"
            y="7"
            fill="#54040D"
            fontSize="20"
            fontWeight="900"
            fontFamily="'Baloo 2', 'Yatra One', serif"
            textAnchor="middle"
            letterSpacing="1"
          >
            वधू-वर परिचय केंद्र
          </text>
        </g>

        {/* 10. SUBTEXT: "पवित्र व संस्कारयुक्त नात्यांची सुंदर सुरुवात" */}
        <g filter="url(#vjGoldGlow)">
          <text
            x="200"
            y="336"
            fill="#FFF9C4"
            fontSize="13"
            fontWeight="800"
            fontFamily="'Baloo 2', sans-serif"
            textAnchor="middle"
            letterSpacing="0.4"
          >
            पवित्र व संस्कारयुक्त नात्यांची सुंदर सुरुवात
          </text>
        </g>

        {/* 11. INTERLOCKING GOLDEN WEDDING RINGS AT BOTTOM */}
        <g transform="translate(200, 364)" filter="url(#vjGoldGlow)">
          {/* Left Ring */}
          <ellipse
            cx="-9"
            cy="0"
            rx="15"
            ry="10"
            fill="none"
            stroke="url(#vjGoldMetallic)"
            strokeWidth="3.8"
          />
          {/* Right Ring Interlocking */}
          <ellipse
            cx="9"
            cy="0"
            rx="15"
            ry="10"
            fill="none"
            stroke="#FFE082"
            strokeWidth="3.8"
          />
          {/* Small Diamond Accent */}
          <polygon points="9,-9 13,-14 9,-19 5,-14" fill="#FFF9C4" />
        </g>

        {/* Bottom Filigree Flourish Leaves */}
        <path
          d="M 155,372 Q 178,382 200,372 Q 222,382 245,372"
          stroke="url(#vjGoldMetallic)"
          strokeWidth="2.2"
          fill="none"
        />
      </svg>
    );
  };

  // If custom logo URL is provided by admin or local logo file exists:
  const renderCustomLogoImg = (imgHeight = effectiveSize) => {
    const isEmblem = variant === 'emblem';
    const adjustedHeight = isEmblem ? imgHeight : (variant === 'full' ? Math.min(imgHeight, 46) : imgHeight);
    
    if (isEmblem) {
      return (
        <div 
          className="inline-flex items-center justify-center shrink-0 select-none transition-all duration-300"
          style={{ 
            width: `${adjustedHeight}px`,
            height: `${adjustedHeight}px`,
          }}
        >
          <img
            src={customLogoUrl}
            alt={logoTitle}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            className="shrink-0 drop-shadow-md rounded-full select-none"
            referrerPolicy="no-referrer"
            onError={() => {
              setImgError(true);
            }}
          />
        </div>
      );
    }

    return (
      <div 
        className="flex items-center justify-center bg-white/95 backdrop-blur-md rounded-xl px-1.5 py-0.5 shadow-xs border border-amber-300/80 shrink-0 select-none overflow-hidden transition-all duration-300"
        style={{ 
          height: `${adjustedHeight}px`,
          minWidth: `${adjustedHeight}px`,
          maxWidth: `${adjustedHeight * 3}px`,
        }}
      >
        <img
          src={customLogoUrl}
          alt={logoTitle}
          style={{ 
            maxHeight: `${Math.round(adjustedHeight * 0.9)}px`,
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

  const logoGraphic = (customLogoUrl && !imgError) ? renderCustomLogoImg(effectiveSize) : renderSVGEmblem();

  // If set to hide text or variant is emblem, only render the image/graphic itself
  if (variant === 'emblem' || hideLogoText) {
    return <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>{logoGraphic}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center space-y-1.5 px-2 ${className}`}>
        <div className="relative transform hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0">
          {logoGraphic}
        </div>

        <div className="flex flex-col items-center">
          <span 
            className="text-xl sm:text-2xl font-black tracking-wide select-none transition-all leading-normal drop-shadow-xs"
            style={{
              fontFamily: "'Yatra One', 'Rozha One', 'Baloo 2', serif",
              color: '#800C1E',
              textShadow: '0 1px 0 #FFE082, 0 2px 4px rgba(128, 12, 30, 0.2)'
            }}
          >
            {logoTitle}
          </span>
          {showSubtitle && (
            <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-[#00695C] bg-amber-50/90 px-2.5 py-0.5 rounded-full border border-amber-300/80 mt-1 shadow-2xs">
              {logoSubtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default 'full' or 'horizontal' brand logo layout with pristine typography and responsiveness
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 max-h-[48px] shrink-0 select-none ${className}`}>
      <div className="relative shrink-0 transform group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
        {logoGraphic}
      </div>

      <div className="flex flex-col min-w-0 justify-center">
        <div className="flex items-center gap-1.5">
          <span 
            className="text-base xs:text-lg sm:text-xl md:text-2xl font-black leading-none whitespace-nowrap tracking-wide select-none transition-all"
            style={{
              fontFamily: "'Yatra One', 'Rozha One', 'Baloo 2', serif",
              color: '#800C1E',
              letterSpacing: '0.01em',
              textShadow: '0 1px 0 rgba(255, 224, 130, 0.8), 0 2px 5px rgba(128, 12, 30, 0.15)'
            }}
          >
            {logoTitle}
          </span>
          <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-[#800C1E] border border-amber-300/80 font-black uppercase tracking-wider shadow-2xs shrink-0 hidden md:inline-block leading-none">
            {language === 'en' ? 'Official' : 'अधिकृत'}
          </span>
        </div>

        {showSubtitle && (
          <div className="mt-0.5">
            <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-[#00695C] leading-none whitespace-nowrap tracking-tight">
              {logoSubtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

