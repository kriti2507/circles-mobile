/**
 * Avatar Component
 * User profile image with fallback initials
 */

import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AvatarSize, BorderRadius } from '../../constants/spacing';

export type AvatarSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSizeType;
  showBorder?: boolean;
  borderColor?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  showBorder = false,
  borderColor = Colors.primary,
  style,
}) => {
  const sizeValue = AvatarSize[size];
  const fontSize = sizeValue / 2.5;

  // Get initials from name
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const containerStyles = [
    styles.container,
    {
      width: sizeValue,
      height: sizeValue,
      borderRadius: sizeValue / 2,
    },
    showBorder && {
      borderWidth: 2,
      borderColor,
    },
    style,
  ];

  if (source) {
    return (
      <View style={containerStyles}>
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: sizeValue - (showBorder ? 4 : 0),
              height: sizeValue - (showBorder ? 4 : 0),
              borderRadius: (sizeValue - (showBorder ? 4 : 0)) / 2,
            },
          ]}
        />
      </View>
    );
  }

  // Fallback to initials
  return (
    <View style={[containerStyles, styles.fallback]}>
      <Text
        style={[
          styles.initials,
          {
            fontSize,
          },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

// Avatar group for showing multiple avatars stacked
interface AvatarGroupProps {
  avatars: Array<{ source?: string; name?: string }>;
  max?: number;
  size?: AvatarSizeType;
  style?: ViewStyle;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'sm',
  style,
}) => {
  const sizeValue = AvatarSize[size];
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <View style={[styles.group, style]}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.groupAvatar,
            { marginLeft: index === 0 ? 0 : -sizeValue / 3 },
          ]}
        >
          <Avatar
            source={avatar.source}
            name={avatar.name}
            size={size}
            showBorder
            borderColor={Colors.surfaceLight}
          />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.groupAvatar,
            styles.remaining,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
              marginLeft: -sizeValue / 3,
            },
          ]}
        >
          <Text style={[styles.remainingText, { fontSize: sizeValue / 3 }]}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.gray100,
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: Colors.primaryTransparent20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    zIndex: 1,
  },
  remaining: {
    backgroundColor: Colors.gray100,
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingText: {
    fontFamily: FontFamily.bold,
    color: Colors.textMuted,
  },
});

export default Avatar;
