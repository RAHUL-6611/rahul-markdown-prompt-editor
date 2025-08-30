/**
 * useTheme Hook
 * Manages theme switching with CSS variables and localStorage persistence
 */

import { useCallback, useEffect, useState } from 'react';
import { THEME_CONFIG } from '../config/features';
import type { ThemeType, UseThemeReturn, ThemeConfig } from '../types/editor';

/**
 * Theme configurations using design tokens
 */
const THEMES = {
  light: {
    // Surface colors
    '--color-surface-primary': '#ffffff',
    '--color-surface-secondary': '#f8fafc',
    '--color-surface-tertiary': '#f1f5f9',
    
    // Text colors
    '--color-text-primary': '#0f172a',
    '--color-text-secondary': '#475569',
    '--color-text-tertiary': '#64748b',
    '--color-text-inverse': '#ffffff',
    
    // Border colors
    '--color-border-primary': '#e2e8f0',
    '--color-border-secondary': '#cbd5e1',
    '--color-border-focus': '#3b82f6',
    
    // Primary colors
    '--color-primary-50': '#eff6ff',
    '--color-primary-100': '#dbeafe',
    '--color-primary-200': '#bfdbfe',
    '--color-primary-300': '#93c5fd',
    '--color-primary-400': '#60a5fa',
    '--color-primary-500': '#3b82f6',
    '--color-primary-600': '#2563eb',
    '--color-primary-700': '#1d4ed8',
    '--color-primary-800': '#1e40af',
    '--color-primary-900': '#1e3a8a',
    
    // Semantic colors
    '--color-success-50': '#f0fdf4',
    '--color-success-500': '#22c55e',
    '--color-success-600': '#16a34a',
    '--color-warning-50': '#fffbeb',
    '--color-warning-500': '#f59e0b',
    '--color-warning-600': '#d97706',
    '--color-error-50': '#fef2f2',
    '--color-error-500': '#ef4444',
    '--color-error-600': '#dc2626',
  },
  dark: {
    // Surface colors
    '--color-surface-primary': '#0f172a',
    '--color-surface-secondary': '#1e293b',
    '--color-surface-tertiary': '#334155',
    
    // Text colors
    '--color-text-primary': '#f8fafc',
    '--color-text-secondary': '#cbd5e1',
    '--color-text-tertiary': '#94a3b8',
    '--color-text-inverse': '#0f172a',
    
    // Border colors
    '--color-border-primary': '#334155',
    '--color-border-secondary': '#475569',
    '--color-border-focus': '#60a5fa',
    
    // Primary colors (same as light for consistency)
    '--color-primary-50': '#eff6ff',
    '--color-primary-100': '#dbeafe',
    '--color-primary-200': '#bfdbfe',
    '--color-primary-300': '#93c5fd',
    '--color-primary-400': '#60a5fa',
    '--color-primary-500': '#3b82f6',
    '--color-primary-600': '#2563eb',
    '--color-primary-700': '#1d4ed8',
    '--color-primary-800': '#1e40af',
    '--color-primary-900': '#1e3a8a',
    
    // Semantic colors
    '--color-success-50': '#f0fdf4',
    '--color-success-500': '#22c55e',
    '--color-success-600': '#16a34a',
    '--color-warning-50': '#fffbeb',
    '--color-warning-500': '#f59e0b',
    '--color-warning-600': '#d97706',
    '--color-error-50': '#fef2f2',
    '--color-error-500': '#ef4444',
    '--color-error-600': '#dc2626',
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
export const getCSSVariable = (variable: string): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable);
};

/**
 * Utility function to set CSS variable value
 */
export const setCSSVariable = (variable: string, value: string): void => {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(variable, value);
};
