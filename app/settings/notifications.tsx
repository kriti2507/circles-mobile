/**
 * Notification Settings Screen
 * Manage push notification preferences
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { usersService } from '../../src/services/users';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, IconSize } from '../../src/constants/spacing';

interface ToggleItemProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const ToggleItem: React.FC<ToggleItemProps> = ({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}) => (
  <View style={[styles.toggleItem, disabled && styles.toggleItemDisabled]}>
    <View style={styles.toggleContent}>
      <Text style={styles.toggleTitle}>{title}</Text>
      <Text style={styles.toggleDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: Colors.gray300, true: Colors.primary }}
      thumbColor={Colors.surfaceLight}
      disabled={disabled}
    />
  </View>
);

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const settings = useAuthStore((state) => state.settings);
  const updateSettings = useAuthStore((state) => state.updateSettings);

  const [isUpdating, setIsUpdating] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleToggle = useCallback(
    async (key: string, value: boolean) => {
      setIsUpdating(true);
      try {
        const updates = { [key]: value };
        const updatedSettings = await usersService.updateSettings(updates);
        updateSettings(updatedSettings);
      } catch (err) {
        Alert.alert('Error', 'Failed to update settings. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    },
    [updateSettings]
  );

  const notificationsEnabled = settings?.notificationsEnabled ?? true;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Master Toggle */}
        <Card style={styles.masterToggle}>
          <ToggleItem
            title="Push Notifications"
            description="Receive notifications on your device"
            value={notificationsEnabled}
            onValueChange={(value) => handleToggle('notificationsEnabled', value)}
          />
        </Card>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <Card padding="none">
            <View style={styles.itemWrapper}>
              <ToggleItem
                title="Messages"
                description="New messages in your circle or activities"
                value={settings?.notificationsMessages ?? true}
                onValueChange={(value) => handleToggle('notificationsMessages', value)}
                disabled={!notificationsEnabled}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.itemWrapper}>
              <ToggleItem
                title="Weekly Prompts"
                description="New prompts for your circle"
                value={settings?.notificationsPrompts ?? true}
                onValueChange={(value) => handleToggle('notificationsPrompts', value)}
                disabled={!notificationsEnabled}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.itemWrapper}>
              <ToggleItem
                title="Activity Updates"
                description="Join requests, approvals, and reminders"
                value={settings?.notificationsActivities ?? true}
                onValueChange={(value) => handleToggle('notificationsActivities', value)}
                disabled={!notificationsEnabled}
              />
            </View>
          </Card>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.infoText}>
            You can also manage notification permissions in your device settings.
          </Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  masterToggle: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  itemWrapper: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleItemDisabled: {
    opacity: 0.5,
  },
  toggleContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  toggleDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.base,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.gray50,
    padding: Spacing.base,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: FontSize.sm * 1.5,
  },
});
