/**
 * Header Component
 * App header with navigation and actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Layout, IconSize } from '../../constants/spacing';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  leftIcon,
  rightIcon,
  rightAction,
  transparent = false,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        transparent && styles.transparent,
        style,
      ]}
    >
      <StatusBar
        barStyle={transparent ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.content}>
        {/* Left section */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-back"
                size={IconSize.md}
                color={transparent ? Colors.surfaceLight : Colors.textPrimary}
              />
            </TouchableOpacity>
          )}
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        </View>

        {/* Center section */}
        <View style={styles.centerSection}>
          {title && (
            <Text
              style={[
                styles.title,
                transparent && styles.titleTransparent,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                transparent && styles.subtitleTransparent,
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right section */}
        <View style={styles.rightSection}>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          {rightAction}
        </View>
      </View>
    </View>
  );
};

// Chat header variant
interface ChatHeaderProps {
  circleName: string;
  memberCount: number;
  avatars?: React.ReactNode;
  onBackPress?: () => void;
  onMenuPress?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  circleName,
  memberCount,
  avatars,
  onBackPress,
  onMenuPress,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.chatHeader, { paddingTop: insets.top }]}>
      <View style={styles.chatHeaderContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatTitle} numberOfLines={1}>
            {circleName}
          </Text>
          <Text style={styles.chatSubtitle}>
            {memberCount} members
          </Text>
        </View>

        {avatars && <View style={styles.chatAvatars}>{avatars}</View>}

        {onMenuPress && (
          <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
            <Ionicons name="ellipsis-vertical" size={IconSize.md} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.headerHeight,
    paddingHorizontal: Spacing.base,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  leftIcon: {
    marginLeft: Spacing.sm,
  },
  rightIcon: {
    marginRight: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  titleTransparent: {
    color: Colors.surfaceLight,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  subtitleTransparent: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Chat header
  chatHeader: {
    backgroundColor: Colors.surfaceLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.headerHeight,
    paddingHorizontal: Spacing.sm,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  chatTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  chatSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  chatAvatars: {
    marginRight: Spacing.sm,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
