import React, { useState } from 'react';
import { Send, X, BellRing, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DEFAULT_TELEGRAM_GROUP_URL = 'https://t.me/+LcV24fm6QboxZWM1';

interface TelegramGroupNoticeBannerProps {
  compact?: boolean;
}

export const TelegramGroupNoticeBanner: React.FC<TelegramGroupNoticeBannerProps> = ({
  compact = false,
}) => {
  const { siteConfig, language } = useApp();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('vj_tg_group_notice_dismissed') === '1';
    } catch {
      return false;
    }
  });

  if (dismissed || siteConfig?.showTelegramBanner === false) {
    return null;
  }

  const isEn = language === 'en';
  const rawGroupUrl = (siteConfig?.telegramGroupUrl || DEFAULT_TELEGRAM_GROUP_URL).trim();
  const safeGroupUrl = /^https?:\/\/(t\.me|telegram\.me)\//i.test(rawGroupUrl)
    ? rawGroupUrl
    : DEFAULT_TELEGRAM_GROUP_URL;

  const customNotice = (siteConfig?.telegramSupportNote || '').trim();
  const noticeHeadline = isEn
    ? 'Join Official Vanjari Jodi Telegram Group'
    : '📢 महत्त्वाची सूचना: आमचा अधिकृत टेलिग्राम ग्रुप जॉईन करा!';
  const noticeSubtext = customNotice
    ? customNotice
    : isEn
    ? 'Get daily new verified biodatas, important announcements & instant community updates.'
    : 'रोजचे नवीन वधू-वर बायोडाटा, महत्त्वाच्या सूचना व ताज्या अपडेट्ससाठी आजच टेलिग्राम ग्रुपला जॉईन व्हा.';

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('vj_tg_group_notice_dismissed', '1');
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div
      role="region"
      aria-label={isEn ? 'Telegram group join notice' : 'टेलिग्राम ग्रुप जॉईन सूचना'}
      className={`w-full bg-gradient-to-r from-[#0B4F71] via-[#0284C7] to-[#0369A1] text-white border-b border-sky-300/60 shadow-sm ${
        compact ? 'px-3 py-2' : 'px-4 py-2.5'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0 shadow-xs">
            <Send className="w-4 h-4 text-sky-100" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5 text-[11.5px] sm:text-xs font-black text-amber-200 truncate">
              <BellRing className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{noticeHeadline}</span>
            </div>
            <p className="text-[10.5px] sm:text-xs text-sky-50 font-semibold line-clamp-2 sm:truncate mt-0.5">
              {noticeSubtext}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={safeGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-[11px] sm:text-xs shadow-sm transition whitespace-nowrap"
          >
            <span>{isEn ? 'Join Group' : 'ग्रुप जॉईन करा'}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label={isEn ? 'Close notice' : 'सूचना बंद करा'}
            title={isEn ? 'Close' : 'बंद करा'}
            className="p-1.5 rounded-lg text-sky-100 hover:text-white hover:bg-white/15 transition cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
