/**
 * EditorSection Component
 * Main editing area with responsive split view
 */

import React from 'react';
import type { ReactNode } from 'react';

interface EditorSectionProps {
  editor: ReactNode;
  preview: ReactNode;
  className?: string;
}

export const EditorSection: React.FC<EditorSectionProps> = ({ 
  editor, 
  preview, 
  className = '' 
}) => {
  return (
    <section className={`flex-1 flex flex-col w-full h-full ${className}`}>
      <div className="editor-split editor-split-mobile lg:editor-split-desktop w-full h-full">
        {/* Editor Panel */}
        <div className="editor-panel w-full h-full">
          {editor}
        </div>

        {/* Preview Panel */}
        <div className="preview-panel w-full h-full">
          {preview}
        </div>
      </div>
    </section>
  );
};

export default EditorSection;
