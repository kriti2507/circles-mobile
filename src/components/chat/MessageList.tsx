/**
 * MessageList Component
 * Inverted FlatList for chat messages with infinite scroll
 */

import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  ListRenderItem,
} from 'react-native';
import { MessageBubble } from './MessageBubble';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import type { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  style?: ViewStyle;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  hasMore,
  isLoading,
  onLoadMore,
  style,
}) => {
  const flatListRef = useRef<FlatList>(null);

  // Group messages by sender for avatar/name display
  // Messages are in DESC order (newest first), inverted FlatList shows index 0 at bottom
  const shouldShowAvatar = useCallback(
    (message: Message, index: number): boolean => {
      if (message.senderId === currentUserId) return false;
      if (message.messageType !== 'text') return false;

      // Show avatar at the bottom of a consecutive group (lowest index = bottommost)
      const belowMessage = messages[index - 1];
      if (!belowMessage) return true;
      if (belowMessage.senderId !== message.senderId) return true;
      if (belowMessage.messageType !== 'text') return true;

      return false;
    },
    [messages, currentUserId]
  );

  const shouldShowName = useCallback(
    (message: Message, index: number): boolean => {
      if (message.senderId === currentUserId) return false;
      if (message.messageType !== 'text') return false;

      // Show name at the top of a consecutive group (highest index = topmost)
      const aboveMessage = messages[index + 1];
      if (!aboveMessage) return true;
      if (aboveMessage.senderId !== message.senderId) return true;
      if (aboveMessage.messageType !== 'text') return true;

      return false;
    },
    [messages, currentUserId]
  );

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item, index }) => {
      const isOwnMessage = item.senderId === currentUserId;
      const showAvatar = shouldShowAvatar(item, index);
      const showName = shouldShowName(item, index);

      return (
        <MessageBubble
          message={item}
          isOwnMessage={isOwnMessage}
          showAvatar={showAvatar}
          showName={showName}
        />
      );
    },
    [currentUserId, shouldShowAvatar, shouldShowName]
  );

  const renderFooter = useCallback(() => {
    if (!isLoading || !hasMore) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }, [isLoading, hasMore]);

  const handleEndReached = useCallback(() => {
    if (!isLoading && hasMore) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      inverted
      style={[styles.list, style]}
      contentContainerStyle={styles.contentContainer}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.2}
      showsVerticalScrollIndicator={false}
      automaticallyAdjustContentInsets={false}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  contentContainer: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});

export default MessageList;
