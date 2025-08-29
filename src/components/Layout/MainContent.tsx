/**
 * MainContent Component
 * Main content area with responsive layout and proper spacing
 */

import React from 'react';
import type { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({ children, className = '' }) => {
  return (
    <main className={`flex-1 flex flex-col w-full layout-container ${className}`}>
      {children}
    </main>
  );
};

export default MainContent;
