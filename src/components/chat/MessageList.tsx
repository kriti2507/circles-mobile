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
  const shouldShowAvatar = useCallback(
    (message: Message, index: number): boolean => {
      if (message.senderId === currentUserId) return false;
      if (message.messageType !== 'text') return false;

      // Show avatar if this is the last message from this sender in a group
      const nextMessage = messages[index + 1];
      if (!nextMessage) return true;
      if (nextMessage.senderId !== message.senderId) return true;
      if (nextMessage.messageType !== 'text') return true;

      return false;
    },
    [messages, currentUserId]
  );

  const shouldShowName = useCallback(
    (message: Message, index: number): boolean => {
      if (message.senderId === currentUserId) return false;
      if (message.messageType !== 'text') return false;

      // Show name if this is the first message from this sender in a group
      const prevMessage = messages[index - 1];
      if (!prevMessage) return true;
      if (prevMessage.senderId !== message.senderId) return true;
      if (prevMessage.messageType !== 'text') return true;

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
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  contentContainer: {
    paddingVertical: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});

export default MessageList;
