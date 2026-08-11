import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { uploadToCloudinary, validateFileSize } from '../utils/cloudinary';
import { MessageCircle, X, Send, Paperclip, ShieldCheck, CheckCheck, Loader2, Move, Headphones, Image, FileText, Download, ExternalLink } from 'lucide-react';

export const AdminSupportChatWidget: React.FC = () => {
  const {
    adminSupportMessages,
    sendAdminSupportMessage,
    markAdminSupportMessagesRead,
    currentUser,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorMobile, setVisitorMobile] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string; type: 'image' | 'pdf' } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Dragging State for Floating Widget
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 12, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPos = useRef<{ x: number; y: number }>({ x: 12, y: 60 });
  const hasDragged = useRef(false);

  // Visitor Guest ID
  const [visitorId] = useState<string>(() => {
    let vid = localStorage.getItem('vanjari_jodi_visitor_id');
    if (!vid) {
      vid = 'visitor-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString().slice(-4);
      localStorage.setItem('vanjari_jodi_visitor_id', vid);
    }
    return vid;
  });

  const currentUserId = currentUser ? currentUser.id : visitorId;

  // Filter messages
  const userMessages = adminSupportMessages.filter(
    (m) => m.senderId === currentUserId
  );

  const unreadCount = userMessages.filter((m) => m.senderRole === 'admin' && !m.isReadByUser).length;

  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      markAdminSupportMessagesRead(currentUserId);
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isOpen, adminSupportMessages.length, currentUserId]);

  useEffect(() => {
    if (isOpen && userMessages.length > 0) {
      scrollToBottom();
    }
  }, [userMessages.length]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    hasDragged.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX, y: clientY };
    initialPos.current = { ...position };
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = dragStartPos.current.x - clientX;
    const deltaY = dragStartPos.current.y - clientY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasDragged.current = true;
    }

    const maxRight = Math.max(8, window.innerWidth - 120);
    const maxBottom = Math.max(8, window.innerHeight - 50);

    setPosition({
      x: Math.max(8, Math.min(maxRight, initialPos.current.x + deltaX)),
      y: Math.max(8, Math.min(maxBottom, initialPos.current.y + deltaY)),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'image' | 'pdf') => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const val = validateFileSize(file);
    if (!val.valid) {
      setFileError(val.errorMsg || 'फाईलचा आकार १० MB पेक्षा लहान असावा.');
      return;
    }

    setIsUploadingFile(true);
    const res = await uploadToCloudinary(file, 'vanjarijodi_support_attachments');
    setIsUploadingFile(false);

    if (res.success && res.url) {
      setAttachedFile({ url: res.url, name: file.name, type: mediaType });
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedFile({ url: reader.result, name: file.name, type: mediaType });
          setFileError('माध्यम यशस्वीरित्या जोडले गेले (लोकल बॅकअप मोड).');
          setTimeout(() => setFileError(null), 3000);
        } else {
          setFileError('फाईल लोड करता आली नाही.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !attachedFile) return;

    sendAdminSupportMessage(
      messageText.trim(),
      attachedFile?.url,
      attachedFile?.name,
      visitorMobile,
      visitorName,
      visitorId,
      attachedFile?.type
    );

    setMessageText('');
    setAttachedFile(null);
  };

  return (
    <div
      style={
        isOpen
          ? undefined
          : {
              right: `${position.x}px`,
              bottom: `${position.y}px`,
            }
      }
      className={`fixed z-[60] select-none ${
        isOpen
          ? 'inset-x-2 bottom-12 sm:inset-x-auto sm:right-6 sm:bottom-16'
          : ''
      }`}
    >
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="relative group touch-none">
          <span className="absolute inset-0 rounded-full bg-[#A71930] opacity-40 blur-sm animate-pulse scale-105 pointer-events-none" />
          
          <button
            id="support-chat-trigger-btn"
            type="button"
            onClick={() => {
              if (!hasDragged.current) {
                setIsOpen(true);
              }
            }}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-gradient-to-r from-[#A71930] via-[#C82333] to-[#800C1E] hover:from-[#C82333] hover:to-[#A71930] text-amber-100 rounded-full shadow-lg border border-amber-300/80 transition-all duration-200 active:scale-95 cursor-grab active:cursor-grabbing hover:border-amber-200 touch-none"
            title="संपर्क व मदत (ओढा आणि कुठेही टाका)"
          >
            <div className="relative flex items-center justify-center">
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-pulse" />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white flex items-center justify-center shadow">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </span>
            </div>

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-amber-100 text-[9px] font-black h-4.5 min-w-[18px] px-1 rounded-full border border-amber-300 shadow flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat Box Popup */}
      {isOpen && (
        <div className="w-full sm:w-[385px] max-w-md mx-auto h-[calc(92dvh-40px)] sm:h-[510px] max-h-[510px] bg-[#FAF6EF] border-2 border-amber-400 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-in fade-in slide-in-from-bottom-5">
          {/* Draggable Header */}
          <div
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="bg-gradient-to-r from-[#A71930] via-[#800C1E] to-[#590714] p-3 text-white flex items-center justify-between border-b border-amber-300 cursor-grab active:cursor-grabbing shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-1.5 bg-white/10 rounded-xl border border-amber-300/30 shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-xs sm:text-sm text-amber-100 flex items-center gap-1 truncate">
                  वंजारी जोडी ॲडमिन सपोर्ट
                </h3>
                <p className="text-[10px] text-emerald-300 font-bold truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ऑनलाईन (थेट व्हॉट्सॲप मदत)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-amber-100 transition-colors cursor-pointer shrink-0 ml-1"
              title="बंद करा"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Visitor Inputs */}
          {!currentUser && (
            <div className="bg-amber-100/90 p-2 sm:p-2.5 border-b border-amber-200 space-y-1 shrink-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-800">
                शीघ्र मदतीसाठी नाव व मोबाईल नंबर टाका:
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="तुमचे नाव"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="px-2 py-1 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#A71930]"
                />
                <input
                  type="tel"
                  placeholder="मोबाईल नंबर"
                  value={visitorMobile}
                  onChange={(e) => setVisitorMobile(e.target.value)}
                  className="px-2 py-1 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#A71930]"
                />
              </div>
            </div>
          )}

          {/* Chat Messages Area */}
          <div 
            className="flex-1 p-2.5 sm:p-3 overflow-y-auto space-y-2.5 bg-[#FAF6EF] touch-pan-y min-h-0"
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
          >
            <div className="text-center my-0.5">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] sm:text-[10px] font-black rounded-full shadow-xs">
                ॥ श्री संत भगवान बाबा प्रसन्न ॥
              </span>
            </div>

            {userMessages.length === 0 ? (
              <div className="text-center py-6 text-slate-500 space-y-2">
                <MessageCircle className="w-8 h-8 text-[#A71930] mx-auto opacity-80" />
                <p className="text-xs font-black text-slate-800">नमस्कार! मी तुम्हाला काय मदत करू शकतो?</p>
                <p className="text-[10.5px] text-slate-600 px-3 font-medium">
                  काही अडचण असल्यास किंवा फोटो/बायोडाटा PDF पाठवायची असल्यास खाली मेसेज लिहा किंवा फाईल सिलेक्ट करा.
                </p>
              </div>
            ) : (
              userMessages.map((m) => {
                const isUser = m.senderRole === 'user';
                const isPdf = m.fileType === 'pdf' || m.fileUrl?.toLowerCase().includes('.pdf') || m.fileName?.toLowerCase().endsWith('.pdf');

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs font-medium shadow-sm space-y-1.5 ${
                        isUser
                          ? 'bg-[#A71930] text-white rounded-br-none border border-amber-300'
                          : 'bg-white text-slate-900 border-2 border-amber-200 rounded-bl-none'
                      }`}
                    >
                      {/* Attached File Preview */}
                      {m.fileUrl && (
                        isPdf ? (
                          <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                            isUser ? 'bg-black/20 border-white/20 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'
                          }`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className={`w-4 h-4 shrink-0 ${isUser ? 'text-amber-300' : 'text-rose-600'}`} />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10.5px] font-bold truncate">
                                  {m.fileName || 'बायोडाटा_पत्रिका.pdf'}
                                </p>
                                <span className={`text-[8.5px] uppercase font-black ${isUser ? 'text-amber-200' : 'text-rose-700'}`}>
                                  📄 PDF दस्तऐवज
                                </span>
                              </div>
                            </div>
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-1.5 rounded-lg text-[9px] font-black shrink-0 flex items-center gap-1 shadow-xs ${
                                isUser ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : 'bg-rose-600 text-white hover:bg-rose-700'
                              }`}
                              title="PDF उघडा"
                            >
                              <Download className="w-3 h-3" />
                              <span>पहा</span>
                            </a>
                          </div>
                        ) : (
                          <div className="rounded-xl overflow-hidden border border-black/10 bg-black/20 my-1">
                            <img
                              src={m.fileUrl}
                              alt={m.fileName || 'Photo'}
                              referrerPolicy="no-referrer"
                              className="max-h-48 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(m.fileUrl, '_blank')}
                            />
                          </div>
                        )
                      )}

                      {m.message && <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>}
                      
                      <div className="flex items-center justify-end gap-1 text-[8.5px] opacity-80 pt-0.5">
                        <span>{m.timestamp}</span>
                        {isUser && <CheckCheck className="w-3.5 h-3.5 text-amber-200" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached File Bar */}
          {attachedFile && (
            <div className="px-3 py-1.5 bg-amber-100 border-t border-amber-300 flex items-center justify-between text-xs shrink-0">
              <span className="font-bold text-slate-900 truncate max-w-[210px] flex items-center gap-1 text-[11px]">
                {attachedFile.type === 'image' ? (
                  <Image className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                )}
                {attachedFile.name}
              </span>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="text-rose-700 font-black text-[11px] hover:underline cursor-pointer ml-1"
              >
                काढून टाका ✖
              </button>
            </div>
          )}

          {fileError && (
            <div className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-bold shrink-0">
              ⚠️ {fileError}
            </div>
          )}

          {/* Input Footer - Guaranteed NO Send Button Cut-off */}
          <form onSubmit={handleSendMessage} className="p-2 sm:p-2.5 bg-white border-t border-amber-300 flex items-center gap-1.5 shrink-0">
            {/* Photo upload trigger */}
            <label className="p-2 bg-amber-100 hover:bg-amber-200 text-[#A71930] rounded-xl cursor-pointer transition-colors shadow-xs shrink-0" title="फोटो (Image) जोडा">
              {isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
              <input
                type="file"
                accept="image/*"
                disabled={isUploadingFile}
                onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
              />
            </label>

            {/* PDF document upload trigger */}
            <label className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl cursor-pointer transition-colors shadow-xs shrink-0" title="PDF बायोडाटा / पत्रिका जोडा">
              {isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <input
                type="file"
                accept=".pdf,application/pdf"
                disabled={isUploadingFile}
                onChange={(e) => handleFileUpload(e, 'pdf')}
                className="hidden"
              />
            </label>

            <input
              type="text"
              placeholder="इथे मेसेज लिहा..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
            />

            <button
              type="submit"
              disabled={(!messageText.trim() && !attachedFile) || isUploadingFile}
              className="px-3 py-2 bg-[#A71930] hover:bg-[#800C1E] disabled:opacity-40 text-white rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center border border-amber-300/40"
              title="मेसेज पाठवा"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
