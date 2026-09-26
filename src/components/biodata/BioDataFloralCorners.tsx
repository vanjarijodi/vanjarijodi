import React from 'react';

interface FloralCornersProps {
  variant?: 'floral' | 'royal_corner' | 'minimal';
  primaryColor?: string;
  accentColor?: string;
}

export const BioDataFloralCorners: React.FC<FloralCornersProps> = ({
  variant = 'floral',
  primaryColor = '#BE123C',
  accentColor = '#D97706',
}) => {
  if (variant === 'floral') {
    return (
      <>
        {/* Top-Right Floral Corner */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '95px',
            height: '95px',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.85,
          }}
        >
          <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(60, -60)">
              {/* Golden Foliage / Leaves */}
              <path
                d="M100 60 C80 90, 40 100, 20 120 C40 110, 80 115, 100 60 Z"
                fill="#FBBF24"
                opacity="0.85"
              />
              <path
                d="M130 90 C110 120, 80 135, 50 150 C70 140, 110 135, 130 90 Z"
                fill="#F59E0B"
                opacity="0.85"
              />
              <path
                d="M110 40 C70 50, 50 80, 30 110 C60 85, 90 70, 110 40 Z"
                fill="#D97706"
                opacity="0.75"
              />
              {/* Main Peach / Rose Blossom */}
              <circle cx="115" cy="85" r="32" fill="#FDA4AF" opacity="0.95" />
              <circle cx="120" cy="80" r="24" fill="#F43F5E" opacity="0.9" />
              <circle cx="116" cy="84" r="18" fill="#E11D48" opacity="0.95" />
              <circle cx="118" cy="82" r="11" fill="#BE123C" />
              <circle cx="120" cy="80" r="5" fill="#FFE4E6" />
              
              {/* Secondary Blossom */}
              <circle cx="70" cy="115" r="22" fill="#FECDD3" opacity="0.9" />
              <circle cx="72" cy="113" r="15" fill="#FB7185" opacity="0.95" />
              <circle cx="70" cy="115" r="9" fill="#E11D48" />

              {/* Little Flower Buds */}
              <circle cx="45" cy="145" r="12" fill="#FDA4AF" />
              <circle cx="46" cy="144" r="6" fill="#BE123C" />
              <circle cx="140" cy="45" r="14" fill="#FB7185" />
              <circle cx="141" cy="44" r="7" fill="#881337" />

              {/* Golden Leaf Spikes */}
              <path d="M145 75 Q165 70 180 55 Q165 80 145 75 Z" fill="#FBBF24" />
              <path d="M95 130 Q85 155 70 170 Q85 145 95 130 Z" fill="#F59E0B" />
            </g>
          </svg>
        </div>

        {/* Bottom-Left Floral Corner */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '90px',
            height: '90px',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.85,
            transform: 'rotate(180deg)',
          }}
        >
          <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(40, -40)">
              {/* Golden Foliage */}
              <path
                d="M100 60 C80 90, 40 100, 20 120 C40 110, 80 115, 100 60 Z"
                fill="#FBBF24"
                opacity="0.85"
              />
              <path
                d="M130 90 C110 120, 80 135, 50 150 C70 140, 110 135, 130 90 Z"
                fill="#F59E0B"
                opacity="0.85"
              />
              {/* Rose Blossom */}
              <circle cx="115" cy="85" r="30" fill="#FDA4AF" opacity="0.95" />
              <circle cx="120" cy="80" r="22" fill="#F43F5E" opacity="0.9" />
              <circle cx="116" cy="84" r="16" fill="#E11D48" opacity="0.95" />
              <circle cx="118" cy="82" r="10" fill="#BE123C" />
              <circle cx="120" cy="80" r="4" fill="#FFE4E6" />
              
              <circle cx="70" cy="115" r="20" fill="#FECDD3" opacity="0.9" />
              <circle cx="72" cy="113" r="14" fill="#FB7185" opacity="0.95" />
              <circle cx="70" cy="115" r="8" fill="#E11D48" />

              <path d="M145 75 Q165 70 180 55 Q165 80 145 75 Z" fill="#FBBF24" />
            </g>
          </svg>
        </div>
      </>
    );
  }

  // Royal Golden Traditional Corner Ornaments
  return (
    <>
      {/* Top Left Royal Corner */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          left: '6px',
          width: '50px',
          height: '50px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5 L5 55 M5 5 L55 5" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M15 15 L15 45 M15 15 L45 15" stroke={primaryColor} strokeWidth="3" />
          <circle cx="15" cy="15" r="5" fill={accentColor} />
          <circle cx="35" cy="15" r="3" fill={primaryColor} />
          <circle cx="15" cy="35" r="3" fill={primaryColor} />
        </svg>
      </div>

      {/* Top Right Royal Corner */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          width: '50px',
          height: '50px',
          pointerEvents: 'none',
          zIndex: 1,
          transform: 'scaleX(-1)',
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5 L5 55 M5 5 L55 5" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M15 15 L15 45 M15 15 L45 15" stroke={primaryColor} strokeWidth="3" />
          <circle cx="15" cy="15" r="5" fill={accentColor} />
          <circle cx="35" cy="15" r="3" fill={primaryColor} />
          <circle cx="15" cy="35" r="3" fill={primaryColor} />
        </svg>
      </div>

      {/* Bottom Left Royal Corner */}
      <div
        style={{
          position: 'absolute',
          bottom: '6px',
          left: '6px',
          width: '50px',
          height: '50px',
          pointerEvents: 'none',
          zIndex: 1,
          transform: 'scaleY(-1)',
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5 L5 55 M5 5 L55 5" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M15 15 L15 45 M15 15 L45 15" stroke={primaryColor} strokeWidth="3" />
          <circle cx="15" cy="15" r="5" fill={accentColor} />
        </svg>
      </div>

      {/* Bottom Right Royal Corner */}
      <div
        style={{
          position: 'absolute',
          bottom: '6px',
          right: '6px',
          width: '50px',
          height: '50px',
          pointerEvents: 'none',
          zIndex: 1,
          transform: 'scale(-1, -1)',
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5 L5 55 M5 5 L55 5" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M15 15 L15 45 M15 15 L45 15" stroke={primaryColor} strokeWidth="3" />
          <circle cx="15" cy="15" r="5" fill={accentColor} />
        </svg>
      </div>
    </>
  );
};
