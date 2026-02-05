/**
 * Card Component
 * Container with rounded corners and shadow
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'elevated' | 'outlined' | 'filled';
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  variant = 'elevated',
  onPress,
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    padding !== 'none' && styles[`padding${padding.charAt(0).toUpperCase()}${padding.slice(1)}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

// Specialized card for prompts
interface PromptCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  children,
  style,
  onPress,
}) => {
  const content = (
    <View style={[styles.promptCard, style]}>
      <View style={styles.promptBadge}>
        <View style={styles.promptBadgeInner} />
      </View>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// Specialized card for activities
interface ActivityCardProps {
  children: React.ReactNode;
  imageUrl?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  children,
  style,
  onPress,
}) => {
  return (
    <Card style={[styles.activityCard, style]} onPress={onPress} padding="lg">
      {children}
    </Card>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  // Variants
  elevated: {
    backgroundColor: Colors.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filled: {
    backgroundColor: Colors.gray50,
  },

  // Padding sizes
  paddingSm: {
    padding: Spacing.md,
  },
  paddingMd: {
    padding: Spacing.lg,
  },
  paddingLg: {
    padding: Spacing.xl,
  },

  // Prompt card specific
  promptCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primaryTransparent20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  promptBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  promptBadgeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.backgroundDark,
  },

  // Activity card specific
  activityCard: {
    backgroundColor: Colors.surfaceLight,
  },
});

export default Card;
