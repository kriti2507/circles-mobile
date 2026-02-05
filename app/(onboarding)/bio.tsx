/**
 * Bio Screen
 * Optional bio during onboarding (final step)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/authStore';
import { usersService } from '../../src/services';
import { AppConfig } from '../../src/constants/config';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius } from '../../src/constants/spacing';

export default function BioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUser, setIsOnboarded } = useAuthStore();

  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (bio.trim()) {
        await usersService.updateProfile({ bio: bio.trim() });
        updateUser({ bio: bio.trim() });
      }
      setIsOnboarded(true);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Failed to save bio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      setIsOnboarded(true);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + Spacing['2xl'] }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Progress indicator */}
        <View style={styles.progress}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add a short bio</Text>
          <Text style={styles.subtitle}>
            Tell your future circle mates a little about yourself. This is optional.
          </Text>
        </View>

        {/* Bio input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="I'm a coffee lover who enjoys hiking on weekends..."
            placeholderTextColor={Colors.textMuted}
            value={bio}
            onChangeText={(text) => {
              setError(null);
              setBio(text);
            }}
            maxLength={AppConfig.MAX_BIO_LENGTH}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.hint}>
          {bio.length}/{AppConfig.MAX_BIO_LENGTH} characters
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      {/* Action buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          title="Complete Setup"
          onPress={handleSubmit}
          loading={isLoading}
          size="lg"
        />
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
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
    backgroundColor: Colors.primary,
  },
  progressDotActive: {
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
  inputContainer: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    minHeight: 120,
  },
  input: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: FontSize.md * 1.5,
    flex: 1,
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  error: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.error,
    marginTop: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  skipButton: {
    alignItems: 'center',
    padding: Spacing.base,
    marginTop: Spacing.sm,
  },
  skipText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
});
