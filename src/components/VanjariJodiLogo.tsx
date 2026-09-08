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
}) => {
  const { siteConfig, language } = useApp();
  const [imgError, setImgError] = React.useState(false);

  const customLogoUrl = siteConfig?.logoUrl || '/vanjari-jodi-official-logo.png';
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

  // Official Royal Circular Emblem matching the user's ChatGPT insignia
  const renderSVGEmblem = (extraClass = '') => {
    const emblemSize = variant === 'full' ? Math.min(effectiveSize, 46) : effectiveSize;
    return (
      <img
        src="/vanjari-jodi-official-logo.png"
        alt={logoTitle}
        style={{ width: `${emblemSize}px`, height: `${emblemSize}px` }}
        className={`inline-block shrink-0 object-contain select-none drop-shadow-md rounded-full ${extraClass}`}
        referrerPolicy="no-referrer"
      />
    );
  };

  // If custom logo URL is provided by admin or local logo file exists:
  const renderCustomLogoImg = (imgHeight = effectiveSize) => {
    const isEmblem = variant === 'emblem';
    const adjustedHeight = isEmblem ? imgHeight : (variant === 'full' ? Math.min(imgHeight, 46) : imgHeight);
    
    return (
      <div 
        className="inline-flex items-center justify-center shrink-0 select-none transition-all duration-300 rounded-full"
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
