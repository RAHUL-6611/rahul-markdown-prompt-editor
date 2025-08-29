/**
 * SplitView Layout Component
 * Provides a split view layout for editor and preview with responsive design
 */

import React from 'react';
import { isFeatureEnabled } from '../../config/features';
import type { SplitViewProps } from '../../types/editor';

/**
 * Main SplitView Component
 */
export const SplitView: React.FC<SplitViewProps> = (props) => {
  const {
    editor,
    preview,
    config = {},
    className = '',
    'data-testid': testId,
  } = props;

  // Destructure config with defaults
  const {
    ratio = 0.5, // Fixed 50/50 split for V1
    minWidth = 300,
    className: configClassName = '',
  } = config;

  // Check if responsive layout is enabled
  const isResponsiveEnabled = isFeatureEnabled('RESPONSIVE_LAYOUT');

  return (
    <div
      className={`w-full h-full ${className} ${configClassName}`}
      data-testid={testId || 'split-view-container'}
    >
      {/* Desktop Layout - Side by Side */}
      <div className="hidden lg:flex w-full h-full">
        {/* Editor Panel */}
        <div
          className="flex-1 border-r border-gray-300 dark:border-gray-600"
          style={{ 
            flex: ratio,
            minWidth: `${minWidth}px`,
          }}
          data-testid="editor-panel"
        >
          {editor}
        </div>

        {/* Preview Panel */}
        <div
          className="flex-1"
          style={{ 
            flex: 1 - ratio,
            minWidth: `${minWidth}px`,
          }}
          data-testid="preview-panel"
        >
          {preview}
        </div>
      </div>

      {/* Mobile/Tablet Layout - Stacked */}
      {isResponsiveEnabled && (
        <div className="lg:hidden w-full h-full flex flex-col">
          {/* Mobile Tabs (if needed for future versions) */}
          <div className="flex border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <button
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b-2 border-blue-500"
              data-testid="editor-tab"
            >
              Editor
            </button>
            <button
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              data-testid="preview-tab"
            >
              Preview
            </button>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-hidden">
            {/* Editor Panel (Mobile) */}
            <div className="w-full h-full" data-testid="editor-panel-mobile">
              {editor}
            </div>

            {/* Preview Panel (Mobile) - Hidden by default, can be toggled */}
            <div className="w-full h-full hidden" data-testid="preview-panel-mobile">
              {preview}
            </div>
          </div>
        </div>
      )}

      {/* Fallback for non-responsive mode */}
      {!isResponsiveEnabled && (
        <div className="lg:hidden w-full h-full flex flex-col">
          <div className="flex-1 border-b border-gray-300 dark:border-gray-600">
            {editor}
          </div>
          <div className="flex-1">
            {preview}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Resizable Split View Component (for future versions)
 */
export const ResizableSplitView: React.FC<SplitViewProps> = (props) => {
  // This component will be implemented in future versions
  // when resizable functionality is needed
  return <SplitView {...props} />;
};

export default SplitView;
