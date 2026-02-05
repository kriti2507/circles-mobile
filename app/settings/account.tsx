/**
 * Account Settings Screen
 * Privacy, safety, and account management
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { ConfirmDialog } from '../../src/components/ui/Modal';
import { useAuthStore } from '../../src/stores/authStore';
import { usersService } from '../../src/services/users';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, IconSize } from '../../src/constants/spacing';

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  destructive = false,
}) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    <View
      style={[
        styles.settingsIcon,
        destructive && styles.settingsIconDestructive,
      ]}
    >
      <Ionicons
        name={icon as any}
        size={IconSize.sm}
        color={destructive ? Colors.error : Colors.primary}
      />
    </View>
    <View style={styles.settingsContent}>
      <Text
        style={[styles.settingsTitle, destructive && styles.settingsTitleDestructive]}
      >
        {title}
      </Text>
      {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={IconSize.sm} color={Colors.textMuted} />
    )}
  </TouchableOpacity>
);

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((state) => state.logout);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDeleteAccount = useCallback(async () => {
    setShowDeleteDialog(false);
    setIsDeleting(true);

    try {
      await usersService.deleteAccount();
      logout();
      router.replace('/(auth)/welcome');
    } catch (err) {
      Alert.alert(
        'Error',
        'Failed to delete account. Please try again or contact support.'
      );
    } finally {
      setIsDeleting(false);
    }
  }, [logout, router]);

  const handleBlockedUsers = useCallback(() => {
    Alert.alert(
      'Blocked Users',
      'You have no blocked users.',
      [{ text: 'OK' }]
    );
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Safety</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <Card padding="none">
            <SettingsItem
              icon="eye-off-outline"
              title="Blocked Users"
              subtitle="Manage blocked accounts"
              onPress={handleBlockedUsers}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="location-outline"
              title="Location Privacy"
              subtitle="Only city-level shown to others"
              onPress={() => {}}
              showChevron={false}
            />
          </Card>
        </View>

        {/* Safety Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety</Text>
          <Card padding="none">
            <SettingsItem
              icon="shield-outline"
              title="Safety Tips"
              subtitle="Best practices for meeting up"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="flag-outline"
              title="Report a Problem"
              subtitle="Report issues or concerns"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>
          <Card padding="none">
            <SettingsItem
              icon="download-outline"
              title="Request Your Data"
              subtitle="Get a copy of your data"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          <Card style={styles.dangerCard}>
            <View style={styles.dangerContent}>
              <Text style={styles.dangerHeading}>Delete Account</Text>
              <Text style={styles.dangerText}>
                This will permanently delete your account and all associated data. This action cannot be undone.
              </Text>
              <Button
                title="Delete Account"
                variant="outline"
                onPress={() => setShowDeleteDialog(true)}
                loading={isDeleting}
                style={styles.deleteButton}
                textStyle={styles.deleteButtonText}
              />
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Account"
        message="Are you absolutely sure? This will permanently delete your account, all your data, and cannot be undone. You will be removed from your circle and all activities."
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
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
    paddingBottom: Spacing['3xl'],
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
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryTransparent10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  settingsContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingsTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  settingsTitleDestructive: {
    color: Colors.error,
  },
  settingsSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 60,
  },
  dangerTitle: {
    color: Colors.error,
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerContent: {
    alignItems: 'center',
  },
  dangerHeading: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  dangerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: FontSize.sm * 1.5,
    marginBottom: Spacing.lg,
  },
  deleteButton: {
    borderColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.error,
  },
});
