/**
 * Tiptap Extensions Configuration
 * Centralized configuration for all Tiptap extensions used in the editor
 */

import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TableKit } from '@tiptap/extension-table';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import FloatingMenu from '@tiptap/extension-floating-menu';

// Import configuration constants
import { EDITOR_CONFIG } from './features';

/**
 * Default Tiptap extensions configuration for V1
 * Includes StarterKit + recommended extensions for markdown editing
 */
export const createTiptapExtensions = () => [
  // Starter Kit - Core functionality
  StarterKit.configure({
    // Configure heading levels (H1-H6)
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {
        class: 'font-bold',
      },
    },
    // Configure code block styling
    codeBlock: {
      HTMLAttributes: {
        class: 'bg-gray-100 dark:bg-gray-800 p-4 rounded-md font-mono text-sm',
      },
    },
    // Configure inline code styling
    code: {
      HTMLAttributes: {
        class: 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono',
      },
    },
    // Configure blockquote styling
    blockquote: {
      HTMLAttributes: {
        class: 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic',
      },
    },
    // Configure horizontal rule styling
    horizontalRule: {
      HTMLAttributes: {
        class: 'border-t border-gray-300 dark:border-gray-600 my-4',
      },
    },
  }),

  // Link extension - For markdown links
  Link.configure({
    openOnClick: false, // Don't open links on click (let user control)
    protocols: ['http', 'https', 'mailto', 'tel'],
    autolink: true, // Auto-detect and create links
    linkOnPaste: true, // Create links when pasting URLs
    HTMLAttributes: {
      class: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  }),

  // Placeholder extension - Better UX
  Placeholder.configure({
    placeholder: ({ node }) => {
      // Different placeholders for different node types
      if (node.type.name === 'heading') {
        return 'Heading';
      }
      if (node.type.name === 'codeBlock') {
        return 'Enter code...';
      }
      if (node.type.name === 'blockquote') {
        return 'Enter quote...';
      }
      return EDITOR_CONFIG.DEFAULT_PLACEHOLDER;
    },
  }),

  // Character count extension - Content limits
  CharacterCount.configure({
    limit: EDITOR_CONFIG.MAX_CONTENT_LENGTH,
  }),

  // Task list extensions - GitHub flavored markdown
  TaskList.configure({
    HTMLAttributes: {
      class: 'list-none space-y-2',
    },
  }),

  TaskItem.configure({
    HTMLAttributes: {
      class: 'flex items-start space-x-2',
    },
  }),

  // TableKit - Complete table functionality
  TableKit,

  // Bubble menu - Floating formatting menu
  BubbleMenu.configure({
    element: null, // Will be set dynamically
    shouldShow: ({ editor, from, to }) => {
      // Only show when text is selected and editor is not destroyed
      return from !== to && !editor.isDestroyed;
    },
  }),

  // Floating menu - Insert menu
  FloatingMenu.configure({
    element: null, // Will be set dynamically
    shouldShow: ({ editor }) => {
      // Show when cursor is in empty paragraph
      return editor.isActive('paragraph') && editor.isEmpty;
    },
  }),
];

/**
 * Minimal extensions configuration (for testing or basic usage)
 */
export const createMinimalExtensions = () => [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Placeholder.configure({
    placeholder: EDITOR_CONFIG.DEFAULT_PLACEHOLDER,
  }),
];

/**
 * Extended extensions configuration (for future versions)
 */
export const createExtendedExtensions = () => [
  ...createTiptapExtensions(),
  // Add more extensions here for V2+
];

/**
 * Extension presets for different use cases
 */
export const EXTENSION_PRESETS = {
  minimal: createMinimalExtensions,
  default: createTiptapExtensions,
  extended: createExtendedExtensions,
} as const;

export type ExtensionPreset = keyof typeof EXTENSION_PRESETS;
