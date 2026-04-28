/**
 * Profile Screen
 * User profile and settings
 */

import React from 'react';
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
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { useAuth } from '../../src/hooks/useAuth';
import { getInterestById } from '../../src/constants/interests';
import { getLanguageByCode } from '../../src/constants/languages';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius, IconSize } from '../../src/constants/spacing';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  showBadge?: boolean;
  destructive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onPress,
  showBadge,
  destructive,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <Ionicons
        name={icon as any}
        size={IconSize.md}
        color={destructive ? Colors.error : Colors.textPrimary}
      />
      <Text
        style={[styles.menuItemLabel, destructive && styles.menuItemLabelDestructive]}
      >
        {label}
      </Text>
    </View>
    <View style={styles.menuItemRight}>
      {showBadge && <View style={styles.menuBadge} />}
      <Ionicons name="chevron-forward" size={IconSize.sm} color={Colors.textMuted} />
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const { signOut, isLoading } = useAuth();

  const handleEditProfile = () => {
    // router.push('/settings/profile');
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              source={user?.avatarUrl}
              name={user?.displayName}
              size="3xl"
              showBorder
              borderColor={Colors.primary}
            />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="camera" size={16} color={Colors.surfaceLight} />
            </TouchableOpacity>
          </View>

          <Text style={styles.displayName}>{user?.displayName}</Text>

          {user?.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={Colors.textMuted} />
              <Text style={styles.locationText}>{user.city}</Text>
            </View>
          )}

          {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

          {/* Languages */}
          {user?.languages && user.languages.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsSectionLabel}>Languages</Text>
              <View style={styles.tagsRow}>
                {user.languages.map((code) => {
                  const lang = getLanguageByCode(code);
                  return (
                    <Badge
                      key={code}
                      label={lang?.nativeLabel || code}
                      variant="outline"
                      size="sm"
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* Interests */}
          {user?.interests && user.interests.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsSectionLabel}>Interests</Text>
              <View style={styles.tagsRow}>
                {user.interests.slice(0, 5).map((id) => {
                  const interest = getInterestById(id);
                  return (
                    <Badge
                      key={id}
                      label={`${interest?.emoji || ''} ${interest?.label || id}`}
                      variant="default"
                      size="sm"
                    />
                  );
                })}
                {user.interests.length > 5 && (
                  <Badge
                    label={`+${user.interests.length - 5}`}
                    variant="default"
                    size="sm"
                  />
                )}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <Card padding="none">
            <MenuItem
              icon="person-outline"
              label="Edit Profile"
              onPress={handleEditProfile}
            />
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => {}}
            />
            <MenuItem
              icon="language-outline"
              label="Language"
              onPress={() => {}}
            />
          </Card>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>
          <Card padding="none">
            <MenuItem
              icon="help-circle-outline"
              label="Help & FAQ"
              onPress={() => {}}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => {}}
            />
            <MenuItem
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => {}}
            />
          </Card>
        </View>

        <View style={styles.menuSection}>
          <Card padding="none">
            <MenuItem
              icon="log-out-outline"
              label="Log Out"
              onPress={handleLogout}
              destructive
            />
          </Card>
        </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  headerTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  settingsButton: {
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
  profileCard: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  profileHeader: {
    position: 'relative',
    marginBottom: Spacing.base,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surfaceLight,
  },
  displayName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  locationText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  bio: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.5,
    marginBottom: Spacing.lg,
  },
  tagsSection: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  tagsSectionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  editButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  editButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  menuSectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  menuItemLabelDestructive: {
    color: Colors.error,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  menuBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  versionText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
