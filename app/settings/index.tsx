/**
 * Settings Screen
 * Main settings hub
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { useAuth } from '../../src/hooks/useAuth';
import { AppLanguages, getLanguageByCode } from '../../src/constants/languages';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius, IconSize } from '../../src/constants/spacing';

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

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const settings = useAuthStore((state) => state.settings);
  const { signOut } = useAuth();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const currentLanguage = getLanguageByCode(settings?.language || 'en');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar
              source={user?.avatarUrl}
              name={user?.displayName}
              size="xl"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName}</Text>
              <Text style={styles.profilePhone}>{user?.phone}</Text>
              <Text style={styles.profileLocation}>
                {user?.city || 'Location not set'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Card padding="none">
            <SettingsItem
              icon="notifications-outline"
              title="Notifications"
              subtitle={settings?.notificationsEnabled ? 'On' : 'Off'}
              onPress={() => router.push('/settings/notifications')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="language-outline"
              title="Language"
              subtitle={currentLanguage?.nativeLabel || 'English'}
              onPress={() => router.push('/settings/language')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="speedometer-outline"
              title="Distance Unit"
              subtitle={settings?.distanceUnit === 'miles' ? 'Miles' : 'Kilometers'}
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card padding="none">
            <SettingsItem
              icon="person-outline"
              title="Edit Profile"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="shield-checkmark-outline"
              title="Privacy & Safety"
              onPress={() => router.push('/settings/account')}
            />
          </Card>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card padding="none">
            <SettingsItem
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="lock-closed-outline"
              title="Privacy Policy"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <Card padding="none">
            <SettingsItem
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleSignOut}
              showChevron={false}
              destructive
            />
          </Card>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Circles v1.0.0</Text>
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
    paddingBottom: Spacing['3xl'],
  },
  profileCard: {
    marginBottom: Spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  profileName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  profilePhone: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  profileLocation: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
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
  versionText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
