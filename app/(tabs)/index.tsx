/**
 * Home Screen
 * Circle view or waiting state
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { Avatar, AvatarGroup } from '../../src/components/ui/Avatar';
import { Card, PromptCard } from '../../src/components/ui/Card';
import { Loading } from '../../src/components/ui/Loading';
import { useCircle } from '../../src/hooks/useCircle';
import { useAuthStore } from '../../src/stores/authStore';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius, IconSize } from '../../src/constants/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const {
    circle,
    activeMembers,
    currentPrompt,
    queueStatus,
    isLoading,
    hasCircle,
    isInQueue,
    fetchCircle,
    joinQueue,
  } = useCircle();

  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchCircle();
  }, [fetchCircle]);

  const handleOpenChat = () => {
    router.push('/circle/chat');
  };

  const handleJoinQueue = async () => {
    setIsJoining(true);
    try {
      await joinQueue();
    } catch (err: any) {
      Alert.alert(
        'Could not join queue',
        err?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Circles</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchCircle}
            tintColor={Colors.primary}
          />
        }
      >
        {hasCircle ? (
          // Circle View
          <>
            {/* Circle Header */}
            <Card style={styles.circleCard}>
              <View style={styles.circleHeader}>
                <Text style={styles.circleName}>{circle?.name}</Text>
                <TouchableOpacity>
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={IconSize.md}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Members */}
              <View style={styles.membersSection}>
                <AvatarGroup
                  avatars={activeMembers.map((m) => ({
                    source: m.avatarUrl,
                    name: m.displayName,
                  }))}
                  size="md"
                />
                <Text style={styles.memberCount}>
                  {activeMembers.length} members
                </Text>
              </View>
            </Card>

            {/* Current Prompt */}
            {currentPrompt && (
              <View style={styles.promptSection}>
                <Text style={styles.sectionTitle}>This Week's Prompt</Text>
                <PromptCard>
                  <View style={styles.promptContent}>
                    <View style={styles.promptBadge}>
                      <Text style={styles.promptBadgeText}>PINNED</Text>
                    </View>
                    <Text style={styles.promptText}>
                      {currentPrompt.textEn}
                    </Text>
                  </View>
                </PromptCard>
              </View>
            )}

            {/* Open Chat Button */}
            <Button
              title="Open Chat"
              onPress={handleOpenChat}
              size="lg"
              style={styles.chatButton}
              rightIcon={
                <Ionicons
                  name="chatbubbles"
                  size={IconSize.md}
                  color={Colors.backgroundDark}
                />
              }
            />
          </>
        ) : (
          // Waiting State
          <View style={styles.waitingContainer}>
            <View style={styles.waitingIconContainer}>
              <Ionicons
                name="search"
                size={64}
                color={Colors.primary}
              />
            </View>

            <Text style={styles.waitingTitle}>
              {isInQueue ? 'Finding your circle...' : 'Find your circle'}
            </Text>

            <Text style={styles.waitingDescription}>
              {isInQueue
                ? `You're #${queueStatus?.position || '...'} in queue. We'll notify you when you're matched!`
                : "Join the matching queue and we'll find the perfect circle for you based on your interests and location."}
            </Text>

            {!isInQueue && (
              <Button
                title="Join Matching Queue"
                onPress={handleJoinQueue}
                loading={isJoining}
                size="lg"
                style={styles.joinButton}
              />
            )}

            <View style={styles.browseSection}>
              <Text style={styles.browseText}>
                While you wait, browse activities nearby
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/(tabs)/activities')}
              >
                <Text style={styles.browseButtonText}>Browse Activities</Text>
                <Ionicons
                  name="arrow-forward"
                  size={IconSize.sm}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  appTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  circleCard: {
    marginBottom: Spacing.xl,
  },
  circleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  circleName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  membersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  memberCount: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  promptSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  promptContent: {
    paddingTop: Spacing['2xl'],
  },
  promptBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  promptBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.backgroundDark,
    letterSpacing: 1,
  },
  promptText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    lineHeight: FontSize.lg * 1.5,
  },
  chatButton: {
    marginTop: Spacing.md,
  },

  // Waiting state
  waitingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
  },
  waitingIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryTransparent10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  waitingTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  waitingDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.5,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  joinButton: {
    width: '100%',
  },
  browseSection: {
    marginTop: Spacing['3xl'],
    alignItems: 'center',
  },
  browseText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  browseButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
});
