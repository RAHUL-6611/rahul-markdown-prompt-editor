/**
 * Toolbar Component
 * Action bar with formatting tools and file operations
 */

import React from 'react';
import type { ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full  shadow-elevation-1 ${className}`}>
      <div className="layout-container">
        <div className="flex items-center justify-between h-[var(--toolbar-height)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
