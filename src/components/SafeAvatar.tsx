import React, { useState } from 'react';
import { User, Heart, Lock } from 'lucide-react';

interface SafeAvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  gender?: string;
  className?: string;
  sizeClassName?: string;
  isBlurred?: boolean;
  onClick?: () => void;
}

export const SafeAvatar: React.FC<SafeAvatarProps> = ({
  src,
  alt = 'Profile Photo',
  name = '',
  gender = 'groom',
  className = '',
  sizeClassName = 'w-14 h-14',
  isBlurred = false,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);

  const isFemale =
    gender === 'bride' ||
    gender === 'Female' ||
    gender === 'female' ||
    gender === 'वधू';

  const defaultFemalePortrait =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const defaultMalePortrait =
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

  const fallbackPhoto = isFemale ? defaultFemalePortrait : defaultMalePortrait;
  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : '';

  const imageSrc = !hasError && src && src.trim() !== '' ? src : fallbackPhoto;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl shrink-0 bg-gradient-to-br ${
        isFemale
          ? 'from-rose-100 via-amber-50 to-pink-100 text-rose-800 border border-rose-200'
          : 'from-amber-100 via-orange-50 to-amber-200 text-amber-900 border border-amber-200'
      } ${sizeClassName} ${className}`}
    >
      {!hasError && imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt={alt || name}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
              isBlurred ? 'filter blur-md scale-110 opacity-70' : ''
            }`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {isBlurred && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-300 drop-shadow" />
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center font-black text-sm select-none">
          {initial ? (
            <span className="text-base font-black tracking-wider">{initial}</span>
          ) : (
            <User className="w-1/2 h-1/2 opacity-70" />
          )}
        </div>
      )}
    </div>
  );
};

export default SafeAvatar;
