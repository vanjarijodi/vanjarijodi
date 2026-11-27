import React from 'react';
import { ChartHouseData } from '../types';

interface KundliChartGridProps {
  title: string;
  subtitle?: string;
  chartData: ChartHouseData[];
}

/**
 * Responsive North Indian Vedic Kundli Chart Grid (उत्तर भारतीय पद्धतीचा चौकोनी लग्न / नवमांश तक्ता)
 */
export const KundliChartGrid: React.FC<KundliChartGridProps> = ({ title, subtitle, chartData }) => {
  // Helper to get house data
  const getHouse = (houseNum: number): ChartHouseData => {
    return chartData?.find((h) => h.house === houseNum) || {
      house: houseNum,
      rashiNumber: houseNum,
      rashiName: '',
      rashiNameMr: '',
      planets: [],
    };
  };

  // House layout positions for North Indian Diamond Chart (in 400x400 SVG canvas)
  const houseCoordinates: Record<number, { textX: number; textY: number; rashiX: number; rashiY: number }> = {
    1:  { textX: 200, textY: 130, rashiX: 200, rashiY: 105 }, // Top Center Diamond (Lagna / House 1)
    2:  { textX: 110, textY: 65,  rashiX: 120, rashiY: 40  }, // Top Left
    3:  { textX: 65,  textY: 110, rashiX: 40,  rashiY: 120 }, // Left Top Triangle
    4:  { textX: 130, textY: 200, rashiX: 105, rashiY: 200 }, // Left Center Diamond (House 4)
    5:  { textX: 65,  textY: 290, rashiX: 40,  rashiY: 280 }, // Left Bottom Triangle
    6:  { textX: 110, textY: 335, rashiX: 120, rashiY: 360 }, // Bottom Left
    7:  { textX: 200, textY: 270, rashiX: 200, rashiY: 295 }, // Bottom Center Diamond (House 7)
    8:  { textX: 290, textY: 335, rashiX: 280, rashiY: 360 }, // Bottom Right
    9:  { textX: 335, textY: 290, rashiX: 360, rashiY: 280 }, // Right Bottom Triangle
    10: { textX: 270, textY: 200, rashiX: 295, rashiY: 200 }, // Right Center Diamond (House 10)
    11: { textX: 335, textY: 110, rashiX: 360, rashiY: 120 }, // Right Top Triangle
    12: { textX: 290, textY: 65,  rashiX: 280, rashiY: 40  }, // Top Right
  };

  return (
    <div className="bg-white/95 rounded-2xl p-4 md:p-6 border border-amber-200/80 shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-full">
      {/* Title */}
      <div className="text-center mb-3">
        <h3 className="text-lg md:text-xl font-black text-[#800C1E] flex items-center justify-center gap-2">
          <span>🚩</span>
          <span>{title}</span>
        </h3>
        {subtitle && <p className="text-xs text-amber-800 font-bold">{subtitle}</p>}
      </div>

      {/* SVG Container */}
      <div className="relative w-full aspect-square max-w-[360px] mx-auto bg-[#FFFDF7] rounded-xl border-2 border-[#800C1E] shadow-inner overflow-hidden p-1">
        <svg viewBox="0 0 400 400" className="w-full h-full text-slate-800 font-sans select-none">
          {/* Main outer border */}
          <rect x="10" y="10" width="380" height="380" fill="none" stroke="#800C1E" strokeWidth="4" />
          
          {/* Inner diagonal cross lines */}
          <line x1="10" y1="10" x2="390" y2="390" stroke="#800C1E" strokeWidth="2.5" />
          <line x1="390" y1="10" x2="10" y2="390" stroke="#800C1E" strokeWidth="2.5" />

          {/* Central Inner Diamond */}
          <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="#800C1E" strokeWidth="2.5" />

          {/* Golden House accent highlights for 1st House */}
          <polygon points="200,10 300,105 200,200 100,105" fill="rgba(245, 158, 11, 0.08)" />

          {/* Render House Numbers, Rashi Numbers & Planets */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
            const house = getHouse(houseNum);
            const pos = houseCoordinates[houseNum];

            return (
              <g key={`house-${houseNum}`}>
                {/* Rashi Number in small circle or text */}
                <text
                  x={pos.rashiX}
                  y={pos.rashiY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-amber-800 text-[13px] font-black tracking-tight"
                >
                  {house.rashiNumber}
                </text>

                {/* Planets inside House */}
                {house.planets && house.planets.length > 0 ? (
                  <g>
                    {house.planets.map((planetName, pIdx) => {
                      const offsetY = (pIdx - (house.planets.length - 1) / 2) * 16;
                      return (
                        <text
                          key={`h${houseNum}-p${pIdx}`}
                          x={pos.textX}
                          y={pos.textY + offsetY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-[#800C1E] text-[12px] font-extrabold"
                        >
                          {planetName}
                        </text>
                      );
                    })}
                  </g>
                ) : (
                  houseNum === 1 && (
                    <text
                      x={pos.textX}
                      y={pos.textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-amber-700 text-[11px] font-bold italic"
                    >
                      लग्न
                    </text>
                  )
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend / Key Footer */}
        <div className="mt-2 text-[10px] text-center text-slate-600 font-semibold flex flex-wrap justify-center gap-2 border-t border-amber-200/60 pt-1.5">
          <span className="text-[#800C1E] font-black">सू: सूर्य</span>
          <span className="text-indigo-800 font-black">चं: चंद्र</span>
          <span className="text-rose-700 font-black">मं: मंगळ</span>
          <span className="text-emerald-700 font-black">बु: बुध</span>
          <span className="text-amber-700 font-black">गु: गुरु</span>
          <span className="text-pink-700 font-black">शु: शुक्र</span>
          <span className="text-slate-700 font-black">श: शनी</span>
          <span className="text-purple-800 font-black">रा: राहू</span>
          <span className="text-orange-800 font-black">के: केतू</span>
        </div>
      </div>
    </div>
  );
};
