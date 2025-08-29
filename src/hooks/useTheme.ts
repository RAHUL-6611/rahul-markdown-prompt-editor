/**
 * useTheme Hook
 * Manages theme switching with CSS variables and localStorage persistence
 */

import { useCallback, useEffect, useState } from 'react';
import { THEME_CONFIG } from '../config/features';
import type { ThemeType, UseThemeReturn, ThemeConfig } from '../types/editor';

/**
 * CSS Variables for theming
 */
const CSS_VARIABLES = {
  // Colors
  '--color-bg-primary': '#ffffff',
  '--color-bg-secondary': '#f8f9fa',
  '--color-bg-tertiary': '#e9ecef',
  '--color-text-primary': '#212529',
  '--color-text-secondary': '#6c757d',
  '--color-border': '#dee2e6',
  '--color-accent': '#007bff',
  '--color-accent-hover': '#0056b3',
  
  // Dark theme colors
  '--color-bg-primary-dark': '#1a1a1a',
  '--color-bg-secondary-dark': '#2d2d2d',
  '--color-bg-tertiary-dark': '#404040',
  '--color-text-primary-dark': '#ffffff',
  '--color-text-secondary-dark': '#b0b0b0',
  '--color-border-dark': '#404040',
  '--color-accent-dark': '#4dabf7',
  '--color-accent-hover-dark': '#74c0fc',
} as const;

/**
 * Theme configurations
 */
const THEMES = {
  light: {
    '--color-bg-primary': '#ffffff',
    '--color-bg-secondary': '#f8f9fa',
    '--color-bg-tertiary': '#e9ecef',
    '--color-text-primary': '#212529',
    '--color-text-secondary': '#6c757d',
    '--color-border': '#dee2e6',
    '--color-accent': '#007bff',
    '--color-accent-hover': '#0056b3',
  },
  dark: {
    '--color-bg-primary': '#1a1a1a',
    '--color-bg-secondary': '#2d2d2d',
    '--color-bg-tertiary': '#404040',
    '--color-text-primary': '#ffffff',
    '--color-text-secondary': '#b0b0b0',
    '--color-border': '#404040',
    '--color-accent': '#4dabf7',
    '--color-accent-hover': '#74c0fc',
  },
} as const;

/**
 * Custom hook for theme management
 */
export const useTheme = (): UseThemeReturn => {
  // Get system theme preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Initialize theme state
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    if (typeof window === 'undefined') {
      return {
        current: THEME_CONFIG.DEFAULT_THEME,
        system: 'light',
        persisted: false,
      };
    }

    // Get persisted theme from localStorage
    const persistedTheme = localStorage.getItem('theme') as ThemeType;
    const systemTheme = getSystemTheme();

    return {
      current: persistedTheme || THEME_CONFIG.DEFAULT_THEME,
      system: systemTheme,
      persisted: !!persistedTheme,
    };
  });

  // Apply theme to CSS variables
  const applyTheme = useCallback((themeType: ThemeType) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const isDark = themeType === 'dark' || (themeType === 'auto' && getSystemTheme() === 'dark');
    const themeColors = isDark ? THEMES.dark : THEMES.light;

    // Apply CSS variables
    Object.entries(themeColors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Update data attribute for Tailwind CSS
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Update class for Tailwind dark mode
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [getSystemTheme]);

  // Set theme function
  const setTheme = useCallback((newTheme: ThemeType) => {
    setThemeState(prev => ({
      ...prev,
      current: newTheme,
      persisted: newTheme !== 'auto',
    }));

    // Persist theme preference
    if (THEME_CONFIG.PERSIST_THEME && typeof window !== 'undefined') {
      if (newTheme === 'auto') {
        localStorage.removeItem('theme');
      } else {
        localStorage.setItem('theme', newTheme);
      }
    }

    // Apply theme
    applyTheme(newTheme);
  }, [applyTheme]);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    const currentTheme = theme.current;
    const newTheme: ThemeType = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme.current, setTheme]);

  // Check if current theme is dark
  const isDark = theme.current === 'dark' || (theme.current === 'auto' && theme.system === 'dark');

  // Apply theme on mount and theme change
  useEffect(() => {
    applyTheme(theme.current);
  }, [theme.current, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const newSystemTheme = getSystemTheme();
      setThemeState(prev => ({
        ...prev,
        system: newSystemTheme,
      }));

      // Re-apply theme if using auto mode
      if (theme.current === 'auto') {
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.current, getSystemTheme, applyTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
  };
};

/**
 * Hook for getting current theme colors
 */
export const useThemeColors = () => {
  const { isDark } = useTheme();

  return {
    isDark,
    colors: isDark ? THEMES.dark : THEMES.light,
  };
};

/**
 * Utility function to get CSS variable value
 */
export const getCSSVariable = (variable: keyof typeof CSS_VARIABLES): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable);
};

/**
 * Utility function to set CSS variable value
 */
export const setCSSVariable = (variable: keyof typeof CSS_VARIABLES, value: string): void => {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(variable, value);
};
