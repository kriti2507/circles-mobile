/**
 * Chip Component
 * Selectable/toggleable tag for filters, interests, etc.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  leftIcon,
  rightIcon,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        selected && styles.selected,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </TouchableOpacity>
  );
};

// Filter chip with icon
interface FilterChipProps {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  icon,
  selected = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selected && styles.filterChipSelected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.filterIcon}>{icon}</View>}
      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Interest chip with emoji
interface InterestChipProps {
  emoji: string;
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const InterestChip: React.FC<InterestChipProps> = ({
  emoji,
  label,
  selected = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.interestChip,
        selected && styles.interestChipSelected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.interestText, selected && styles.interestTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  selected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  selectedText: {
    color: Colors.backgroundDark,
    fontFamily: FontFamily.semiBold,
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
  },

  // Filter chip
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
  },
  filterIcon: {
    marginRight: Spacing.sm,
  },
  filterText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  filterTextSelected: {
    color: Colors.backgroundDark,
    fontFamily: FontFamily.bold,
  },

  // Interest chip
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  interestChipSelected: {
    backgroundColor: Colors.primaryTransparent10,
    borderColor: Colors.primary,
  },
  emoji: {
    fontSize: FontSize.lg,
    marginRight: Spacing.sm,
  },
  interestText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  interestTextSelected: {
    fontFamily: FontFamily.semiBold,
    color: Colors.textPrimary,
  },
});

export default Chip;
