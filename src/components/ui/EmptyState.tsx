/**
 * EmptyState Component
 * Placeholder for when there's no content
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          size="md"
          fullWidth={false}
          style={styles.button}
        />
      )}
    </View>
  );
};

// Preset empty states
export const NoCircleEmptyState: React.FC<{ onJoinQueue?: () => void }> = ({
  onJoinQueue,
}) => (
  <EmptyState
    title="Finding your circle..."
    description="We're matching you with people who share your interests. This usually takes 24-48 hours."
    actionLabel="Join Matching Queue"
    onAction={onJoinQueue}
  />
);

export const NoActivitiesEmptyState: React.FC<{ onCreateActivity?: () => void }> = ({
  onCreateActivity,
}) => (
  <EmptyState
    title="No activities nearby"
    description="Be the first to create an activity and meet new people in your area!"
    actionLabel="Create Activity"
    onAction={onCreateActivity}
  />
);

export const NoMessagesEmptyState: React.FC = () => (
  <EmptyState
    title="No messages yet"
    description="Start the conversation! Say hello to your circle."
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.5,
    maxWidth: 280,
  },
  button: {
    marginTop: Spacing.xl,
  },
});

export default EmptyState;
