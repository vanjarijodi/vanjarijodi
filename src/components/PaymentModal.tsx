import React from 'react';
import { Plan } from '../types';
import { DynamicUpiPaymentModal } from './DynamicUpiPaymentModal';
import { CompliantAssistedMembershipModal } from './CompliantAssistedMembershipModal';
import { isCompliantMobileApp, isGooglePlayReviewActive } from '../utils/playStorePaymentHelper';
import { useApp } from '../context/AppContext';

export const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}> = ({ isOpen, onClose, plan }) => {
  const { siteConfig } = useApp();

  // On Mobile App or Review Mode, strictly render the Google Play Compliant Assisted Verification Bottom Sheet
  if (isCompliantMobileApp() || isGooglePlayReviewActive(siteConfig)) {
    return (
      <CompliantAssistedMembershipModal
        isOpen={isOpen}
        onClose={onClose}
        featureTitle={plan?.nameMr || plan?.name || 'प्रीमियम सेवा'}
      />
    );
  }

  return <DynamicUpiPaymentModal isOpen={isOpen} onClose={onClose} plan={plan} />;
};

export default PaymentModal;
