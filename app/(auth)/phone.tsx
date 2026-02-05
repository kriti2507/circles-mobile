/**
 * Phone Input Screen
 * Enter phone number for SMS verification
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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

export default function PhoneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestCode, isLoading, error, clearError } = useAuth();

  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');

  const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;
  const isValid = phone.replace(/\D/g, '').length >= 10;

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      await requestCode(fullPhone);
      router.push({
        pathname: '/(auth)/verify',
        params: { phone: fullPhone },
      });
    } catch (err) {
      // Error is handled by the hook
    }
  };

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
          <Text style={styles.title}>Enter your phone number</Text>
          <Text style={styles.subtitle}>
            We'll send you a verification code to confirm your identity.
          </Text>
        </View>

        {/* Phone input */}
        <View style={styles.phoneInputContainer}>
          <TouchableOpacity style={styles.countryCodeButton}>
            <Text style={styles.countryCode}>{countryCode}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.phoneInputWrapper}>
            <Input
              placeholder="Phone number"
              value={phone}
              onChangeText={(text) => {
                clearError();
                setPhone(text);
              }}
              keyboardType="phone-pad"
              autoFocus
              error={error || undefined}
            />
          </View>
        </View>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.base,
    height: 48,
    borderRadius: 24,
    gap: Spacing.xs,
  },
  countryCode: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  phoneInputWrapper: {
    flex: 1,
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
});
