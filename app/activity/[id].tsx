/**
 * Activity Detail Screen
 * View activity details and manage participation
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { Avatar, AvatarGroup } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { Loading } from '../../src/components/ui/Loading';
import { ConfirmDialog } from '../../src/components/ui/Modal';
import { useActivities } from '../../src/hooks/useActivities';
import { useAuthStore } from '../../src/stores/authStore';
import type { ActivityParticipant } from '../../src/types';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius, IconSize } from '../../src/constants/spacing';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const {
    currentActivity,
    isLoading,
    fetchActivity,
    joinActivity,
    leaveActivity,
    respondToParticipant,
    deleteActivity,
  } = useActivities();

  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch activity details
  useEffect(() => {
    if (id) {
      fetchActivity(id);
    }
  }, [id, fetchActivity]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRefresh = useCallback(async () => {
    if (id) {
      await fetchActivity(id);
    }
  }, [id, fetchActivity]);

  const handleJoin = useCallback(async () => {
    if (!id) return;
    setIsProcessing(true);
    try {
      await joinActivity(id);
    } catch (err) {
      Alert.alert('Error', 'Failed to join activity. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [id, joinActivity]);

  const handleLeave = useCallback(async () => {
    if (!id) return;
    setShowLeaveDialog(false);
    setIsProcessing(true);
    try {
      await leaveActivity(id);
    } catch (err) {
      Alert.alert('Error', 'Failed to leave activity. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [id, leaveActivity]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    setShowDeleteDialog(false);
    setIsProcessing(true);
    try {
      await deleteActivity(id);
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to delete activity. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [id, deleteActivity, router]);

  const handleParticipantResponse = useCallback(
    async (userId: string, status: 'approved' | 'declined') => {
      if (!id) return;
      setIsProcessing(true);
      try {
        await respondToParticipant(id, userId, status);
      } catch (err) {
        Alert.alert('Error', 'Failed to respond to participant.');
      } finally {
        setIsProcessing(false);
      }
    },
    [id, respondToParticipant]
  );

  const handleOpenChat = useCallback(() => {
    router.push(`/activity/chat/${id}`);
  }, [router, id]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading && !currentActivity) {
    return <Loading />;
  }

  if (!currentActivity) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={IconSize.md} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Activity not found</Text>
          <Button title="Go Back" onPress={handleBack} variant="outline" />
        </View>
      </View>
    );
  }

  const isHost = currentActivity.hostId === user?.id;
  const isParticipating = currentActivity.isParticipating;
  const userParticipantStatus = currentActivity.userParticipantStatus;
  const isFull = currentActivity.currentParticipants >= currentActivity.maxParticipants;
  const isPast = new Date(currentActivity.scheduledAt) < new Date();

  const approvedParticipants = currentActivity.participants?.filter(
    (p) => p.status === 'approved'
  ) || [];
  const pendingParticipants = currentActivity.participants?.filter(
    (p) => p.status === 'pending'
  ) || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity</Text>
        {isHost && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowDeleteDialog(true)}
          >
            <Ionicons name="trash-outline" size={IconSize.sm} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Activity Image Placeholder */}
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={64} color={Colors.gray300} />
        </View>

        {/* Title and Status */}
        <View style={styles.titleSection}>
          <View style={styles.badges}>
            <Badge
              label={currentActivity.status.toUpperCase()}
              variant={currentActivity.status === 'open' ? 'primary' : 'muted'}
              size="sm"
            />
            {isPast && <Badge label="PAST" variant="muted" size="sm" />}
          </View>
          <Text style={styles.title}>{currentActivity.title}</Text>
        </View>

        {/* Host Info */}
        <Card style={styles.hostCard}>
          <View style={styles.hostRow}>
            <Avatar
              source={currentActivity.host.avatarUrl}
              name={currentActivity.host.displayName}
              size="lg"
            />
            <View style={styles.hostInfo}>
              <Text style={styles.hostLabel}>Hosted by</Text>
              <Text style={styles.hostName}>{currentActivity.host.displayName}</Text>
            </View>
            {isHost && <Badge label="YOU" variant="primary" size="sm" />}
          </View>
        </Card>

        {/* Date & Time */}
        <Card style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={IconSize.md} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {formatDate(currentActivity.scheduledAt)}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={IconSize.md} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {formatTime(currentActivity.scheduledAt)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Location */}
        <Card style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="location-outline" size={IconSize.md} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {currentActivity.locationName || 'Location to be determined'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        {currentActivity.description && (
          <Card style={styles.descriptionCard}>
            <Text style={styles.descriptionLabel}>About</Text>
            <Text style={styles.description}>{currentActivity.description}</Text>
          </Card>
        )}

        {/* Participants */}
        <View style={styles.participantsSection}>
          <Text style={styles.sectionTitle}>
            Participants ({approvedParticipants.length + 1}/{currentActivity.maxParticipants})
          </Text>
          <View style={styles.participantsList}>
            {/* Host always first */}
            <View style={styles.participantItem}>
              <Avatar
                source={currentActivity.host.avatarUrl}
                name={currentActivity.host.displayName}
                size="md"
              />
              <Text style={styles.participantName}>
                {currentActivity.host.displayName}
              </Text>
              <Badge label="HOST" variant="primary" size="sm" />
            </View>

            {/* Approved participants */}
            {approvedParticipants.map((p) => (
              <View key={p.id} style={styles.participantItem}>
                <Avatar
                  source={p.user.avatarUrl}
                  name={p.user.displayName}
                  size="md"
                />
                <Text style={styles.participantName}>{p.user.displayName}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pending Requests (Host Only) */}
        {isHost && pendingParticipants.length > 0 && (
          <View style={styles.pendingSection}>
            <Text style={styles.sectionTitle}>
              Pending Requests ({pendingParticipants.length})
            </Text>
            {pendingParticipants.map((p) => (
              <Card key={p.id} style={styles.pendingCard}>
                <View style={styles.pendingRow}>
                  <Avatar
                    source={p.user.avatarUrl}
                    name={p.user.displayName}
                    size="md"
                  />
                  <Text style={styles.pendingName}>{p.user.displayName}</Text>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => handleParticipantResponse(p.userId, 'declined')}
                    >
                      <Ionicons name="close" size={20} color={Colors.error} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleParticipantResponse(p.userId, 'approved')}
                    >
                      <Ionicons name="checkmark" size={20} color={Colors.surfaceLight} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + Spacing.base }]}>
        {isHost ? (
          <Button
            title="Open Chat"
            onPress={handleOpenChat}
            size="lg"
            leftIcon={<Ionicons name="chatbubbles" size={20} color={Colors.backgroundDark} />}
          />
        ) : isParticipating ? (
          <View style={styles.participatingActions}>
            {userParticipantStatus === 'pending' ? (
              <View style={styles.pendingStatus}>
                <Ionicons name="time-outline" size={20} color={Colors.warning} />
                <Text style={styles.pendingStatusText}>Waiting for approval</Text>
              </View>
            ) : userParticipantStatus === 'approved' ? (
              <>
                <Button
                  title="Open Chat"
                  onPress={handleOpenChat}
                  size="lg"
                  style={styles.chatButton}
                  leftIcon={<Ionicons name="chatbubbles" size={20} color={Colors.backgroundDark} />}
                />
                <Button
                  title="Leave"
                  onPress={() => setShowLeaveDialog(true)}
                  variant="outline"
                  size="lg"
                />
              </>
            ) : null}
          </View>
        ) : isPast ? (
          <Button title="Activity has ended" disabled size="lg" />
        ) : isFull ? (
          <Button title="Activity is full" disabled size="lg" />
        ) : (
          <Button
            title="Request to Join"
            onPress={handleJoin}
            size="lg"
            loading={isProcessing}
          />
        )}
      </View>

      {/* Leave Confirmation Dialog */}
      <ConfirmDialog
        visible={showLeaveDialog}
        title="Leave Activity"
        message="Are you sure you want to leave this activity?"
        confirmText="Leave"
        cancelText="Cancel"
        onConfirm={handleLeave}
        onCancel={() => setShowLeaveDialog(false)}
        destructive
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Activity"
        message="Are you sure you want to delete this activity? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        destructive
      />
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
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    padding: Spacing.xl,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    lineHeight: FontSize['2xl'] * 1.2,
  },
  hostCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  hostLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  hostName: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  detailCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryTransparent10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  detailLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  detailValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
    marginLeft: 52,
  },
  descriptionCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  descriptionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: FontSize.md * 1.5,
  },
  participantsSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  participantsList: {
    gap: Spacing.md,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  participantName: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  pendingSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  pendingCard: {
    marginBottom: Spacing.sm,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingName: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  declineButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActions: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    backgroundColor: Colors.surfaceLight,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  participatingActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  chatButton: {
    flex: 1,
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  pendingStatusText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.warning,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    color: Colors.textMuted,
  },
});
