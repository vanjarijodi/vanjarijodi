import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Camera, Lock, Heart, Sparkles } from 'lucide-react';
import { SecurityWatermarkOverlay } from './SecurityWatermarkOverlay';
import { getHdImageUrl } from '../utils/cloudinary';

interface InstagramPhotoCarouselProps {
  photos: string[];
  defaultGender?: 'bride' | 'groom';
  fullName?: string;
  isBlurred?: boolean;
  blurClass?: string;
  lockMessage?: string;
  onLockClick?: () => void;
  onPhotoClick?: () => void;
  onDoubleTapLike?: () => void;
  className?: string;
  aspectRatioClass?: string;
  enableWatermark?: boolean;
}

export const InstagramPhotoCarousel: React.FC<InstagramPhotoCarouselProps> = ({
  photos = [],
  defaultGender = 'bride',
  fullName = 'Profile',
  isBlurred = false,
  blurClass = 'blur-lg',
  lockMessage,
  onLockClick,
  onPhotoClick,
  onDoubleTapLike,
  className = '',
  aspectRatioClass = 'aspect-[4/5] sm:h-96',
  enableWatermark = true,
}) => {
  // Ensure valid non-empty photo list
  const validPhotos = photos && photos.length > 0 ? photos.filter(Boolean) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const lastTapTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback placeholder photo if none uploaded
  const fallbackPhoto =
    defaultGender === 'bride'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600';

  const photoList = validPhotos.length > 0 ? validPhotos : [fallbackPhoto];
  const totalPhotos = photoList.length;

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalPhotos - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === totalPhotos - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setCurrentIndex(idx);
  };

  // Double Tap Handler for Instagram-style Heart Reaction
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapTime.current < 320) {
      // Double tap detected!
      setShowHeartPop(true);
      if (onDoubleTapLike) {
        onDoubleTapLike();
      }
      setTimeout(() => setShowHeartPop(false), 900);
    }
    lastTapTime.current = now;
  };

  // Real-time Touch Dragging (Smooth Instagram Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Detect direction on initial movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        isHorizontalSwipe.current = false;
      }
    }

    // Only drag track if user is moving horizontally
    if (isHorizontalSwipe.current === true && totalPhotos > 1) {
      // Resistance at edges
      let offset = deltaX;
      if ((currentIndex === 0 && deltaX > 0) || (currentIndex === totalPhotos - 1 && deltaX < 0)) {
        offset = deltaX * 0.35;
      }
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    
    if (isHorizontalSwipe.current === true && touchStartX.current !== null) {
      const containerWidth = containerRef.current?.offsetWidth || 320;
      const swipeThreshold = Math.min(60, containerWidth * 0.18);

      if (dragOffset < -swipeThreshold && currentIndex < totalPhotos - 1) {
        // Next Photo
        setCurrentIndex((prev) => prev + 1);
      } else if (dragOffset > swipeThreshold && currentIndex > 0) {
        // Prev Photo
        setCurrentIndex((prev) => prev - 1);
      }
    } else if (isHorizontalSwipe.current === null && Math.abs(dragOffset) < 5) {
      // Clean tap
      handleTap(e);
    }

    setDragOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = null;
  };

  return (
    <SecurityWatermarkOverlay
      variant="photo"
      className={`relative w-full ${aspectRatioClass} bg-slate-950 overflow-hidden select-none touch-pan-y ${className}`}
    >
      <div
        ref={containerRef}
        onClick={(e) => {
          handleTap(e);
          if (onPhotoClick) onPhotoClick();
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full relative cursor-pointer group"
      >
        {/* Instagram Story-style Top Segment Progress Indicators */}
        {totalPhotos > 1 && (
          <div className="absolute top-2 inset-x-3 z-30 flex items-center gap-1.5 pointer-events-none">
            {photoList.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden backdrop-blur-xs shadow-xs"
              >
                <div
                  className={`h-full bg-amber-400 transition-all duration-300 ${
                    currentIndex === idx ? 'w-full' : idx < currentIndex ? 'w-full opacity-60' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Double-tap Heart Pop Animation */}
        {showHeartPop && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-300">
            <div className="p-4 sm:p-5 rounded-full bg-rose-600/90 text-white shadow-2xl backdrop-blur-md scale-125 border-2 border-white/80 animate-bounce">
              <Heart className="w-16 h-16 sm:w-20 sm:h-20 fill-white text-white filter drop-shadow-lg" />
            </div>
          </div>
        )}

        {/* Left & Right Tap Navigation Zones (Instagram Story Style) */}
        {totalPhotos > 1 && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handlePrev(e);
              }}
              className="absolute left-0 top-10 bottom-16 w-1/4 z-20 cursor-pointer"
              title="मागील फोटो (मागचा)"
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleNext(e);
              }}
              className="absolute right-0 top-10 bottom-16 w-1/4 z-20 cursor-pointer"
              title="पुढील फोटो (पुढचा)"
            />
          </>
        )}

        {/* Photo Slider Track with Real-time Drag Glide */}
        <div
          className={`flex w-full h-full ${
            isDragging ? 'transition-none' : 'transition-transform duration-350 ease-out'
          }`}
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {photoList.map((photoUrl, index) => (
            <div key={index} className="w-full h-full shrink-0 relative bg-slate-950 overflow-hidden flex items-center justify-center">
              <img
                src={getHdImageUrl(photoUrl, 1800)}
                alt={`${fullName} - Photo ${index + 1}`}
                referrerPolicy="no-referrer"
                loading={index === 0 ? 'eager' : 'lazy'}
                className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-103 ${
                  isBlurred ? blurClass : ''
                }`}
              />
              {isBlurred && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 p-4 text-center z-10 select-none">
                  <div className="p-2.5 rounded-full bg-slate-950/80 border border-amber-300/40 text-amber-300 shadow-xl">
                    <Lock className="w-7 h-7 text-amber-300 drop-shadow" />
                  </div>
                  <span className="text-xs font-black text-amber-200 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-amber-300/40 shadow-lg max-w-[85%] leading-snug">
                    {lockMessage || '🔒 फोटो फक्त शुल्क भरलेल्या सदस्यांसाठीच (Paid Members Only)'}
                  </span>
                  {onLockClick && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLockClick();
                      }}
                      className="mt-1 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-full shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer pointer-events-auto border border-amber-300/60"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                      <span>शुल्क भरा / प्लॅन्स पहा</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Crystal Clear HD Indicator Badge */}
        {!isBlurred && (
          <div className="absolute top-4 left-3 z-30 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-black text-amber-300 border border-amber-300/30 flex items-center gap-1 shadow-sm pointer-events-none">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            <span>HD फोटो</span>
          </div>
        )}

        {/* Dark Vignette Bottom Gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#140205]/95 via-[#140205]/35 to-transparent pointer-events-none" />

        {/* Instagram-style Photo Counter Pill */}
        {totalPhotos > 1 && (
          <div className="absolute top-4 right-3 z-30 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-black text-white border border-amber-300/40 flex items-center gap-1 shadow-md">
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {currentIndex + 1}/{totalPhotos}
            </span>
            <span className="text-[9px] text-amber-300 ml-0.5">↔</span>
          </div>
        )}

        {/* Left Navigation Arrow */}
        {totalPhotos > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 shadow-lg cursor-pointer"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 shadow-lg cursor-pointer"
            title="पुढील फोटो"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Instagram-style Bottom Pagination Dots */}
        {totalPhotos > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 z-30 flex items-center justify-center space-x-1.5 pointer-events-auto">
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
    </SecurityWatermarkOverlay>
  );
};


