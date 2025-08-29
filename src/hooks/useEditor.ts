/**
 * useEditor Hook
 * Manages Tiptap editor state and provides content synchronization
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditor as useTiptapEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';

import { createTiptapExtensions } from '../config/tiptap-config';
import { EDITOR_CONFIG } from '../config/features';
import type { 
  ContentState, 
  EditorState, 
  UseEditorReturn,
  EditorComponentProps 
} from '../types/editor';

/**
 * Custom hook for managing Tiptap editor state
 */
export const useEditor = (props: EditorComponentProps): UseEditorReturn => {
  const {
    config = {},
    onContentChange,
    onStateChange,
    initialContent = '',
  } = props;

  // Destructure config with defaults
  const {
    extensions = createTiptapExtensions(),
    className = '',
    maxLength = EDITOR_CONFIG.MAX_CONTENT_LENGTH,
    readOnly = false,
  } = config;

  // Local state
  const [isDirty, setIsDirty] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);

  // Create Tiptap editor instance
  const editor = useTiptapEditor({
    extensions,
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      // Mark as dirty when content changes
      setIsDirty(true);
      
      // Get content in different formats
      const content: ContentState = {
        html: editor.getHTML(),
        markdown: editor.getHTML(), // Convert HTML to markdown in future versions
        json: editor.getJSON(),
        text: editor.getText(),
      };

      // Call content change callback
      onContentChange?.(content);
    },
    onFocus: () => {
      setIsFocused(true);
    },
    onBlur: () => {
      setIsFocused(false);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none ${className}`,
        'data-testid': 'tiptap-editor',
      },
    },
  });

  // Memoized content state
  const content: ContentState = useMemo(() => {
    if (!editor) {
      return {
        html: '',
        markdown: '',
        json: {},
        text: '',
      };
    }

    return {
      html: editor.getHTML(),
      markdown: editor.getHTML(), // Convert HTML to markdown in future versions
      json: editor.getJSON(),
      text: editor.getText(),
    };
  }, [editor]);

  // Memoized editor state
  const state: EditorState = useMemo(() => {
    if (!editor) {
      return {
        content,
        isDirty: false,
        isFocused: false,
        wordCount: 0,
        characterCount: 0,
        lastSaved,
      };
    }

    return {
      content,
      isDirty,
      isFocused,
      wordCount: editor.storage.characterCount?.words() || 0,
      characterCount: editor.storage.characterCount?.characters() || 0,
      lastSaved,
    };
  }, [editor, content, isDirty, isFocused, lastSaved]);

  // Update content function
  const updateContent = useCallback((newContent: string) => {
    if (editor) {
      editor.commands.setContent(newContent);
      setIsDirty(false);
      setLastSaved(new Date());
    }
  }, [editor]);

  // Clear content function
  const clearContent = useCallback(() => {
    if (editor) {
      editor.commands.clearContent();
      setIsDirty(false);
    }
  }, [editor]);

  // Focus function
  const focus = useCallback(() => {
    if (editor) {
      editor.commands.focus();
    }
  }, [editor]);

  // Blur function
  const blur = useCallback(() => {
    if (editor) {
      editor.commands.blur();
    }
  }, [editor]);

  // Notify state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Handle content length limits
  useEffect(() => {
    if (editor && maxLength && state.characterCount > maxLength) {
      // Could implement content truncation here
      console.warn(`Content exceeds maximum length of ${maxLength} characters`);
    }
  }, [editor, maxLength, state.characterCount]);

  return {
    editor,
    content,
    state,
    updateContent,
    clearContent,
    focus,
    blur,
  };
};

/**
 * Hook for debounced content updates
 */
export const useDebouncedContent = (
  content: string,
  delay: number = EDITOR_CONFIG.DEBOUNCE_MS
): string => {
  const [debouncedContent, setDebouncedContent] = useState(content);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedContent(content);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [content, delay]);

  return debouncedContent;
};

/**
 * Hook for editor keyboard shortcuts
 */
export const useEditorShortcuts = (editor: Editor | null) => {
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S for save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        // Trigger save action (to be implemented)
        console.log('Save triggered');
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
  }, [editor]);
};

// Re-export EditorContent for convenience
export { EditorContent };
