/**
 * Name Screen
 * Set display name during onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/stores/authStore';
import { usersService } from '../../src/services';
import { AppConfig } from '../../src/constants/config';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing } from '../../src/constants/spacing';

export default function NameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      await usersService.updateProfile({ displayName: name.trim() });
      updateUser({ displayName: name.trim() });
      router.push('/(onboarding)/location');
    } catch (err: any) {
      setError(err.message || 'Failed to save name');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + Spacing['2xl'] }]}>
        {/* Progress indicator */}
        <View style={styles.progress}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What should we call you?</Text>
          <Text style={styles.subtitle}>
            This is how you'll appear to others in your circle.
          </Text>
        </View>

        {/* Name input */}
        <Input
          placeholder="Your name"
          value={name}
          onChangeText={(text) => {
            setError(null);
            setName(text);
          }}
          maxLength={AppConfig.MAX_DISPLAY_NAME_LENGTH}
          autoFocus
          error={error || undefined}
        />

        <Text style={styles.hint}>
          {name.length}/{AppConfig.MAX_DISPLAY_NAME_LENGTH} characters
        </Text>
      </View>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
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
  header: {
    marginBottom: Spacing['2xl'],
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
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
});
