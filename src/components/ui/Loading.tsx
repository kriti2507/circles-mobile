/**
 * Loading Components
 * Spinners, skeletons, and loading overlays
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';

// Simple loading spinner
interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = Colors.primary,
  style,
}) => {
  return (
    <View style={[styles.loading, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

// Full screen loading overlay
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
}) => {
  const { Text } = require('react-native');

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {message && <Text style={styles.overlayMessage}>{message}</Text>}
      </View>
    </View>
  );
};

// Skeleton placeholder for loading states
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton presets for common uses
export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <Skeleton width={size} height={size} borderRadius={size / 2} />
);

export const SkeletonText: React.FC<{ lines?: number; width?: string | number }> = ({
  lines = 1,
  width = '100%',
}) => (
  <View style={styles.skeletonTextContainer}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === lines - 1 && lines > 1 ? '60%' : width}
        height={16}
        style={index < lines - 1 ? { marginBottom: Spacing.sm } : undefined}
      />
    ))}
  </View>
);

export const SkeletonCard: React.FC = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonCardHeader}>
      <SkeletonAvatar />
      <View style={styles.skeletonCardHeaderText}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={12} style={{ marginTop: Spacing.xs }} />
      </View>
    </View>
    <Skeleton height={150} borderRadius={BorderRadius.md} style={{ marginTop: Spacing.md }} />
  </View>
);

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  overlayContent: {
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  overlayMessage: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  skeleton: {
    backgroundColor: Colors.gray200,
  },
  skeletonTextContainer: {
    width: '100%',
  },
  skeletonCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonCardHeaderText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
});

export default Loading;
