/**
 * Login Screen
 * Email + password form with sign-up / sign-in toggle
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/hooks/useAuth';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing } from '../../src/constants/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, signIn, isLoading, error, clearError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSignUp = mode === 'signup';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordLongEnough = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = isPasswordLongEnough && hasUppercase && hasNumber;

  const isValid = isSignUp
    ? isEmailValid && isPasswordValid && confirmPassword.length > 0
    : isEmailValid && password.length > 0;

  const toggleMode = () => {
    setMode(isSignUp ? 'signin' : 'signup');
    setLocalError(null);
    setSuccessMessage(null);
    clearError();
  };

  const handleSubmit = async () => {
    setLocalError(null);
    setSuccessMessage(null);

    if (!isEmailValid) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (isSignUp) {
      if (!isPasswordValid) {
        setLocalError('Password must be at least 8 characters with an uppercase letter and a number');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
    }

    try {
      if (isSignUp) {
        const result = await signUp(email.trim(), password);
        if (result && !result.token) {
          setSuccessMessage(result.message ?? 'Account created! Check your email to confirm.');
        }
      } else {
        await signIn(email.trim(), password);
      }
    } catch {
      // Error is handled by the hook
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isSignUp ? 'Create account' : 'Welcome back'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? 'Sign up with your email and a password.'
              : 'Sign in with your email and password.'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              clearError();
              setLocalError(null);
              setSuccessMessage(null);
              setEmail(text);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            leftIcon={
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} />
            }
            error={email.length > 0 && !isEmailValid ? 'Enter a valid email address' : undefined}
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              clearError();
              setLocalError(null);
              setPassword(text);
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            leftIcon={
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />
            }
            rightIcon={
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textMuted}
              />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {isSignUp && password.length > 0 && (
            <View style={styles.passwordRequirements}>
              <Text style={[styles.requirementText, isPasswordLongEnough && styles.requirementMet]}>
                {isPasswordLongEnough ? '\u2713' : '\u2022'} At least 8 characters
              </Text>
              <Text style={[styles.requirementText, hasUppercase && styles.requirementMet]}>
                {hasUppercase ? '\u2713' : '\u2022'} One uppercase letter
              </Text>
              <Text style={[styles.requirementText, hasNumber && styles.requirementMet]}>
                {hasNumber ? '\u2713' : '\u2022'} One number
              </Text>
            </View>
          )}

          {isSignUp && (
            <Input
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={(text) => {
                setLocalError(null);
                setConfirmPassword(text);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />
              }
            />
          )}
        </View>

        {/* Error */}
        {displayError && <Text style={styles.error}>{displayError}</Text>}

        {/* Success message */}
        {successMessage && <Text style={styles.success}>{successMessage}</Text>}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          title={isSignUp ? 'Sign Up' : 'Sign In'}
          onPress={handleSubmit}
          disabled={!isValid}
          loading={isLoading}
          size="lg"
        />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <TouchableOpacity onPress={toggleMode}>
            <Text style={styles.toggleLink}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
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
  form: {
    gap: Spacing.base,
  },
  passwordRequirements: {
    paddingHorizontal: Spacing.base,
    gap: 2,
  },
  requirementText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  requirementMet: {
    color: Colors.primary,
  },
  error: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  success: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  disclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    lineHeight: FontSize.sm * 1.5,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  toggleText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  toggleLink: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
});
