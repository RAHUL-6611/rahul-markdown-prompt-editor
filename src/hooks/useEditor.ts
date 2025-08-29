/**
 * useEditor Hook
 * Re-exports the official useEditor from @tiptap/react
 */

import { useEditor as useTiptapEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { useEffect } from 'react';

// Re-export the official useEditor
export const useEditor = useTiptapEditor;

// Re-export EditorContent for convenience
export { EditorContent };

/**
 * Hook for editor keyboard shortcuts
 */
export const useEditorShortcuts = (
  editor: Editor | null,
  onSaveVersion?: () => void
) => {
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S for save version
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (onSaveVersion) {
          onSaveVersion();
        }
      }

      // Ctrl/Cmd + B for bold
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        editor.chain().focus().toggleBold().run();
      }

      // Ctrl/Cmd + I for italic
      if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
        event.preventDefault();
        editor.chain().focus().toggleItalic().run();
      }

      // Ctrl/Cmd + K for link
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Trigger link dialog (to be implemented)
        console.log('Link dialog triggered');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, onSaveVersion]);
};
