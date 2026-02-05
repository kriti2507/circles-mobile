/**
 * Language Settings Screen
 * Select app language
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { usersService } from '../../src/services/users';
import { AppLanguages } from '../../src/constants/languages';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius, IconSize } from '../../src/constants/spacing';

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const settings = useAuthStore((state) => state.settings);
  const updateSettings = useAuthStore((state) => state.updateSettings);

  const [selectedLanguage, setSelectedLanguage] = useState(settings?.language || 'en');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectLanguage = useCallback(
    async (code: string) => {
      if (code === selectedLanguage) return;

      setSelectedLanguage(code);
      setIsUpdating(true);

      try {
        const updatedSettings = await usersService.updateSettings({ language: code });
        updateSettings(updatedSettings);
      } catch (err) {
        // Revert on error
        setSelectedLanguage(settings?.language || 'en');
        Alert.alert('Error', 'Failed to update language. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedLanguage, settings?.language, updateSettings]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.description}>
          Select your preferred language for the app interface.
        </Text>

        <Card padding="none">
          {AppLanguages.map((language, index) => (
            <React.Fragment key={language.code}>
              {index > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.languageItem}
                onPress={() => handleSelectLanguage(language.code)}
                disabled={isUpdating}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.languageLabel}>{language.label}</Text>
                  <Text style={styles.languageNative}>{language.nativeLabel}</Text>
                </View>
                {selectedLanguage === language.code && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={20} color={Colors.surfaceLight} />
                  </View>
                )}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </Card>

        {/* More Languages Coming Soon */}
        <View style={styles.comingSoon}>
          <Ionicons name="globe-outline" size={24} color={Colors.textMuted} />
          <Text style={styles.comingSoonText}>More languages coming soon!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: FontSize.md * 1.5,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
  },
  languageInfo: {
    flex: 1,
  },
  languageLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  languageNative: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.base,
  },
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
    gap: Spacing.sm,
  },
  comingSoonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
