import React from 'react';
import { AdminPanel } from './AdminPanel';

export interface AdminStandaloneAppProps {
  onBackToMemberApp?: () => void;
}

export const AdminStandaloneApp: React.FC<AdminStandaloneAppProps> = ({ onBackToMemberApp }) => {
  return (
    <AdminPanel
      isOpen={true}
      onClose={onBackToMemberApp || (() => {})}
    />
  );
};

export default AdminStandaloneApp;
