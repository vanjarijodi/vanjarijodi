import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, CheckCircle2, AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { uploadImageWithRetry, validateImageFile } from '../../services/imageUploadService';

interface ImageUploadFieldProps {
  label: string;
  labelMr?: string;
  currentImageUrl?: string;
  folder?: 'profile' | 'kyc' | 'payment' | 'story' | 'banner' | 'general';
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  required?: boolean;
  aspectRatio?: 'square' | 'cover' | 'doc';
  helperText?: string;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  labelMr,
  currentImageUrl,
  folder = 'general',
  onImageUploaded,
  onImageRemoved,
  required = false,
  aspectRatio = 'square',
  helperText,
  className = '',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setUploadError(null);
    setUploadSuccess(false);

    // 1. Validation
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.errorMr || validation.error || 'अवैध फाईल');
      return;
    }

    // 2. Immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // 3. Upload with compression & auto-retry
    setIsUploading(true);
    try {
      const res = await uploadImageWithRetry(file, folder, 2);
      if (res.success && res.url) {
        setPreviewUrl(res.url);
        setUploadSuccess(true);
        onImageUploaded(res.url);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        setUploadError(res.errorMr || res.error || 'फोटो अपलोड अयशस्वी झाला. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (err: any) {
      setUploadError('नेटवर्क अडचण आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsUploading(false);
      // Clear input so selecting same file triggers change
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl('');
    setUploadError(null);
    setUploadSuccess(false);
    if (onImageRemoved) onImageRemoved();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700">
          {labelMr || label} {required && <span className="text-red-500">*</span>}
        </label>
        {previewUrl && !isUploading && (
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> निवडलेला फोटो
          </span>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition text-center cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
          uploadError
            ? 'border-red-300 bg-red-50/50 hover:bg-red-50'
            : previewUrl
            ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50'
            : 'border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/70 hover:border-amber-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative group w-full flex flex-col items-center">
            <div
              className={`relative overflow-hidden rounded-xl border border-gray-200 shadow-sm ${
                aspectRatio === 'square'
                  ? 'w-24 h-24'
                  : aspectRatio === 'cover'
                  ? 'w-full h-32'
                  : 'w-full max-w-[200px] h-28'
              }`}
            >
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />

              {isUploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-300 mb-1" />
                  <span>अपलोड होत आहे...</span>
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3 h-3 text-amber-600" />
                बदला (Replace)
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-red-200 rounded-lg hover:bg-red-50 text-red-600 shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                काढून टाका (Remove)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 py-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-800">
              फोटो निवडा किंवा येथे ड्रॅग करा
            </p>
            <p className="text-[11px] text-gray-500">
              JPG, PNG, WebP (ऑटो-कॉम्प्रेशन सक्षम)
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="text-[11px] font-bold text-red-700 underline hover:text-red-900 cursor-pointer ml-2 shrink-0"
          >
            पुन्हा प्रयत्न करा (Retry)
          </button>
        </div>
      )}

      {uploadSuccess && (
        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> फोटो यशस्वीरित्या अपलोड झाला!
        </p>
      )}

      {helperText && !uploadError && (
        <p className="text-[11px] text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
