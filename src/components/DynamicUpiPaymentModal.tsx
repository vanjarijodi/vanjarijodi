import React from 'react';
import { Plan } from '../types';
import { CompliantAssistedMembershipModal } from './CompliantAssistedMembershipModal';

interface DynamicUpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

/**
 * 100% Google Play Store Policy Compliant Membership & Account Sync Modal.
 * Inside the Android App, there are strictly NO In-App Purchases, NO payment gateways,
 * NO UPI QR codes, and NO price tags. Users sync their membership status by mobile number
 * or manage their account on vanjarijodi.web.app using their App login.
 */
export const DynamicUpiPaymentModal: React.FC<DynamicUpiPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  if (!isOpen) return null;

  return (
    <CompliantAssistedMembershipModal
      isOpen={isOpen}
      onClose={onClose}
      featureTitle={plan?.nameMr || plan?.name || 'प्रीमियम सदस्यत्व सेवा'}
    />
  );
};
