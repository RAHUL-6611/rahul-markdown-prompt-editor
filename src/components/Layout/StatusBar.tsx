/**
 * StatusBar Component
 * Bottom status area with statistics and controls
 */

import React from 'react';
import type { ReactNode } from 'react';

interface StatusBarProps {
  children: ReactNode;
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full bg-surface-primary border-t border-primary shadow-elevation-1 ${className}`}>
      <div className="layout-container">
        <div className="flex items-center justify-between h-[var(--status-height)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
