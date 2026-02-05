/**
 * i18n Configuration
 * Internationalization setup with i18next
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

const LANGUAGE_STORAGE_KEY = 'circles-app-language';

const resources = {
  en: { translation: en },
  ja: { translation: ja },
  zh: { translation: zh },
};

// Get saved language or use device locale
const getInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && resources[savedLanguage as keyof typeof resources]) {
      return savedLanguage;
    }
  } catch (error) {
    console.warn('Failed to get saved language:', error);
  }

  // Fall back to device locale
  const deviceLocale = Localization.locale.split('-')[0];
  if (resources[deviceLocale as keyof typeof resources]) {
    return deviceLocale;
  }

  return 'en';
};

// Initialize i18n
export const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return i18n;
};

// Change language and persist
export const changeLanguage = async (languageCode: string) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

// Get current language
export const getCurrentLanguage = () => i18n.language;

// Supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

export default i18n;
