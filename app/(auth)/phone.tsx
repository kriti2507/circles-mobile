/**
 * Phone Input Screen
 * Enter phone number for SMS verification
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
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

interface CountryCode {
  name: string;
  dial: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { name: 'United States', dial: '+1', flag: '🇺🇸' },
  { name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { name: 'India', dial: '+91', flag: '🇮🇳' },
  { name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { name: 'France', dial: '+33', flag: '🇫🇷' },
  { name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { name: 'China', dial: '+86', flag: '🇨🇳' },
  { name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { name: 'Ghana', dial: '+233', flag: '🇬🇭' },
  { name: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { name: 'UAE', dial: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
  { name: 'Thailand', dial: '+66', flag: '🇹🇭' },
  { name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
  { name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
  { name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
  { name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { name: 'Sweden', dial: '+46', flag: '🇸🇪' },
  { name: 'Norway', dial: '+47', flag: '🇳🇴' },
  { name: 'Denmark', dial: '+45', flag: '🇩🇰' },
  { name: 'Finland', dial: '+358', flag: '🇫🇮' },
  { name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
  { name: 'Austria', dial: '+43', flag: '🇦🇹' },
  { name: 'Belgium', dial: '+32', flag: '🇧🇪' },
  { name: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { name: 'Poland', dial: '+48', flag: '🇵🇱' },
  { name: 'Ireland', dial: '+353', flag: '🇮🇪' },
  { name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { name: 'Argentina', dial: '+54', flag: '🇦🇷' },
  { name: 'Colombia', dial: '+57', flag: '🇨🇴' },
  { name: 'Chile', dial: '+56', flag: '🇨🇱' },
  { name: 'Peru', dial: '+51', flag: '🇵🇪' },
  { name: 'Turkey', dial: '+90', flag: '🇹🇷' },
  { name: 'Israel', dial: '+972', flag: '🇮🇱' },
  { name: 'Russia', dial: '+7', flag: '🇷🇺' },
  { name: 'Ukraine', dial: '+380', flag: '🇺🇦' },
  { name: 'Czech Republic', dial: '+420', flag: '🇨🇿' },
  { name: 'Romania', dial: '+40', flag: '🇷🇴' },
  { name: 'Hungary', dial: '+36', flag: '🇭🇺' },
  { name: 'Greece', dial: '+30', flag: '🇬🇷' },
  { name: 'Croatia', dial: '+385', flag: '🇭🇷' },
  { name: 'Jamaica', dial: '+1876', flag: '🇯🇲' },
  { name: 'Trinidad and Tobago', dial: '+1868', flag: '🇹🇹' },
  { name: 'Ethiopia', dial: '+251', flag: '🇪🇹' },
  { name: 'Tanzania', dial: '+255', flag: '🇹🇿' },
  { name: 'Morocco', dial: '+212', flag: '🇲🇦' },
  { name: 'Tunisia', dial: '+216', flag: '🇹🇳' },
  { name: 'Sri Lanka', dial: '+94', flag: '🇱🇰' },
  { name: 'Nepal', dial: '+977', flag: '🇳🇵' },
  { name: 'Qatar', dial: '+974', flag: '🇶🇦' },
  { name: 'Kuwait', dial: '+965', flag: '🇰🇼' },
  { name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
  { name: 'Taiwan', dial: '+886', flag: '🇹🇼' },
];

export default function PhoneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestCode, isLoading, error, clearError } = useAuth();

  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const digits = phone.replace(/\D/g, '');
  const fullPhone = `${selectedCountry.dial}${digits}`;
  const isValid = digits.length >= 7;

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return COUNTRY_CODES;
    const q = searchQuery.toLowerCase();
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q)
    );
  }, [searchQuery]);

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
          <TouchableOpacity
            style={styles.countryCodeButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
            <Text style={styles.countryCode}>{selectedCountry.dial}</Text>
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

      {/* Country code picker modal */}
      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => { setShowPicker(false); setSearchQuery(''); }}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => `${item.name}-${item.dial}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryRow,
                  item.dial === selectedCountry.dial && item.name === selectedCountry.name && styles.countryRowSelected,
                ]}
                onPress={() => {
                  setSelectedCountry(item);
                  setShowPicker(false);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.countryRowFlag}>{item.flag}</Text>
                <Text style={styles.countryRowName}>{item.name}</Text>
                <Text style={styles.countryRowDial}>{item.dial}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
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
  countryFlag: {
    fontSize: FontSize.lg,
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderRadius: 12,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  countryRowSelected: {
    backgroundColor: Colors.primaryTransparent10,
  },
  countryRowFlag: {
    fontSize: FontSize.xl,
  },
  countryRowName: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  countryRowDial: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
