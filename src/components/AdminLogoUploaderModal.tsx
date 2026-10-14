import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AdminLogoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLogoUploaderModal: React.FC<AdminLogoUploaderModalProps> = ({ isOpen, onClose }) => {
  const { siteConfig, updateSiteConfig } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('कृपया फक्त इमेज फाईल (PNG, JPG, WEBP) निवडा.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setSuccessMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAndReplace = async () => {
    if (!previewUrl) {
      setErrorMessage('कृपया आधी एक इमेज फाईल निवडा.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/set-official-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data: previewUrl }),
      });

      const data = await response.json();

      if (data.success) {
        const freshLogoUrl = `/vanjari-jodi-official-logo.png?v=${Date.now()}`;
        localStorage.setItem('vanjari_jodi_active_logo', freshLogoUrl);
        updateSiteConfig({ logoUrl: freshLogoUrl });

        setSuccessMessage('🎉 अभिनंदन! अधिकृत लोगो यशस्वीरित्या बदलला आहे आणि public/vanjari-jodi-official-logo.png वर सेव्ह झाला आहे!');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1800);
      } else {
        setErrorMessage(data.error || 'लोगो अपलोड करताना त्रुटी आली.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'सर्व्हरशी संपर्क करताना तांत्रिक त्रुटी आली.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
          <div className="flex items-center gap-2 text-[#800C1E]">
            <div className="p-2 rounded-xl bg-amber-100 text-[#800C1E]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">अधिकृत लोगो बदला (Upload Official Logo)</h3>
              <p className="text-[11px] text-slate-500 font-bold">थेट public/vanjari-jodi-official-logo.png रिप्लेस करा</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4">
          
          {/* Current vs New Preview */}
          <div className="flex items-center justify-center gap-4 p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">सध्याचा लोगो</span>
              <img
                src={siteConfig.logoUrl || '/vanjari-jodi-official-logo.png'}
                alt="Current Logo"
                className="w-20 h-20 rounded-full object-contain bg-white border-2 border-amber-300 p-1 shadow-xs mx-auto"
              />
            </div>

            {previewUrl && (
              <>
                <div className="text-amber-500 font-black text-xl">➔</div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-emerald-600 block mb-1">नवीन लोगो (Preview)</span>
                  <img
                    src={previewUrl}
                    alt="New Selected Logo"
                    className="w-20 h-20 rounded-full object-contain bg-white border-2 border-emerald-500 p-1 shadow-md ring-2 ring-emerald-200 mx-auto"
                  />
                </div>
              </>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Pick File Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/40 hover:bg-amber-100/60 text-[#800C1E] font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Upload className="w-6 h-6 text-[#800C1E]" />
            <span>📁 तुमच्या मोबाईलमधून नवीन लोगो (इमेज) निवडा</span>
            <span className="text-[10px] text-slate-500 font-medium">PNG, JPG, किंवा WEBP इमेज निवडा</span>
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              रद्द करा (Cancel)
            </button>

            <button
              type="button"
              onClick={handleUploadAndReplace}
              disabled={!previewUrl || isUploading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>अपलोड होत आहे...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>💾 सेव्ह व रिप्लेस करा</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
