/**
 * TiptapEditor Component
 * Main editor component using Tiptap with configured extensions
 */

import React, { useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/core';

import { useEditor, useEditorShortcuts, EditorContent } from '../../hooks/useEditor';
import { isFeatureEnabled } from '../../config/features';
import type { EditorComponentProps } from '../../types/editor';

/**
 * Bubble Menu Component for text formatting
 * TODO: Implement in future version when BubbleMenu is properly configured
 */
const EditorBubbleMenu: React.FC<{ editor: Editor | null }> = ({ editor }) => {
  if (!editor || !isFeatureEnabled('TOOLBAR')) return null;
  return null; // Temporarily disabled
};

/**
 * Floating Menu Component for inserting content
 * TODO: Implement in future version when FloatingMenu is properly configured
 */
const EditorFloatingMenu: React.FC<{ editor: Editor | null }> = ({ editor }) => {
  if (!editor || !isFeatureEnabled('TOOLBAR')) return null;
  return null; // Temporarily disabled
};

/**
 * Main TiptapEditor Component
 */
export const TiptapEditor: React.FC<EditorComponentProps> = (props) => {
  const {
    config,
    onContentChange,
    onStateChange,
    initialContent,
    className = '',
    'data-testid': testId,
  } = props;

  // Use custom editor hook
  const { editor, state, focus } = useEditor({
    config,
    onContentChange,
    onStateChange,
    initialContent,
  });

  // Set up keyboard shortcuts
  useEditorShortcuts(editor);

  // Container ref for accessibility
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (editor && config?.theme === 'auto') {
      // Auto-focus on mount if configured
      focus();
    }
  }, [editor, focus, config?.theme]);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[400px] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 ${className}`}
      data-testid={testId || 'tiptap-editor-container'}
      role="textbox"
      aria-label="Markdown editor"
      aria-multiline="true"
    >
      {/* Editor Content */}
      <div className="p-4 min-h-[400px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <EditorContent 
          editor={editor} 
          className="outline-none"
        />
      </div>

      {/* Bubble Menu for text formatting */}
      <EditorBubbleMenu editor={editor} />

      {/* Floating Menu for content insertion */}
      <EditorFloatingMenu editor={editor} />

      {/* Character Count (if enabled) */}
      {isFeatureEnabled('TOOLBAR') && editor && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
          {state.characterCount} characters
          {state.wordCount > 0 && ` • ${state.wordCount} words`}
        </div>
      )}

      {/* Dirty State Indicator */}
      {state.isDirty && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full" title="Unsaved changes" />
      )}
    </div>
  );
};

export default TiptapEditor;
