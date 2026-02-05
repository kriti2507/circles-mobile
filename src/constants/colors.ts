/**
 * Circles App Color System
 * Based on the design mockups with vibrant green primary
 */

export const Colors = {
  // Primary brand colors
  primary: '#30e87a',
  primaryDark: '#28c66a',
  primaryLight: '#5eeda0',

  // Background colors
  backgroundLight: '#f6f8f7',
  backgroundDark: '#112117',

  // Surface colors (cards, modals)
  surfaceLight: '#ffffff',
  surfaceDark: '#1a2e22',

  // Text colors
  textPrimary: '#111814',
  textSecondary: '#4a5f52',
  textMuted: '#638872',
  textOnPrimary: '#112117',
  textDark: '#ffffff',
  textSecondaryDark: '#c4d6cb',
  textMutedDark: '#a1c4af',

  // Border colors
  borderLight: '#e5e7e6',
  borderDark: '#2d3d33',

  // Status colors
  success: '#30e87a',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Neutral grays
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Transparent variants
  primaryTransparent10: 'rgba(48, 232, 122, 0.1)',
  primaryTransparent20: 'rgba(48, 232, 122, 0.2)',
  primaryTransparent30: 'rgba(48, 232, 122, 0.3)',

  // Overlay
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
} as const;

// Theme-aware color getter
export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
};

export const getThemeColors = (isDark: boolean): ThemeColors => ({
  background: isDark ? Colors.backgroundDark : Colors.backgroundLight,
  surface: isDark ? Colors.surfaceDark : Colors.surfaceLight,
  text: isDark ? Colors.textDark : Colors.textPrimary,
  textSecondary: isDark ? Colors.textSecondaryDark : Colors.textSecondary,
  textMuted: isDark ? Colors.textMutedDark : Colors.textMuted,
  border: isDark ? Colors.borderDark : Colors.borderLight,
  primary: Colors.primary,
});

export default Colors;
