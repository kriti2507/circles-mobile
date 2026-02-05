/**
 * Badge Component
 * Small label for status, counts, or categories
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[`${size}Size`], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

// Count badge (for notifications, etc.)
interface CountBadgeProps {
  count: number;
  max?: number;
  style?: ViewStyle;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  style,
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <View style={[styles.countBadge, style]}>
      <Text style={styles.countText}>{displayCount}</Text>
    </View>
  );
};

// Status dot (online/offline indicator)
interface StatusDotProps {
  status: 'online' | 'offline' | 'away';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  style,
}) => {
  const sizeMap = { sm: 8, md: 12, lg: 16 };
  const dotSize = sizeMap[size];

  const colorMap = {
    online: Colors.success,
    offline: Colors.gray400,
    away: Colors.warning,
  };

  return (
    <View
      style={[
        styles.statusDot,
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: colorMap[status],
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
  },

  // Variants
  default: {
    backgroundColor: Colors.gray100,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  success: {
    backgroundColor: Colors.success,
  },
  warning: {
    backgroundColor: Colors.warning,
  },
  error: {
    backgroundColor: Colors.error,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.gray300,
  },

  // Sizes
  smSize: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
  },
  mdSize: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },

  // Text
  text: {
    fontFamily: FontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  defaultText: {
    color: Colors.textSecondary,
  },
  primaryText: {
    color: Colors.backgroundDark,
  },
  successText: {
    color: Colors.backgroundDark,
  },
  warningText: {
    color: Colors.backgroundDark,
  },
  errorText: {
    color: Colors.surfaceLight,
  },
  outlineText: {
    color: Colors.textSecondary,
  },

  smText: {
    fontSize: FontSize.xs - 1,
  },
  mdText: {
    fontSize: FontSize.xs,
  },

  // Count badge
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  countText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs - 1,
    color: Colors.surfaceLight,
  },

  // Status dot
  statusDot: {
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
  },
});

export default Badge;
