import React from 'react';
import { VanjariJodiLogo } from '../VanjariJodiLogo';
import { SiteConfig } from '../../types';

interface BioDataWatermarkProps {
  siteConfig?: SiteConfig;
  opacity?: number;
  showText?: boolean;
}

export const BioDataWatermark: React.FC<BioDataWatermarkProps> = ({
  siteConfig,
  opacity = 0.25,
  showText = true,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
        opacity: opacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-22deg)',
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.04))',
        }}
      >
        <VanjariJodiLogo variant="emblem" size={240} />
        {showText && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 900,
                color: '#800C1E',
                letterSpacing: '2px',
                fontFamily: "'Yatra One', serif",
                textTransform: 'uppercase',
              }}
            >
              {siteConfig?.logoTitle || 'वंजारी जोडी'}
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#B45309',
                letterSpacing: '1px',
                fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif",
                marginTop: '3px',
              }}
            >
              {siteConfig?.canonicalDomain || 'vanjarijodi.web.app'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

