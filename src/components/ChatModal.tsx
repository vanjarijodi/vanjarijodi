import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { uploadToCloudinary, validateFileSize } from '../utils/cloudinary';
import {
  X,
  Send,
  Image,
  FileText,
  Mic,
  Smile,
  CheckCheck,
  PhoneCall,
  Video,
  Loader2,
  Download,
  Paperclip,
  ExternalLink,
  Trash2,
} from 'lucide-react';

export const ChatModal: React.FC<{
  user: UserProfile | null;
  onClose: () => void;
}> = ({ user, onClose }) => {
  const {
    currentUser,
    chatMessages,
    sendChatMessage,
    deleteChatMessage,
    setActiveVideoUser,
    siteConfig,
    isAdminLoggedIn,
  } = useApp();

  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<{ url: string; name: string; type: 'image' | 'pdf' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length, user?.id]);

  if (!user || !currentUser) return null;

  const isChatDisabledByAdmin = siteConfig?.enableChatGlobal === false;
  const isUserBlockedFromChat = currentUser?.isChatBlocked;

  const currentChatMsgs = chatMessages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.receiverId === user.id) ||
      (m.senderId === user.id && m.receiverId === currentUser.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachedMedia) return;

    if (attachedMedia?.type === 'image') {
      sendChatMessage(user.id, text.trim() || '📷 फोटो', attachedMedia.url, undefined, undefined, undefined, 'image');
    } else if (attachedMedia?.type === 'pdf') {
      sendChatMessage(user.id, text.trim() || `📄 PDF: ${attachedMedia.name}`, undefined, undefined, attachedMedia.url, attachedMedia.name, 'pdf');
    } else {
      sendChatMessage(user.id, text.trim());
    }

    setText('');
    setAttachedMedia(null);
    setShowEmojis(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'image' | 'pdf') => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const val = validateFileSize(file);
    if (!val.valid) {
      setUploadError(val.errorMsg || 'फाईलचा आकार १० MB पेक्षा लहान असावा.');
      return;
    }

    setIsUploading(true);
    const res = await uploadToCloudinary(file, 'vanjarijodi_chat_attachments');
    setIsUploading(false);

    if (res.success && res.url) {
      setAttachedMedia({ url: res.url, name: file.name, type: mediaType });
    } else {
      // Fallback to FileReader base64 Data URL if Cloudinary is unreachable
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedMedia({ url: reader.result, name: file.name, type: mediaType });
        } else {
          setUploadError('फाईल अपलोड करता आली नाही.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sampleEmojis = ['🌸', '🙏', '❤️', '😊', '👍', '💐', '✨', '🚩', '💍', '🎉'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-lg bg-[#efeae2] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl text-slate-800 overflow-hidden my-auto h-[92dvh] sm:h-[620px] max-h-[620px] flex flex-col">
        
        {/* WhatsApp Style Chat Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#075e54] text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-amber-300 shrink-0 shadow">
              <img src={user.photos[0]} alt={user.fullName} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-900" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs sm:text-sm text-white truncate leading-tight">{user.fullName}</h3>
              <p className="text-[10px] text-emerald-200 font-semibold truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ऑनलाइन व्हॉट्सॲप चॅट
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={`tel:${user.mobile}`}
              className="p-2 rounded-full hover:bg-white/10 text-amber-200 transition-colors"
              title="फोन करा"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveVideoUser(user);
              }}
              className="p-2 rounded-full hover:bg-white/10 text-amber-200 transition-colors cursor-pointer"
              title="व्हिडिओ कॉल"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer ml-1"
              title="बंद करा"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WhatsApp Background Chat Body */}
        <div 
          className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#efeae2] touch-pan-y min-h-0"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="text-center my-1">
            <span className="text-[9px] sm:text-[10px] bg-[#dcf8c6] text-[#075e54] font-black px-3 py-1 rounded-full border border-emerald-300 shadow-xs inline-block">
              🔒 end-to-end encrypted • सुरक्षित व्हॉट्सॲप संवाद
            </span>
          </div>

          {currentChatMsgs.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-12 px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-[#075e54]">
                💬
              </div>
              <p className="font-bold text-slate-700">संवादाची सुरुवात करा!</p>
              <p className="text-[11px] text-slate-500">
                खाली फोटो, बायोडाटा PDF किंवा थेट संदेश पाठवून संवाद सुरू करा.
              </p>
            </div>
          ) : (
            currentChatMsgs.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const canDeleteMessage = isAdminLoggedIn || (isMe && siteConfig?.allowUsersToDeleteChatMessages === true);

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] p-2.5 rounded-2xl text-xs space-y-1.5 shadow-sm relative ${
                      isMe
                        ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-none border border-emerald-300'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                    }`}
                  >
                    {/* Render Image Attachment */}
                    {msg.imageUrl && (
                      <div className="rounded-xl overflow-hidden border border-black/10 bg-slate-900/5">
                        <img 
                          src={msg.imageUrl} 
                          alt="Attachment" 
                          referrerPolicy="no-referrer"
                          className="max-h-56 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => window.open(msg.imageUrl, '_blank')}
                        />
                      </div>
                    )}

                    {/* Render PDF Attachment */}
                    {(msg.pdfUrl || msg.fileType === 'pdf') && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 my-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-2 bg-rose-600 text-white rounded-lg shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-slate-900 truncate">
                              {msg.pdfName || 'बायोडाटा / पत्रिका.pdf'}
                            </p>
                            <span className="text-[9px] text-rose-700 font-extrabold uppercase">PDF दस्तऐवज</span>
                          </div>
                        </div>
                        <a
                          href={msg.pdfUrl || msg.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shrink-0 text-[10px] font-bold flex items-center gap-1 shadow-xs"
                          title="PDF उघडा / डाउनलोड करा"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>पहा</span>
                        </a>
                      </div>
                    )}

                    {msg.voiceUrl && (
                      <div className="flex items-center gap-2 bg-emerald-100 p-2 rounded-xl text-emerald-900 border border-emerald-300">
                        <Mic className="w-4 h-4 text-[#075e54] animate-pulse" />
                        <span className="font-mono text-[11px] font-bold">🎙️ व्हॉईस टीप (०:१५ सेकंद)</span>
                      </div>
                    )}

                    {msg.text && <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>}
                    
                    <div className="flex items-center justify-between gap-2 text-[9px] font-bold text-slate-500 pt-0.5 border-t border-black/5 mt-1">
                      <div className="flex items-center gap-1">
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-600" />}
                      </div>

                      {/* Message Delete Action Button */}
                      {canDeleteMessage && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('हा संदेश डिलीट करायचा आहे का?')) {
                              deleteChatMessage(msg.id);
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 p-0.5 rounded hover:bg-rose-100 transition-colors cursor-pointer opacity-80 hover:opacity-100"
                          title="संदेश डिलीट करा"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Preview Bar */}
        {attachedMedia && (
          <div className="px-3 py-1.5 bg-amber-100 border-t border-amber-300 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {attachedMedia.type === 'image' ? (
                <Image className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-rose-700 shrink-0" />
              )}
              <span className="font-bold text-slate-900 truncate text-[11px]">
                {attachedMedia.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedMedia(null)}
              className="text-rose-700 font-black text-[11px] hover:underline cursor-pointer ml-2"
            >
              काढून टाका ✖
            </button>
          </div>
        )}

        {uploadError && (
          <div className="px-3 py-1 bg-rose-100 text-rose-800 text-[10px] font-bold shrink-0">
            ⚠️ {uploadError}
          </div>
        )}

        {/* Emoji Selector Bar */}
        {showEmojis && (
          <div className="p-2 bg-white border-t border-slate-200 flex gap-2 overflow-x-auto shrink-0 scrollbar-thin">
            {sampleEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setText((prev) => prev + emoji);
                  setShowEmojis(false);
                }}
                className="text-xl hover:scale-125 transition-transform p-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar - Fixed rigidly at bottom */}
        {isChatDisabledByAdmin ? (
          <div className="p-3 bg-slate-100 border-t border-amber-300 text-center text-xs text-amber-900 font-bold shrink-0">
            ⚠️ प्रशासकांनी सद्यस्थितीत सदस्यांमधील चॅट सुविधा तात्पुरती बंद केली आहे.
          </div>
        ) : isUserBlockedFromChat ? (
          <div className="p-3 bg-rose-100 border-t border-rose-300 text-center text-xs text-rose-900 font-bold shrink-0">
            🚫 तुमच्या खात्याची चॅट सुविधा प्रशासकांनी ब्लॉक केली आहे.
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-2 sm:p-2.5 bg-[#f0f2f5] border-t border-slate-300 flex items-center gap-1.5 shrink-0">
            
            <button
              type="button"
              onClick={() => setShowEmojis(!showEmojis)}
              className="p-2 text-slate-600 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
              title="इमोजी निवडा"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Photo Attachment Button */}
            <label className="p-2 text-slate-600 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer" title="फोटो (Image) जोडा">
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-700" /> : <Image className="w-5 h-5" />}
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
              />
            </label>

            {/* PDF Document Attachment Button */}
            <label className="p-2 text-slate-600 hover:text-rose-700 transition-colors shrink-0 cursor-pointer" title="PDF (बायोडाटा / पत्रिका) जोडा">
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-rose-700" /> : <FileText className="w-5 h-5" />}
              <input
                type="file"
                accept=".pdf,application/pdf"
                disabled={isUploading}
                onChange={(e) => handleFileUpload(e, 'pdf')}
                className="hidden"
              />
            </label>

            <input
              type="text"
              placeholder="संदेश टाइप करा..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 min-w-0 bg-white border border-slate-300 rounded-full px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#075e54]"
            />

            <button
              type="submit"
              disabled={(!text.trim() && !attachedMedia) || isUploading}
              className="p-2.5 bg-[#075e54] hover:bg-[#128c7e] disabled:opacity-40 text-white rounded-full shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center border border-emerald-400/40"
              title="पाठवा"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
