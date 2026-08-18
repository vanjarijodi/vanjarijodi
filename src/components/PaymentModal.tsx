import React from 'react';
import { Plan } from '../types';
import { DynamicUpiPaymentModal } from './DynamicUpiPaymentModal';

export const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}> = ({ isOpen, onClose, plan }) => {
  return <DynamicUpiPaymentModal isOpen={isOpen} onClose={onClose} plan={plan} />;
};

export default PaymentModal;
