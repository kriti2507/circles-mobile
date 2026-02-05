/**
 * Supported Languages
 */

export interface Language {
  code: string;
  label: string;
  nativeLabel: string;
}

export const SupportedLanguages: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'th', label: 'Thai', nativeLabel: 'ไทย' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
];

// Get language by code
export const getLanguageByCode = (code: string): Language | undefined =>
  SupportedLanguages.find((lang) => lang.code === code);

// App UI languages (subset of all supported)
export const AppLanguages: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
];

export default SupportedLanguages;
