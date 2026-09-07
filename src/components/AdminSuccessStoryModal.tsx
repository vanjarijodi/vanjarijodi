import React, { useState } from 'react';
import { X, Heart, CheckCircle2, Edit3, Trash2, Send, MessageCircle, AlertCircle } from 'lucide-react';
import { SuccessStory } from '../types';

interface AdminSuccessStoryModalProps {
  story: SuccessStory | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (storyId: string, updatedStory?: Partial<SuccessStory>) => void;
  onReject: (storyId: string, reason: string) => void;
  onDelete: (storyId: string) => void;
}

export const AdminSuccessStoryModal: React.FC<AdminSuccessStoryModalProps> = ({
  story,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
}) => {
  if (!isOpen || !story) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [groomName, setGroomName] = useState(story.groomName || '');
  const [brideName, setBrideName] = useState(story.brideName || '');
  const [weddingDate, setWeddingDate] = useState(story.weddingDate || '');
  const [heading, setHeading] = useState(story.heading || '');
  const [storyContent, setStoryContent] = useState(story.story || story.description || '');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleApproveWithEdits = () => {
    onApprove(story.id, {
      groomName,
      brideName,
      weddingDate,
      heading: heading || `${groomName} ❤️ ${brideName}`,
      story: storyContent,
      description: storyContent,
      status: 'approved',
    });
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(story.id, rejectReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-amber-400 shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white p-4 flex items-center justify-between border-b border-amber-300 shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
            <h3 className="font-black text-sm">यशोगाथा संपादन व मंजुरी (Success Story Review)</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/20 rounded-lg text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 text-xs font-bold flex-1">
          {/* Status Badge */}
          <div className="flex items-center justify-between bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs">
            <span className="text-slate-600">सध्याची स्थिती:</span>
            <span
              className={`px-3 py-1 rounded-full font-black text-[11px] ${
                story.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : story.status === 'rejected'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {story.status === 'approved'
                ? '✅ मंजूर (Approved)'
                : story.status === 'rejected'
                ? '❌ नामंजूर (Rejected)'
                : '⏳ प्रलंबित (Pending Approval)'}
            </span>
          </div>

          {/* Photos */}
          {story.photoUrl && (
            <div className="rounded-xl overflow-hidden border border-amber-200 max-h-48">
              <img
                src={story.photoUrl}
                alt="Marriage Photo"
                referrerPolicy="no-referrer"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Edit Mode Toggle */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#800C1E] rounded-xl font-bold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'वाचन मोड' : 'शब्द-न-शब्द संपादन करा (Word-by-Word Edit)'}</span>
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-300">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block text-[11px]">वर (Groom Name):</label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full p-2 bg-white border rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block text-[11px]">वधू (Bride Name):</label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full p-2 bg-white border rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block text-[11px]">विवाह तारीख (Wedding Date):</label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-slate-700 block text-[11px]">शीर्षक (Title / Heading):</label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg text-xs font-bold"
                  placeholder="उदा. वंजारी जोडी द्वारे जुळलेली सुंदर रेशीमगाठ"
                />
              </div>

              <div>
                <label className="text-slate-700 block text-[11px]">अनुभव / यशोगाथा मजकूर (Story Content):</label>
                <textarea
                  rows={4}
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg text-xs font-medium leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
              <div className="font-bold text-[#800C1E] text-sm">
                {heading || `${groomName} ❤️ ${brideName}`}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                विवाह तारीख: {weddingDate || 'माहिती उपलब्ध नाही'}
              </div>
              <p className="text-slate-800 font-medium text-xs leading-relaxed whitespace-pre-line pt-1 border-t border-amber-200">
                {storyContent || 'मजकूर उपलब्ध नाही'}
              </p>
            </div>
          )}

          {/* Reject Reason Input */}
          {showRejectInput && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-300 space-y-2">
              <label className="text-rose-900 block font-bold text-xs">नामंजूर करण्याचे कारण सांगा:</label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="उदा. फोटो सुस्पष्ट नाही किंवा नाव जुळत नाही."
                className="w-full p-2 bg-white border rounded-lg text-xs text-slate-900"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(false)}
                  className="px-3 py-1 bg-slate-200 text-slate-800 rounded-lg text-[11px]"
                >
                  मागे जा
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold"
                >
                  नामंजूर निश्चित करा
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              if (confirm('खात्री आहे का? ही यशोगाथा डिलीट करायची आहे का?')) {
                onDelete(story.id);
                onClose();
              }
            }}
            className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>हटवा</span>
          </button>

          <div className="flex items-center gap-2">
            {!showRejectInput && (
              <button
                onClick={() => setShowRejectInput(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
              >
                नामंजूर करा
              </button>
            )}

            <button
              onClick={handleApproveWithEdits}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>मंजूर करून प्रकाशित करा (Approve & Publish)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
