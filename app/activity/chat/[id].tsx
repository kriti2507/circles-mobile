/**
 * Activity Chat Screen
 * Real-time messaging for activity participants
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { MessageList } from '../../../src/components/chat/MessageList';
import { ChatInput } from '../../../src/components/chat/ChatInput';
import { TypingIndicator } from '../../../src/components/chat/TypingIndicator';
import { AvatarGroup } from '../../../src/components/ui/Avatar';
import { Loading } from '../../../src/components/ui/Loading';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { useChat } from '../../../src/hooks/useChat';
import { useActivities } from '../../../src/hooks/useActivities';
import { useAuthStore } from '../../../src/stores/authStore';
import { Colors } from '../../../src/constants/colors';
import { FontFamily, FontSize } from '../../../src/constants/typography';
import { Spacing, IconSize } from '../../../src/constants/spacing';

export default function ActivityChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);
  const { currentActivity, fetchActivity, isLoading: activityLoading } = useActivities();

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
    roomType: 'activity',
    roomId: id || '',
  });

  // Fetch activity details and messages on mount
  useEffect(() => {
    if (id) {
      fetchActivity(id);
      fetchMessages();
    }
  }, [id, fetchActivity, fetchMessages]);

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

  const handleViewDetails = useCallback(() => {
    router.push(`/activity/${id}`);
  }, [router, id]);

  // Get approved participants for display
  const approvedParticipants = currentActivity?.participants?.filter(
    (p) => p.status === 'approved'
  ) || [];

  // Loading state
  if (activityLoading && !currentActivity) {
    return <Loading />;
  }

  // No activity found
  if (!currentActivity) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <EmptyState
          title="Activity Not Found"
          description="This activity may have been deleted."
          actionLabel="Go Back"
          onAction={handleBack}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerContent} onPress={handleViewDetails}>
          <Text style={styles.activityTitle} numberOfLines={1}>
            {currentActivity.title}
          </Text>
          <View style={styles.headerMeta}>
            <View
              style={[
                styles.connectionDot,
                { backgroundColor: isConnected ? Colors.success : Colors.error },
              ]}
            />
            <Text style={styles.participantCount}>
              {approvedParticipants.length + 1} participants
            </Text>
          </View>
        </TouchableOpacity>

        <AvatarGroup
          avatars={[
            { source: currentActivity.host.avatarUrl, name: currentActivity.host.displayName },
            ...approvedParticipants.slice(0, 2).map((p) => ({
              source: p.user.avatarUrl,
              name: p.user.displayName,
            })),
          ]}
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
              title="Start Planning"
              description="Coordinate with other participants for the activity!"
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
          disabled={!isConnected}
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
  activityTitle: {
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
  participantCount: {
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
