/**
 * Location Screen
 * Set city/location during onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/stores/authStore';
import { useLocation } from '../../src/hooks/useLocation';
import { usersService } from '../../src/services';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius, IconSize } from '../../src/constants/spacing';

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updateUser = useAuthStore((state) => state.updateUser);
  const {
    location,
    isLoading: locationLoading,
    getCurrentLocation,
    searchLocation,
  } = useLocation();

  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = city.trim().length >= 2 || location?.city;

  const handleUseCurrentLocation = async () => {
    const result = await getCurrentLocation();
    if (result?.city) {
      setCity(result.city);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      let locationData = location;

      // If user typed a city, search for it
      if (city && (!location || location.city !== city)) {
        locationData = await searchLocation(city);
      }

      await usersService.updateProfile({
        city: city || location?.city,
        countryCode: locationData?.countryCode,
        location: locationData
          ? { latitude: locationData.latitude, longitude: locationData.longitude }
          : undefined,
      });

      updateUser({
        city: city || location?.city,
        countryCode: locationData?.countryCode,
      });

      router.push('/(onboarding)/languages');
    } catch (err: any) {
      setError(err.message || 'Failed to save location');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing['2xl'] }]}>
      <View style={styles.content}>
        {/* Progress indicator */}
        <View style={styles.progress}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Where are you based?</Text>
          <Text style={styles.subtitle}>
            We'll match you with people in your city.
          </Text>
        </View>

        {/* Location input */}
        <Input
          placeholder="Enter your city"
          value={city}
          onChangeText={(text) => {
            setError(null);
            setCity(text);
          }}
          error={error || undefined}
          leftIcon={
            <Ionicons name="location-outline" size={IconSize.md} color={Colors.textMuted} />
          }
        />

        {/* Use current location button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
          disabled={locationLoading}
        >
          <Ionicons
            name="navigate"
            size={IconSize.md}
            color={Colors.primary}
          />
          <Text style={styles.currentLocationText}>
            {locationLoading ? 'Getting location...' : 'Use my current location'}
          </Text>
        </TouchableOpacity>
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
    </View>
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
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.base,
  },
  currentLocationText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
});
