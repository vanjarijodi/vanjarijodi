import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Camera, Lock } from 'lucide-react';

interface InstagramPhotoCarouselProps {
  photos: string[];
  defaultGender?: 'bride' | 'groom';
  fullName?: string;
  isBlurred?: boolean;
  blurClass?: string;
  onPhotoClick?: () => void;
  className?: string;
  aspectRatioClass?: string; // e.g. 'h-80 sm:h-96'
}

export const InstagramPhotoCarousel: React.FC<InstagramPhotoCarouselProps> = ({
  photos = [],
  defaultGender = 'bride',
  fullName = 'Profile',
  isBlurred = false,
  blurClass = 'blur-md',
  onPhotoClick,
  className = '',
  aspectRatioClass = 'h-80 sm:h-96',
}) => {
  // Ensure valid non-empty photo list
  const validPhotos = photos && photos.length > 0 ? photos.filter(Boolean) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fallback placeholder photo if none uploaded
  const fallbackPhoto =
    defaultGender === 'bride'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600';

  const photoList = validPhotos.length > 0 ? validPhotos : [fallbackPhoto];
  const totalPhotos = photoList.length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalPhotos - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === totalPhotos - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setCurrentIndex(idx);
  };

  // Touch Swipe Handlers (Mobile Instagram Feel)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Photo
      setCurrentIndex((prev) => (prev === totalPhotos - 1 ? 0 : prev + 1));
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev Photo
      setCurrentIndex((prev) => (prev === 0 ? totalPhotos - 1 : prev - 1));
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      onClick={onPhotoClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full ${aspectRatioClass} bg-slate-950 overflow-hidden cursor-pointer group select-none ${className}`}
    >
      {/* Photo Slider Track */}
      <div
        className="flex w-full h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {photoList.map((photoUrl, index) => (
          <div key={index} className="w-full h-full shrink-0 relative bg-slate-900">
            <img
              src={photoUrl}
              alt={`${fullName} - Photo ${index + 1}`}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
                isBlurred ? blurClass : ''
              }`}
            />
            {isBlurred && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-200" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dark Vignette Bottom Gradient for readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1A0307]/95 via-[#1A0307]/40 to-transparent pointer-events-none" />

      {/* Instagram-style Photo Counter Pill (Top-Right or Bottom-Right) */}
      {totalPhotos > 1 && (
        <div className="absolute top-3 right-12 z-20 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-white border border-white/20 flex items-center gap-1 shadow-md">
          <Camera className="w-3 h-3 text-amber-300" />
          <span>
            {currentIndex + 1}/{totalPhotos}
          </span>
          <span className="text-[9px] text-amber-300 hidden sm:inline ml-0.5">↔ सरकवा</span>
        </div>
      )}

      {/* Left Navigation Arrow */}
      {totalPhotos > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 shadow-lg cursor-pointer"
          title="मागील फोटो"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {totalPhotos > 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 shadow-lg cursor-pointer"
          title="पुढील फोटो"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Instagram-style Bottom Pagination Dots */}
      {totalPhotos > 1 && (
        <div className="absolute bottom-2 inset-x-0 z-20 flex items-center justify-center space-x-1.5 pointer-events-auto">
          {photoList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleDotClick(e, idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === idx
                  ? 'w-4 h-1.5 bg-amber-400 shadow-sm'
                  : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
              }`}
              title={`फोटो ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
