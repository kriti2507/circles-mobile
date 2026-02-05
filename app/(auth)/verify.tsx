/**
 * Verify Screen
 * Enter SMS verification code
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius } from '../../src/constants/spacing';

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyCode, requestCode, isLoading, error, clearError } = useAuth();

  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRef = useRef<TextInput>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = async (text: string) => {
    clearError();
    const cleaned = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(cleaned);

    // Auto-submit when complete
    if (cleaned.length === CODE_LENGTH && phone) {
      try {
        await verifyCode(phone, cleaned);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !phone) return;

    try {
      await requestCode(phone);
      setCountdown(60);
      setCode('');
    } catch (err) {
      // Error handled by hook
    }
  };

  const renderCodeBoxes = () => (
    <TouchableOpacity
      style={styles.codeContainer}
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
    >
      {Array.from({ length: CODE_LENGTH }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.codeBox,
            code.length === index && styles.codeBoxFocused,
            error && code.length >= CODE_LENGTH && styles.codeBoxError,
          ]}
        >
          <Text style={styles.codeText}>{code[index] || ''}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + Spacing.lg }]}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {phone}
          </Text>
        </View>

        {/* Hidden input */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          autoFocus
          maxLength={CODE_LENGTH}
        />

        {/* Code boxes */}
        {renderCodeBoxes()}

        {/* Error */}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* Resend */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive a code? </Text>
          {countdown > 0 ? (
            <Text style={styles.countdown}>Resend in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Submit button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          title="Verify"
          onPress={() => phone && verifyCode(phone, code)}
          disabled={code.length < CODE_LENGTH}
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -Spacing.sm,
    marginBottom: Spacing.lg,
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
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  codeBoxFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  codeBoxError: {
    borderColor: Colors.error,
  },
  codeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  error: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  resendText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  countdown: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
  resendLink: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
});
