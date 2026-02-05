/**
 * MessageBubble Component
 * Chat message bubble with different styles for own/other messages
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { BorderRadius, Spacing } from '../../constants/spacing';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showName?: boolean;
  style?: ViewStyle;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
  showName = true,
  style,
}) => {
  // Format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // System messages
  if (message.messageType === 'system') {
    return (
      <View style={[styles.systemContainer, style]}>
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    );
  }

  // Prompt messages
  if (message.messageType === 'prompt') {
    return (
      <View style={[styles.promptContainer, style]}>
        <View style={styles.promptBadge}>
          <Text style={styles.promptBadgeText}>This Week's Prompt</Text>
        </View>
        <Text style={styles.promptText}>{message.content}</Text>
      </View>
    );
  }

  // Regular text messages
  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.containerOwn : styles.containerOther,
        style,
      ]}
    >
      {!isOwnMessage && showAvatar && (
        <Avatar
          source={message.senderAvatar}
          name={message.senderName}
          size="sm"
          style={styles.avatar}
        />
      )}

      <View style={styles.contentWrapper}>
        {!isOwnMessage && showName && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        <View
          style={[
            styles.bubble,
            isOwnMessage ? styles.bubbleOwn : styles.bubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.messageTextOwn : styles.messageTextOther,
            ]}
          >
            {message.content}
          </Text>
        </View>

        <Text
          style={[
            styles.timestamp,
            isOwnMessage ? styles.timestampOwn : styles.timestampOther,
          ]}
        >
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Regular message container
  container: {
    flexDirection: 'row',
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.base,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },

  // Avatar
  avatar: {
    marginRight: Spacing.sm,
    marginTop: Spacing.xs,
  },

  // Content wrapper
  contentWrapper: {
    maxWidth: '75%',
  },

  // Sender name
  senderName: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },

  // Message bubble
  bubble: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  bubbleOwn: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.sm,
  },
  bubbleOther: {
    backgroundColor: Colors.gray100,
    borderBottomLeftRadius: BorderRadius.sm,
  },

  // Message text
  messageText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.4,
  },
  messageTextOwn: {
    color: Colors.textOnPrimary,
  },
  messageTextOther: {
    color: Colors.textPrimary,
  },

  // Timestamp
  timestamp: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  timestampOwn: {
    textAlign: 'right',
    marginRight: Spacing.xs,
  },
  timestampOther: {
    textAlign: 'left',
    marginLeft: Spacing.xs,
  },

  // System message
  systemContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  systemText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Prompt message
  promptContainer: {
    marginVertical: Spacing.md,
    marginHorizontal: Spacing.base,
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
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  promptBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textOnPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: FontSize.md * 1.5,
  },
});

export default MessageBubble;
