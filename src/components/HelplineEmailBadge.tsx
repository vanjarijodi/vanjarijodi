import React, { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SiteConfig } from '../types';

interface HelplineEmailBadgeProps {
  /** Compact strip styling for mobile app top bar */
  compactMobile?: boolean;
  /** Optional override config for live preview inside Admin Panel */
  previewConfig?: Partial<SiteConfig>;
}

export const HelplineEmailBadge: React.FC<HelplineEmailBadgeProps> = ({
  compactMobile = false,
  previewConfig,
}) => {
  const { siteConfig } = useApp();
  const [copied, setCopied] = useState(false);

  const cfg = { ...(siteConfig || {}), ...(previewConfig || {}) };
  const email = (cfg.contactEmail || 'gitevijay123@gmail.com').trim();
  const label = (cfg.helplineEmailLabel ?? 'अधिकृत हेल्पलाईन:').trim();
  const size = cfg.helplineEmailSize || 'large';
  const stylePreset = cfg.helplineEmailStyle || 'gold_glow';
  const enablePulse = Boolean(cfg.helplineEmailPulse);

  if (!email) return null;

  const sizeClasses =
    size === 'xlarge'
      ? compactMobile
        ? 'text-[13px] px-3 py-1.5 gap-2'
        : 'text-sm sm:text-base px-4 py-1.5 gap-2'
      : size === 'large'
      ? compactMobile
        ? 'text-xs px-2.5 py-1 gap-1.5'
        : 'text-xs sm:text-sm px-3 py-1 gap-1.5'
      : 'text-[11px] px-2.5 py-0.5 gap-1.5';

  const iconSize = size === 'xlarge' ? 'w-4 h-4' : size === 'large' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  const styleClasses =
    stylePreset === 'bright_pill'
      ? 'bg-white text-[#800C1E] border-2 border-amber-400 shadow-md hover:bg-amber-50'
      : stylePreset === 'royal_badge'
      ? 'bg-gradient-to-r from-[#5E0715] via-[#800C1E] to-[#5E0715] text-amber-200 border-2 border-amber-300 shadow-lg hover:brightness-110'
      : stylePreset === 'attention_banner'
      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white border-2 border-emerald-200 shadow-md hover:brightness-105'
      : 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 text-slate-950 border border-amber-200 shadow-md hover:brightness-105';

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(email).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`inline-flex items-center rounded-xl font-black transition-all max-w-full ${sizeClasses} ${styleClasses} ${
        enablePulse ? 'ring-2 ring-amber-300/80 animate-pulse' : ''
      }`}
    >
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-1.5 min-w-0 truncate hover:underline"
        title={`अधिकृत हेल्पलाईन ईमेल: ${email}`}
      >
        <Mail className={`${iconSize} shrink-0`} />
        {label && <span className="opacity-90 font-extrabold hidden xs:inline sm:inline shrink-0">{label}</span>}
        <span className="truncate font-mono tracking-tight">{email}</span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="ml-0.5 px-1.5 py-0.5 rounded-lg bg-black/15 hover:bg-black/25 text-[10px] font-black inline-flex items-center gap-0.5 shrink-0 cursor-pointer transition active:scale-95"
        title="ईमेल कॉपी करा"
        aria-label="Copy helpline email"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3" />
            <span>कॉपी</span>
          </>
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
};
