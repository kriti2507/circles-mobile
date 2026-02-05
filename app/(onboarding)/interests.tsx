/**
 * Interests Screen
 * Select interests during onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../src/components/ui/Button';
import { InterestChip } from '../../src/components/ui/Chip';
import { useAuthStore } from '../../src/stores/authStore';
import { usersService } from '../../src/services';
import { InterestCategories } from '../../src/constants/interests';
import { AppConfig } from '../../src/constants/config';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing } from '../../src/constants/spacing';

export default function InterestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updateUser = useAuthStore((state) => state.updateUser);

  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    selected.length >= AppConfig.MIN_INTERESTS &&
    selected.length <= AppConfig.MAX_INTERESTS;

  const toggleInterest = (id: string) => {
    setError(null);
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= AppConfig.MAX_INTERESTS) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      await usersService.updateProfile({ interests: selected });
      updateUser({ interests: selected });
      router.push('/(onboarding)/bio');
    } catch (err: any) {
      setError(err.message || 'Failed to save interests');
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
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.title}>What are you into?</Text>
        <Text style={styles.subtitle}>
          Select {AppConfig.MIN_INTERESTS}-{AppConfig.MAX_INTERESTS} interests.
          We'll use these to find your circle.
        </Text>
        <Text style={styles.count}>
          {selected.length}/{AppConfig.MAX_INTERESTS} selected
        </Text>
      </View>

      {/* Interests by category */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {InterestCategories.map((category) => (
          <View key={category.id} style={styles.category}>
            <Text style={styles.categoryLabel}>{category.label}</Text>
            <View style={styles.interestsGrid}>
              {category.interests.map((interest) => (
                <InterestChip
                  key={interest.id}
                  emoji={interest.emoji}
                  label={interest.label}
                  selected={selected.includes(interest.id)}
                  onPress={() => toggleInterest(interest.id)}
                  style={styles.interestChip}
                />
              ))}
            </View>
          </View>
        ))}
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
  count: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  category: {
    marginBottom: Spacing.xl,
  },
  categoryLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  interestChip: {
    marginBottom: Spacing.xs,
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
