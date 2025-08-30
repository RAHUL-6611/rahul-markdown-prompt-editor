/**
 * Feature Flags Configuration
 * Controls which features are enabled/disabled across different versions
 */

// Version flags - controls which version features are active
export const VERSION_FLAGS = {
  V1_BASIC_EDITOR: true,    // Split view editor with live preview
  V2_PERSISTENCE: true,     // IndexedDB storage with localStorage fallback
  V3_TESTING: false,        // Vitest testing setup
} as const;

// Feature flags - controls specific features within versions
export const FEATURE_FLAGS = {
  // Editor Features
  SPLIT_VIEW: true,         // Split view layout (editor + preview)
  LIVE_PREVIEW: true,       // Real-time markdown preview
  TOOLBAR: true,            // Formatting toolbar
  DARK_MODE: true,          // Theme switching capability
  RESPONSIVE_LAYOUT: true,  // Mobile-responsive design
  
  // Tiptap Extensions (will be controlled by user selection)
  TIPTAP_STARTER_KIT: true, // Basic starter kit extensions
  TIPTAP_CUSTOM_EXTENSIONS: false, // Custom extensions (to be configured)
  
  // Preview Features
  SYNTAX_HIGHLIGHTING: true, // Code block syntax highlighting
  GITHUB_FLAVORED_MD: true,  // GitHub Flavored Markdown support
  
  // Accessibility
  KEYBOARD_NAVIGATION: true, // Full keyboard navigation
  SCREEN_READER_SUPPORT: true, // ARIA labels and roles
  
  // Performance
  DEBOUNCED_UPDATES: true,   // Debounced content synchronization
  PERFORMANCE_MONITORING: false, // Performance monitoring (future)
} as const;

// Theme configuration
export const THEME_CONFIG = {
  SUPPORTED_THEMES: ['light', 'dark', 'auto'] as const,
  DEFAULT_THEME: 'auto' as const,
  PERSIST_THEME: true,      // Save theme preference to localStorage
} as const;

// Editor configuration
export const EDITOR_CONFIG = {
  DEFAULT_PLACEHOLDER: 'Start writing your markdown...',
  DEBOUNCE_MS: 300,         // Debounce delay for live preview
  MAX_CONTENT_LENGTH: 100000, // Maximum content length (characters)
  SPLIT_RATIO: 0.5,         // Fixed 50/50 split for V1
} as const;

// Type definitions for feature flags
export type VersionFlag = keyof typeof VERSION_FLAGS;
export type FeatureFlag = keyof typeof FEATURE_FLAGS;
export type ThemeType = typeof THEME_CONFIG.SUPPORTED_THEMES[number];

// Utility functions
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FEATURE_FLAGS[feature];
};

export const isVersionEnabled = (version: VersionFlag): boolean => {
  return VERSION_FLAGS[version];
};

export const getEnabledFeatures = (): FeatureFlag[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature as FeatureFlag);
};

export const getEnabledVersions = (): VersionFlag[] => {
  return Object.entries(VERSION_FLAGS)
    .filter(([, enabled]) => enabled)
    .map(([version]) => version as VersionFlag);
};
