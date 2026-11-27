import React, { useState, useMemo } from 'react';
import {
  X,
  Gift,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Users,
  ShieldCheck,
  Send,
  MessageCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { UserProfile, MembershipTier } from '../types';
import { useApp } from '../context/AppContext';

interface AdminGrantFreeMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If granting to a single member
  profile?: UserProfile | null;
  // If granting in bulk to multiple selected members
  selectedProfiles?: UserProfile[];
  onSuccess?: () => void;
}

export const AdminGrantFreeMembershipModal: React.FC<AdminGrantFreeMembershipModalProps> = ({
  isOpen,
  onClose,
  profile,
  selectedProfiles = [],
  onSuccess,
}) => {
  const { updateMemberTier, updateProfileDirect, sendPushNotification, logActivity, currentUser } = useApp();

  // Combine targets
  const targets = useMemo(() => {
    if (profile) return [profile];
    if (selectedProfiles.length > 0) return selectedProfiles;
    return [];
  }, [profile, selectedProfiles]);

  // Duration State (Sections 8 & 9)
  const [durationOption, setDurationOption] = useState<
    '7_days' | '15_days' | '30_days' | '3_months' | '6_months' | '1_year' | 'lifetime' | 'custom'
  >('30_days');

  const [customExpiryDate, setCustomExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const [adminNote, setAdminNote] = useState<string>('ॲडमिन कडून मोफत सदस्यत्व भेट (Free Access)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successCount, setSuccessCount] = useState<number>(0);

  // Calculate live preview expiry date
  const calculatedExpiry = useMemo(() => {
    const now = new Date();
    let target = new Date();
    let label = '';

    switch (durationOption) {
      case '7_days':
        target.setDate(now.getDate() + 7);
        label = '७ दिवस (7 Days)';
        break;
      case '15_days':
        target.setDate(now.getDate() + 15);
        label = '१५ दिवस (15 Days)';
        break;
      case '30_days':
        target.setDate(now.getDate() + 30);
        label = '३० दिवस / १ महिना (30 Days)';
        break;
      case '3_months':
        target.setMonth(now.getMonth() + 3);
        label = '३ महिने (3 Months)';
        break;
      case '6_months':
        target.setMonth(now.getMonth() + 6);
        label = '६ महिने (6 Months)';
        break;
      case '1_year':
        target.setFullYear(now.getFullYear() + 1);
        label = '१ वर्ष (1 Year)';
        break;
      case 'lifetime':
        target.setFullYear(now.getFullYear() + 10);
        label = 'आजीवन (Lifetime Access)';
        break;
      case 'custom':
        target = new Date(customExpiryDate);
        label = `कस्टम तारीख (${target.toLocaleDateString('mr-IN')})`;
        break;
    }

    return {
      date: target,
      iso: target.toISOString(),
      formatted: target.toLocaleDateString('mr-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      durationLabel: label,
    };
  }, [durationOption, customExpiryDate]);

  if (!isOpen || targets.length === 0) return null;

  const handleConfirmFreeAccess = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Call authoritative Server API
      const serverPayload = {
        userIds: targets.map((t) => t.id),
        members: targets.map((t) => ({
          userId: t.id,
          userName: t.fullName,
          userMobile: t.mobile || t.whatsappNumber || '',
          previousTier: t.membershipTier || 'free',
        })),
        duration: durationOption,
        customExpiryDate: durationOption === 'custom' ? calculatedExpiry.iso : undefined,
        adminNote,
        adminId: currentUser?.id || 'admin-primary',
        adminName: currentUser?.fullName || 'Super Admin',
      };

      const res = await fetch('/api/admin/grant-free-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverPayload),
      });

      const data = await res.json().catch(() => ({ success: false }));

      // 2. Client Context Sync
      const nowIso = new Date().toISOString();
      for (const target of targets) {
        // Upgrade user in local React state and Firestore
        updateMemberTier(target.id, 'gold' as MembershipTier, undefined, {
          paymentPlanName: `मोफत सदस्यत्व भेट (${calculatedExpiry.durationLabel})`,
          paymentAmount: 0,
          paymentUtr: `FREE-GIFT-${Date.now().toString().slice(-6)}`,
          paymentMethod: 'admin_grant',
          paidAt: nowIso,
          paymentApprovedAt: nowIso,
          adminNote: adminNote,
        });

        // Also update profile fields directly
        updateProfileDirect(target.id, {
          membershipTier: 'gold',
          membershipExpiryDate: calculatedExpiry.iso,
          isApproved: true,
          isVerified: true,
        });

        // Send Push Notification
        if (typeof sendPushNotification === 'function') {
          sendPushNotification(
            target.id,
            '🎁 अभिनंदन! मोफत सदस्यत्व भेट!',
            `प्रशासकाकडून तुम्हाला ${calculatedExpiry.durationLabel} साठी मोफत प्रीमियम सदस्यत्व देण्यात आले आहे. सर्व प्रोफाईल्स संपर्क अनलॉक झाले!`
          );
        }
      }

      // Log admin activity
      logActivity(
        'Admin Grant Free Membership',
        `ॲडमिनने ${targets.length} सदस्यांना (${targets.map((t) => t.fullName).slice(0, 3).join(', ')}${targets.length > 3 ? '...' : ''}) मोफत सदस्यत्व प्रदान केले. वैधता: ${calculatedExpiry.formatted}. शेरा: ${adminNote}`,
        currentUser?.fullName || 'Super Admin'
      );

      setSuccessCount(targets.length);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error granting free membership:', err);
      setErrorMessage(err.message || 'मोफत सदस्यत्व देताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Gift className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif">
                {targets.length > 1
                  ? `मोफत सदस्यत्व मंजुरी (Bulk: ${targets.length} सदस्य)`
                  : 'मोफत सदस्यत्व मंजुरी (Grant Free Access)'}
              </h3>
              <p className="text-xs text-amber-200/90">
                कोणतेही पेमेंट न घेता १-क्लिकमध्ये थेट प्रीमियम ॲक्सेस द्या
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {!isSuccess ? (
            <>
              {/* Target Recipient Card */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    {targets.length > 1 ? <Users className="w-5 h-5" /> : targets[0].fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {targets.length > 1
                        ? `${targets.length} निवडलेले सदस्य (Selected Members)`
                        : targets[0].fullName}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {targets.length > 1
                        ? targets.map((t) => t.fullName).slice(0, 3).join(', ') + (targets.length > 3 ? '...' : '')
                        : `मोबाईल: ${targets[0].mobile || targets[0].whatsappNumber || 'N/A'}`}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {targets.length > 1 ? `${targets.length} Recipients` : 'Single User'}
                </span>
              </div>

              {/* Duration Options (Section 9) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  मोफत कालावधी निवडा (Free Plan Duration):
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: '7_days', label: '⚡ ७ दिवस (7 Days)' },
                    { id: '15_days', label: '⚡ १५ दिवस (15 Days)' },
                    { id: '30_days', label: '⭐ ३० दिवस (1 Month)' },
                    { id: '3_months', label: '⭐ ३ महिने (3 Months)' },
                    { id: '6_months', label: '👑 ६ महिने (6 Months)' },
                    { id: '1_year', label: '👑 १ वर्ष (1 Year)' },
                    { id: 'lifetime', label: '♾️ आजीवन (Lifetime)' },
                    { id: 'custom', label: '📅 कस्टम तारीख (Custom)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDurationOption(opt.id as any)}
                      className={`py-2 px-3 rounded-xl border text-left font-semibold transition cursor-pointer flex items-center justify-between ${
                        durationOption === opt.id
                          ? 'border-[#800C1E] bg-[#800C1E]/5 text-[#800C1E] ring-1 ring-[#800C1E]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {durationOption === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#800C1E]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Input if selected */}
              {durationOption === 'custom' && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <label className="block text-[11px] font-bold text-gray-600">
                    अंतिम तारीख निवडा (Select Expiry Date):
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={customExpiryDate}
                    onChange={(e) => setCustomExpiryDate(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#800C1E] outline-none"
                  />
                </div>
              )}

              {/* Live Preview Box */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600">प्लॅन प्रकार:</span>
                  <span className="font-bold text-emerald-900">मोफत गिफ्ट सदस्यत्व (Gold Tier)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">वैधता कालावधी:</span>
                  <span className="font-bold text-emerald-800">{calculatedExpiry.durationLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">अंतिम तारीख (Expires On):</span>
                  <span className="font-bold text-[#800C1E]">{calculatedExpiry.formatted}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200 text-[11px]">
                  <span className="text-gray-500">प्रीमियम सुविधा:</span>
                  <span className="text-emerald-700 font-semibold">सर्व संपर्क + पत्रिका अनलॉक</span>
                </div>
              </div>

              {/* Admin Note Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  ॲडमिन शेरा / टीप (Admin Note - Optional):
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="उदा. विशेष सवलत भेट / ओळखीतून मोफत ॲक्सेस"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#800C1E] outline-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleConfirmFreeAccess}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>सक्रिय होत आहे...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      {targets.length > 1
                        ? `CONFIRM FREE ACCESS (${targets.length} सदस्य)`
                        : 'CONFIRM FREE ACCESS (मोफत सदस्यत्व द्या)'}
                    </span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Success View */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold font-serif text-gray-900">
                  मोफत सदस्यत्व यशस्वीरित्या सक्रिय झाले!
                </h4>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  {successCount} सदस्यांना {calculatedExpiry.durationLabel} साठी मोफत प्रीमियम ॲक्सेस प्रदान करण्यात आला आहे.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs max-w-xs mx-auto space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">वैधता:</span>
                  <span className="font-bold text-gray-800">{calculatedExpiry.formatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">स्टेटस:</span>
                  <span className="font-bold text-emerald-700">ACTIVE PREMIUM</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-[#800C1E] text-white text-xs font-bold rounded-xl hover:bg-[#6A0A19] cursor-pointer"
              >
                पूर्ण झाले (Close)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
