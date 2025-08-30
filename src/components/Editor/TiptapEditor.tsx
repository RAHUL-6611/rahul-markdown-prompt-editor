/**
 * MarkdownEditor Component
 * Simple textarea-based Markdown editor
 */

import React, { useState, useEffect, useRef } from 'react';
import type { EditorComponentProps } from '../../types/editor';
import { useEditorShortcuts } from '../../hooks/useEditor';

export const TiptapEditor: React.FC<EditorComponentProps> = (props) => {
  const { onContentChange, initialContent = '', className = '', 'data-testid': testId, onSaveVersion } = props;
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set up keyboard shortcuts
  useEditorShortcuts(null, onSaveVersion);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onContentChange) {
      onContentChange({
        html: newContent, // Raw Markdown content, treated as HTML for preview
        markdown: newContent, // Raw Markdown content
        json: {},
        text: newContent,
      });
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  useEffect(() => { setContent(initialContent); }, [initialContent]);
  
  // Detect prompt structure patterns
  const hasContext = content.includes('Context:') || content.includes('Background:');
  const hasInstructions = content.includes('Instructions:') || content.includes('Task:');
  const hasExamples = content.includes('Example:') || content.includes('Sample:');
  const hasConstraints = content.includes('Constraints:') || content.includes('Requirements:');

  return (
    <div 
      className={`h-full min-h-[200px] md:min-h-[400px] flex flex-col bg-surface-primary border border-primary   overflow-y-auto rounded-lg shadow-elevation-1 ${className}`} 
      data-testid={testId || 'markdown-editor-container'} 
      role="textbox" 
      aria-label="Markdown editor" 
      aria-multiline="true"
    >
      {/* Prompt Editor Header */}
      <div className="px-4 py-3 border-b border-primary bg-surface-secondary rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center space-md min-w-0">
            <h3 className="text-body font-medium text-primary flex-shrink-0">Prompt Editor</h3>
            
            {/* Prompt Structure Indicators */}
            <div className="flex items-center space-sm flex-shrink-0">
              {hasContext && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-primary-50 text-primary-700 border border-primary-200">
                  Context
                </span>
              )}
              {hasInstructions && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-success-50 text-success-600 border border-success-200">
                  Instructions
                </span>
              )}
              {hasExamples && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-warning-50 text-warning-600 border border-warning-200">
                  Examples
                </span>
              )}
              {hasConstraints && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-error-50 text-error-600 border border-error-200">
                  Constraints
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 p-4 max-h-[60vh]">
        <textarea 
          ref={textareaRef}
          value={content} 
          onChange={handleChange} 
          placeholder="Write your markdown prompt here..." 
          className="w-full outline-none resize-none bg-transparent text-primary placeholder:text-tertiary font-mono min-h-[200px]"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }} 
        />
      </div>
    </div>
  );
};

export default TiptapEditor;
