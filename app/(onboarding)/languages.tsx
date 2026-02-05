/**
 * Languages Screen
 * Select languages during onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/authStore';
import { usersService } from '../../src/services';
import { SupportedLanguages } from '../../src/constants/languages';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius, IconSize } from '../../src/constants/spacing';

export default function LanguagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updateUser = useAuthStore((state) => state.updateUser);

  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = selected.length >= 1;

  const toggleLanguage = (code: string) => {
    setError(null);
    setSelected((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      await usersService.updateProfile({ languages: selected });
      updateUser({ languages: selected });
      router.push('/(onboarding)/interests');
    } catch (err: any) {
      setError(err.message || 'Failed to save languages');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing['2xl'] }]}>
      <View style={styles.header}>
        {/* Progress indicator */}
        <View style={styles.progress}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.title}>What languages do you speak?</Text>
        <Text style={styles.subtitle}>
          Select all languages you're comfortable chatting in.
        </Text>
      </View>

      {/* Languages list */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {SupportedLanguages.map((language) => {
          const isSelected = selected.includes(language.code);
          return (
            <TouchableOpacity
              key={language.code}
              style={[styles.languageItem, isSelected && styles.languageItemSelected]}
              onPress={() => toggleLanguage(language.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageInfo}>
                <Text style={[styles.languageLabel, isSelected && styles.languageLabelSelected]}>
                  {language.label}
                </Text>
                <Text style={styles.languageNative}>{language.nativeLabel}</Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={IconSize.md} color={Colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Submit button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          title="Continue"
          onPress={handleSubmit}
          disabled={!isValid}
          loading={isLoading}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray200,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: FontSize.md * 1.5,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  languageItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTransparent10,
  },
  languageInfo: {
    flex: 1,
  },
  languageLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  languageLabelSelected: {
    color: Colors.textPrimary,
  },
  languageNative: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  error: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
});
