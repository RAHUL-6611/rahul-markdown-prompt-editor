/**
 * AppLayout Component
 * Main layout wrapper that provides the overall structure
 */

import React from 'react';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen w-screen bg-surface-secondary transition-normal overflow-x-hidden ${className}`}>
      {children}
    </div>
  );
};

export default AppLayout;
