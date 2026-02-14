/**
 * Welcome Screen
 * Onboarding intro with app explanation
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { DEV_SKIP_AUTH } from '../../src/constants/config';
import { useAuthStore } from '../../src/stores/authStore';
import { authService } from '../../src/services/auth';
import { socketService } from '../../src/services/socket';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any; // For now, we'll use a placeholder
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Find Your People',
    description:
      'Join curated weekly circles of 4-5 local people. We handle the matching; you enjoy the connection.',
    image: null,
  },
  {
    id: '2',
    title: 'Weekly Prompts',
    description:
      'Get fun weekly challenges to help your circle connect and explore together.',
    image: null,
  },
  {
    id: '3',
    title: 'Real Connections',
    description:
      'No swiping, no pressure. Just genuine friendships that grow over time.',
    image: null,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [devLoading, setDevLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  // Development only: authenticate with real backend tokens
  const handleDevLogin = async () => {
    if (!DEV_SKIP_AUTH) return;
    setDevLoading(true);
    try {
      const result = await authService.devLogin();
      login(
        result.user,
        { accessToken: result.token, refreshToken: result.refreshToken }
      );
      socketService.connect();
      router.replace('/(tabs)');
    } catch (err) {
      console.warn('Dev login failed:', err);
    } finally {
      setDevLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/(auth)/phone');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/phone');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      {/* Placeholder illustration */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons
            name="people-circle"
            size={120}
            color={Colors.primary}
          />
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Pagination */}
      {renderPagination()}

      {/* Action buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="lg"
          rightIcon={
            <Ionicons name="arrow-forward" size={20} color={Colors.backgroundDark} />
          }
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/phone')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>

        {DEV_SKIP_AUTH && (
          <TouchableOpacity
            style={[styles.devLoginButton, devLoading && { opacity: 0.5 }]}
            onPress={handleDevLogin}
            disabled={devLoading}
          >
            <Ionicons name="code-slash" size={16} color={Colors.warning} />
            <Text style={styles.devLoginText}>
              {devLoading ? 'Signing in...' : 'Dev Login (Skip Auth)'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: Spacing.base,
    paddingRight: Spacing.xl,
  },
  skipText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  imageContainer: {
    marginBottom: Spacing['2xl'],
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryTransparent10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['4xl'],
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  description: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.lg * 1.5,
    paddingHorizontal: Spacing.base,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: Spacing.xs,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.primaryTransparent20,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  devLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    borderStyle: 'dashed',
  },
  devLoginText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.warning,
    marginLeft: Spacing.xs,
  },
});
