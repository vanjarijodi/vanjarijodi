import React, { useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    if (!img || !ctx) return;

    // Set fixed portrait dimensions (400x500 for biodata photo aspect ratio)
    canvas.width = 400;
    canvas.height = 500;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawWidth = canvas.width;
    let drawHeight = canvas.width / aspect;

    if (drawHeight < canvas.height) {
      drawHeight = canvas.height;
      drawWidth = canvas.height * aspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Export as JPEG with 0.82 quality to ensure small file size (< 400KB)
    const croppedUrl = canvas.toDataURL('image/jpeg', 0.82);
    onCropComplete(croppedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#FFFDF5] border-2 border-amber-300 rounded-3xl shadow-2xl text-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 bg-gradient-to-r from-[#A71930] to-[#800C1E] text-white flex items-center justify-between border-b border-amber-300">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-amber-300" />
            <h3 className="font-extrabold text-sm text-amber-100">फोटो क्रॉप व अ‍ॅडजस्ट करा</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Frame */}
        <div className="p-4 flex flex-col items-center bg-slate-100">
          <div className="relative w-64 h-80 border-4 border-[#A71930] rounded-2xl overflow-hidden shadow-inner bg-white flex items-center justify-center">
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              className="max-w-none transition-all duration-150 object-contain"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            />
            {/* Guide overlay */}
            <div className="absolute inset-0 border border-amber-400/50 pointer-events-none rounded-xl" />
          </div>
          <p className="text-[11px] font-extrabold text-slate-600 mt-2">
            योग्य पोझिशनसाठी खालील झूम आणि रोटेट बटणे वापरा
          </p>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4 bg-white border-t border-amber-200">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-[#A71930] h-2 bg-amber-100 rounded-lg cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-500 shrink-0" />
          </div>

          {/* Rotate Button */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#A71930] font-bold text-xs rounded-xl flex items-center gap-1.5 border border-amber-300"
            >
              <RotateCw className="w-4 h-4" />
              <span>90° फिरवा (Rotate)</span>
            </button>

            <span className="text-xs font-bold text-slate-500">झूम: {Math.round(zoom * 100)}%</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
            >
              रद्द करा
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>क्रॉप करून फोटो सेव्ह करा</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
