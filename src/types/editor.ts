/**
 * Global Types and Interfaces for Markdown Editor
 */

import { Extension } from '@tiptap/core';
import type { ReactNode } from 'react';

// Editor Configuration Types
export interface EditorConfig {
  placeholder?: string;
  extensions?: Extension[];
  className?: string;
  debounceMs?: number;
  theme?: 'light' | 'dark' | 'auto';
  maxLength?: number;
  readOnly?: boolean;
}

// Preview Configuration Types
export interface PreviewConfig {
  className?: string;
  showLineNumbers?: boolean;
  syntaxHighlighting?: boolean;
  githubFlavoredMarkdown?: boolean;
  rehypePlugins?: any[];
  remarkPlugins?: any[];
}

// Split View Configuration
export interface SplitViewConfig {
  ratio?: number; // 0.0 to 1.0
  resizable?: boolean;
  minWidth?: number;
  className?: string;
}

// Toolbar Configuration
export interface ToolbarConfig {
  showBold?: boolean;
  showItalic?: boolean;
  showHeadings?: boolean;
  showLists?: boolean;
  showLinks?: boolean;
  showCode?: boolean;
  showBlockquote?: boolean;
  className?: string;
}

// Theme Types
export interface ThemeConfig {
  current: 'light' | 'dark' | 'auto';
  system: 'light' | 'dark';
  persisted: boolean;
}

// Content State Types
export interface ContentState {
  html: string;
  markdown: string;
  json: any;
  text: string;
}

// Editor State Types
export interface EditorState {
  content: ContentState;
  isDirty: boolean;
  isFocused: boolean;
  wordCount: number;
  characterCount: number;
  lastSaved?: Date;
}

// Version Types (for V2)
export interface Version {
  id: string;
  createdAt: string;
  name?: string;
  content: string;
  summary: string;
}

export interface DocumentState {
  id: string;
  content: string;
  versions: Version[];
  updatedAt: string;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

export interface EditorComponentProps extends BaseComponentProps {
  config?: EditorConfig;
  onContentChange?: (content: ContentState) => void;
  onStateChange?: (state: EditorState) => void;
  initialContent?: string;
}

export interface PreviewComponentProps extends BaseComponentProps {
  config?: PreviewConfig;
  content: string;
  className?: string;
}

export interface SplitViewProps extends BaseComponentProps {
  config?: SplitViewConfig;
  editor: ReactNode;
  preview: ReactNode;
}

export interface ToolbarProps extends BaseComponentProps {
  config?: ToolbarConfig;
  onAction?: (action: string) => void;
}

// Hook Return Types
export interface UseEditorReturn {
  editor: any; // Tiptap editor instance
  content: ContentState;
  state: EditorState;
  updateContent: (content: string) => void;
  clearContent: () => void;
  focus: () => void;
  blur: () => void;
}

export interface UseThemeReturn {
  theme: ThemeConfig;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleTheme: () => void;
  isDark: boolean;
}

// Event Types
export interface EditorEvents {
  onContentChange?: (content: ContentState) => void;
  onSelectionChange?: (selection: any) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onPaste?: (event: ClipboardEvent) => void;
}

// Error Types
export interface EditorError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Performance Types
export interface PerformanceMetrics {
  renderTime: number;
  updateTime: number;
  memoryUsage?: number;
  timestamp: Date;
}

// Accessibility Types
export interface AccessibilityConfig {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  keyboardShortcuts?: Record<string, string>;
}

// Export all types
export type {
  Extension,
  ReactNode,
};

// Re-export ThemeType from features
export type { ThemeType } from '../config/features';
