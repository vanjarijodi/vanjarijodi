import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Filter,
  Heart,
  Star,
  Sparkles,
  Briefcase,
  ShieldCheck,
  MapPin,
  ChevronUp,
  ChevronDown,
  X,
  Sliders,
  Award,
  Crown,
  Layers,
  PhoneCall
} from 'lucide-react';
import { ActionDockType, ProfessionCategory, MaritalStatus } from '../types';
import { useApp } from '../context/AppContext';
import { getActiveThemeConfig } from '../utils/themePresets';

interface DynamicActionDockProps {
  onOpenSearchModal: () => void;
  onOpenRightFilter: () => void;
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const DynamicActionDock: React.FC<DynamicActionDockProps> = ({
  onOpenSearchModal,
  onOpenRightFilter,
  activeCategory = 'all',
  onSelectCategory,
}) => {
  const {
    siteConfig,
    searchFilters,
    setSearchFilters,
    likedProfileIds,
    shortlistedIds,
    profiles,
  } = useApp();

  const dockType: ActionDockType = siteConfig.activeActionDock || 'category_chip_bar';
  const theme = getActiveThemeConfig(siteConfig.activeThemePreset);

  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState<boolean>(false);
  const [isSideRailOpen, setIsSideRailOpen] = useState<boolean>(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState<boolean>(false);

  // Category Chip List for Module 2 & 3
  const categories = [
    { id: 'all', label: '⭐ सर्व स्थळे', count: profiles.length },
    { id: 'govt_job', label: '🏛️ सरकारी नोकरी', icon: Briefcase },
    { id: 'verified', label: '🌟 १००% व्हेरिफाइड', icon: ShieldCheck },
    { id: 'doctor_engineer', label: '🩺 डॉक्टर / इंजिनिअर', icon: Award },
    { id: 'business', label: '💼 उद्योग / व्यवसाय', icon: Briefcase },
    { id: 'agriculture', label: '🌾 शेती + नोकरी', icon: Sparkles },
    { id: 'never_married', label: '💍 प्रथम विवाह (अविवाहित)', icon: Heart },
    { id: 'divorced_widowed', label: '🤝 पुनर्विवाह (पुन्हा नवीन सुरुवात)', icon: Layers },
    { id: 'vip', label: '👑 VIP मेंबर्स', icon: Crown },
  ];

  // 1. HORIZONTAL CATEGORY CHIP-BAR
  if (dockType === 'category_chip_bar') {
    return (
      <div className="w-full bg-white/95 backdrop-blur-md border-y border-amber-200 py-2.5 px-3 shadow-xs sticky top-[68px] z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(cat.id);
                  if (cat.id === 'govt_job') {
                    setSearchFilters((prev) => ({ ...prev, occupation: 'सरकारी' }));
                  } else if (cat.id === 'never_married') {
                    setSearchFilters((prev) => ({ ...prev, maritalStatus: 'never_married' }));
                  } else if (cat.id === 'verified') {
                    setSearchFilters((prev) => ({ ...prev, isVerified: true }));
                  } else if (cat.id === 'all') {
                    setSearchFilters((prev) => ({ ...prev, occupation: undefined, maritalStatus: 'all' as any, isVerified: undefined }));
                  }
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-100 shadow-md border border-amber-300 scale-105'
                    : 'bg-amber-50/70 hover:bg-amber-100 text-slate-800 border border-amber-200'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. FLOATING SPEED-DIAL DOCK (Bottom Right)
  if (dockType === 'floating_speed_dial') {
    return (
      <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-3 select-none">
        <AnimatePresence>
          {isSpeedDialOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-end gap-2.5"
            >
              <button
                type="button"
                onClick={() => {
                  onOpenSearchModal();
                  setIsSpeedDialOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-white text-slate-900 font-extrabold text-xs rounded-full shadow-lg border border-amber-300 hover:bg-amber-50 cursor-pointer"
              >
                <span>नाव / शिक्षण / शहर शोधा</span>
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenRightFilter();
                  setIsSpeedDialOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-white text-slate-900 font-extrabold text-xs rounded-full shadow-lg border border-amber-300 hover:bg-amber-50 cursor-pointer"
              >
                <span>सर्व फिल्टर्स व निकष</span>
                <div className="w-8 h-8 rounded-full bg-amber-100 text-[#A71930] flex items-center justify-center">
                  <Filter className="w-4 h-4" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchFilters((prev) => ({ ...prev, occupation: 'सरकारी' }));
                  setIsSpeedDialOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-white text-emerald-950 font-black text-xs rounded-full shadow-lg border border-emerald-300 hover:bg-emerald-50 cursor-pointer"
              >
                <span>🏛️ सरकारी नोकरी स्थळे</span>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Trigger Button */}
        <button
          type="button"
          onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all cursor-pointer border-2 border-amber-300 ${
            isSpeedDialOpen ? 'bg-slate-900 rotate-45' : 'bg-gradient-to-r from-[#A71930] to-[#800C1E]'
          }`}
          title="जलद ॲक्शन्स"
        >
          <Plus className="w-7 h-7 text-amber-200" />
        </button>
      </div>
    );
  }

  // 3. COLLAPSIBLE SIDE-RAIL
  if (dockType === 'collapsible_side_rail') {
    return (
      <>
        {/* Toggle Button on Left */}
        <button
          type="button"
          onClick={() => setIsSideRailOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-100 px-2 py-4 rounded-r-2xl shadow-xl border-y border-r border-amber-300 flex flex-col items-center gap-1 cursor-pointer"
        >
          <Sliders className="w-4 h-4 text-amber-300" />
          <span className="text-[10px] font-black [writing-mode:vertical-rl]">जलद शोध व फिल्टर्स</span>
        </button>

        {/* Sliding Side-Rail Drawer */}
        <AnimatePresence>
          {isSideRailOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => setIsSideRailOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3 }}
                className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-5 border-r-2 border-amber-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                    <h3 className="font-black text-lg text-[#A71930] flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-[#A71930]" />
                      <span>स्मार्ट कॅटेगरी रेल</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsSideRailOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (onSelectCategory) onSelectCategory(cat.id);
                          setIsSideRailOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-between bg-amber-50/70 hover:bg-amber-100 text-slate-800 border border-amber-200 cursor-pointer"
                      >
                        <span>{cat.label}</span>
                        <span className="text-[10px] text-slate-400">❯</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenRightFilter();
                      setIsSideRailOpen(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow cursor-pointer text-center"
                  >
                    सविस्तर फिल्टर उघडा
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // 4. INTERACTIVE BOTTOM SHEET
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-amber-300 shadow-2xl rounded-t-3xl transition-all">
      <div
        className="p-3 flex items-center justify-between cursor-pointer max-w-4xl mx-auto"
        onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#A71930]" />
          <span className="text-xs font-black text-slate-900">स्मार्ट फिल्टर व कॅटेगरी शीट</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">
            {isBottomSheetExpanded ? 'कमी करा' : 'विस्तृत करा'}
          </span>
          {isBottomSheetExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {isBottomSheetExpanded && (
        <div className="p-4 pt-1 max-w-4xl mx-auto border-t border-amber-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.slice(1).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (onSelectCategory) onSelectCategory(cat.id);
                setIsBottomSheetExpanded(false);
              }}
              className="px-3 py-2 rounded-xl text-xs font-black bg-amber-50 hover:bg-amber-100 text-slate-900 border border-amber-200 cursor-pointer text-center truncate"
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
