import React from 'react';
import { Send, MessageCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TelegramSupportButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'compact' | 'float';
  className?: string;
  customText?: string;
  showIcon?: boolean;
}

/**
 * Official Telegram Direct Chat Support Button
 * Adheres strictly to sections 12 & 13 of the project specification.
 * Never outputs undefined, null, or empty links.
 */
export const TelegramSupportButton: React.FC<TelegramSupportButtonProps> = ({
  variant = 'primary',
  className = '',
  customText,
  showIcon = true,
}) => {
  const { siteConfig } = useApp();

  // Clean and sanitize telegram username
  const rawUsername = siteConfig?.telegramUsername || 'Primemultiservice';
  const cleanUsername = String(rawUsername)
    .trim()
    .replace(/^@+/, '')
    .replace(/^https?:\/\/t\.me\//i, '')
    .replace(/[^a-zA-Z0-9_]/g, '');

  const isAvailable = cleanUsername.length > 0 && cleanUsername !== 'undefined' && cleanUsername !== 'null';
  const directChatUrl = isAvailable ? `https://t.me/${cleanUsername}` : '';

  const label = customText || 'Telegram वर थेट Chat करा';

  if (!isAvailable) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200 cursor-not-allowed ${className}`}
        title="Telegram support is currently unavailable"
      >
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Telegram support is currently unavailable.</span>
      </div>
    );
  }

  const baseStyles = 'inline-flex items-center justify-center font-black transition-all cursor-pointer select-none active:scale-[0.98]';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg shadow-sky-500/20 px-4 py-2.5 rounded-xl text-sm gap-2 border border-sky-400/30';
      break;
    case 'secondary':
      variantStyles = 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-3.5 py-2 rounded-xl text-xs gap-2';
      break;
    case 'outline':
      variantStyles = 'bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 hover:border-sky-400 px-3 py-1.5 rounded-xl text-xs gap-1.5';
      break;
    case 'compact':
      variantStyles = 'bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1 rounded-lg text-xs gap-1';
      break;
    case 'float':
      variantStyles = 'fixed bottom-20 right-4 z-40 bg-sky-500 hover:bg-sky-600 text-white p-3.5 rounded-full shadow-xl shadow-sky-600/30 border-2 border-white';
      break;
  }

  return (
    <a
      href={directChatUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variantStyles} ${className}`}
      title={`Chat on Telegram: @${cleanUsername}`}
      id="telegram-support-chat-button"
    >
      {showIcon && <Send className="w-4 h-4 shrink-0 text-sky-100" />}
      <span>{label}</span>
    </a>
  );
};

export default TelegramSupportButton;
