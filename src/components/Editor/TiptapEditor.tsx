/**
 * MarkdownEditor Component
 * Simple textarea-based Markdown editor
 */

import React, { useState, useEffect } from 'react';
import { isFeatureEnabled } from '../../config/features';
import type { EditorComponentProps } from '../../types/editor';

/**
 * Main MarkdownEditor Component
 * Simple textarea that captures raw Markdown input
 */
export const TiptapEditor: React.FC<EditorComponentProps> = (props) => {
  const {
    onContentChange,
    initialContent = '',
    className = '',
    'data-testid': testId,
  } = props;

  const [content, setContent] = useState(initialContent);

  // Handle content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (onContentChange) {
      onContentChange({
        html: newContent, // We'll convert this to HTML in the preview
        markdown: newContent, // Raw Markdown content
        json: {}, // Not needed for simple editor
        text: newContent,
      });
    }
  };

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Calculate character and word count
  const characterCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div
      className={`relative min-h-[400px] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 ${className}`}
      data-testid={testId || 'markdown-editor-container'}
      role="textbox"
      aria-label="Markdown editor"
      aria-multiline="true"
    >
      {/* Editor Header */}
      <div className="px-4 py-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Editor
          </h3>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              Markdown
            </span>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-[400px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Start writing your markdown..."
          className="w-full h-full min-h-[350px] outline-none resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm leading-relaxed"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
        />
      </div>

      {/* Character Count */}
      {isFeatureEnabled('TOOLBAR') && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
          {characterCount} characters
          {wordCount > 0 && ` • ${wordCount} words`}
        </div>
      )}
    </div>
  );
};

export default TiptapEditor;
