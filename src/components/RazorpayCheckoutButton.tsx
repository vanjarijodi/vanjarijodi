import React, { useState } from 'react';
import { initiateRazorpayPayment } from '../services/razorpayClient';
import { useApp } from '../context/AppContext';
import { Lock, Loader2, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface RazorpayCheckoutButtonProps {
  planId?: string;
  planName?: string;
  amount?: number; // In Rupees or paise
  amountInPaise?: number;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: (paymentResult: any) => void;
  onError?: (errorMessage: string) => void;
  onDismiss?: () => void;
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  planId,
  planName,
  amount,
  amountInPaise,
  buttonText,
  className,
  disabled = false,
  onSuccess,
  onError,
  onDismiss,
}) => {
  const { currentUser, addNotification, logActivity } = useApp();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const handlePay = async (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessData(null);
    setIsLoading(true);

    try {
      await initiateRazorpayPayment({
        planId,
        planName,
        amount,
        amountInPaise,
        userId: currentUser?.id || 'guest-user',
        userName: currentUser?.fullName || 'सन्माननीय सदस्य',
        userMobile: currentUser?.mobile || currentUser?.mobileNumber || '',
        onSuccess: (result) => {
          setIsLoading(false);
          setSuccessData(result);
          if (addNotification) {
            addNotification({
              userId: currentUser?.id || 'guest-user',
              type: 'approval',
              title: '🎉 पेमेंट यशस्वी!',
              message: `Razorpay पेमेंट यशस्वी झाले. पेमेंट आयडी: ${result.paymentId || result.id || 'Verified'}`,
            });
          }
          if (logActivity) {
            logActivity(
              'Razorpay Payment',
              `Razorpay द्वारे पेमेंट यशस्वी. Amount: ₹${result.amount || amount || ''}, Order: ${result.orderId || ''}`,
              currentUser?.fullName || 'Member'
            );
          }
          if (onSuccess) onSuccess(result);
        },
        onError: (errMsg) => {
          setIsLoading(false);
          setErrorMessage(errMsg);
          if (onError) onError(errMsg);
        },
        onDismiss: () => {
          setIsLoading(false);
          if (onDismiss) onDismiss();
        },
      });
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || 'पेमेंट सुरू करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
      setErrorMessage(msg);
      if (onError) onError(msg);
    }
  };

  return (
    <div className="w-full space-y-2">
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successData && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>पेमेंट यशस्वीरित्या पूर्ण झाले! (Payment ID: {successData.paymentId || successData.id})</span>
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={disabled || isLoading}
        className={
          className ||
          'w-full py-3.5 px-5 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:from-[#6B0818] hover:to-[#911228] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98'
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
            <span>सुरक्षित Razorpay गेटवे उघडत आहे...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 text-amber-300" />
            <span>{buttonText || 'Razorpay द्वारे ऑनलाईन पेमेंट करा'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </>
        )}
      </button>
    </div>
  );
};

export default RazorpayCheckoutButton;
