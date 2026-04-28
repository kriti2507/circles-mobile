/**
 * Circle Chat Screen
 * Real-time group messaging for circle members
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { MessageList } from '../../src/components/chat/MessageList';
import { ChatInput } from '../../src/components/chat/ChatInput';
import { TypingIndicator } from '../../src/components/chat/TypingIndicator';
import { AvatarGroup } from '../../src/components/ui/Avatar';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useChat } from '../../src/hooks/useChat';
import { useCircleStore, selectActiveMembers } from '../../src/stores/circleStore';
import { useAuthStore } from '../../src/stores/authStore';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, IconSize } from '../../src/constants/spacing';

export default function CircleChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);
  const circle = useCircleStore((state) => state.circle);
  const members = useCircleStore(selectActiveMembers);

  const {
    messages,
    hasMore,
    isLoading,
    isConnected,
    typingUsers,
    error,
    fetchMessages,
    loadMore,
    sendMessage,
    handleTyping,
  } = useChat({
    roomType: 'circle',
    roomId: circle?.id || '',
  });

  // Fetch messages on mount
  useEffect(() => {
    if (circle?.id) {
      fetchMessages();
    }
  }, [circle?.id, fetchMessages]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSend = useCallback(
    async (content: string) => {
      try {
        await sendMessage(content);
      } catch (err) {
        // Error is handled in the hook
      }
    },
    [sendMessage]
  );

  // No circle - shouldn't happen but handle gracefully
  if (!circle) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <EmptyState
          title="No Circle"
          description="You're not in a circle yet. Join the matching queue to get matched."
          actionLabel="Go Back"
          onAction={handleBack}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.circleName} numberOfLines={1}>
            {circle.name}
          </Text>
          <View style={styles.headerMeta}>
            <View
              style={[
                styles.connectionDot,
                { backgroundColor: isConnected ? Colors.success : Colors.error },
              ]}
            />
            <Text style={styles.memberCount}>
              {members.length} members
            </Text>
          </View>
        </View>

        <AvatarGroup
          avatars={members.slice(0, 3).map((m) => ({
            source: m.avatarUrl,
            name: m.displayName,
          }))}
          max={3}
          size="xs"
        />
      </View>

      {/* Chat Content */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading && messages.length === 0 ? (
          <Loading />
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="Start the Conversation"
              description="Say hello to your circle members! Break the ice and get to know each other."
            />
          </View>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={user?.id || ''}
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={loadMore}
          />
        )}

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onTyping={handleTyping}
          placeholder="Type a message..."
        />
      </KeyboardAvoidingView>

      {/* Connection Lost Banner */}
      {!isConnected && (
        <View style={[styles.connectionBanner, { bottom: insets.bottom + 80 }]}>
          <Ionicons name="cloud-offline-outline" size={16} color={Colors.surfaceLight} />
          <Text style={styles.connectionText}>Reconnecting...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  circleName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  memberCount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  chatContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  connectionBanner: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  connectionText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.surfaceLight,
  },
});
