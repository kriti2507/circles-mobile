/**
 * Activities Screen
 * Browse and join nearby activities
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, AvatarGroup } from '../../src/components/ui/Avatar';
import { FilterChip } from '../../src/components/ui/Chip';
import { Badge } from '../../src/components/ui/Badge';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useActivities } from '../../src/hooks/useActivities';
import { useLocation } from '../../src/hooks/useLocation';
import type { Activity } from '../../src/types';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius, IconSize } from '../../src/constants/spacing';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'sports', label: 'Sports', icon: 'fitness' },
  { id: 'coffee', label: 'Coffee', icon: 'cafe' },
  { id: 'hiking', label: 'Outdoors', icon: 'leaf' },
];

export default function ActivitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getCurrentLocation, location } = useLocation();
  const {
    activities,
    isLoading,
    isRefreshing,
    fetchActivities,
    setFilters,
  } = useActivities();

  const [selectedFilter, setSelectedFilter] = useState('all');

  // Get location and fetch activities on mount
  useEffect(() => {
    const init = async () => {
      const loc = await getCurrentLocation();
      if (loc) {
        setFilters({ latitude: loc.latitude, longitude: loc.longitude });
        fetchActivities();
      }
    };
    init();
  }, []);

  const handleRefresh = () => {
    fetchActivities(true);
  };

  const handleCreateActivity = () => {
    router.push('/activity/create');
  };

  const handleActivityPress = (activityId: string) => {
    router.push(`/activity/${activityId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderActivityCard = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => handleActivityPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Badge label="ACTIVITY" variant="primary" size="sm" />
          <Text style={styles.activityTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.activityMeta}>
            <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{formatDate(item.scheduledAt)}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{item.locationName || 'Location TBD'}</Text>
          </View>
        </View>
        <Avatar source={item.host.avatarUrl} name={item.host.displayName} size="lg" />
      </View>

      {/* Placeholder image */}
      <View style={styles.activityImage}>
        <Ionicons name="image-outline" size={48} color={Colors.gray300} />
      </View>

      <View style={styles.cardFooter}>
        <AvatarGroup
          avatars={[{ source: item.host.avatarUrl, name: item.host.displayName }]}
          size="sm"
        />
        <View style={styles.participantInfo}>
          <Text style={styles.participantText}>
            {item.currentParticipants}/{item.maxParticipants} joined
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar source={undefined} name="U" size="md" showBorder />
          <Text style={styles.headerTitle}>Activities</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={FILTER_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              icon={
                item.icon ? (
                  <Ionicons name={item.icon as any} size={16} color={
                    selectedFilter === item.id ? Colors.backgroundDark : Colors.textMuted
                  } />
                ) : undefined
              }
              selected={selectedFilter === item.id}
              onPress={() => setSelectedFilter(item.id)}
              style={styles.filterChip}
            />
          )}
        />
      </View>

      {/* Activities list */}
      {isLoading && !isRefreshing ? (
        <Loading />
      ) : activities.length === 0 ? (
        <EmptyState
          title="No activities nearby"
          description="Be the first to create an activity and meet new people!"
          actionLabel="Create Activity"
          onAction={handleCreateActivity}
        />
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + Spacing['3xl'] }]}
        onPress={handleCreateActivity}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color={Colors.backgroundDark} />
      </TouchableOpacity>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTitle: {
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
  filtersContainer: {
    paddingVertical: Spacing.sm,
  },
  filtersList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  filterChip: {
    marginRight: Spacing.sm,
  },
  listContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  activityCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  activityTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.gray300,
  },
  activityImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  participantText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
