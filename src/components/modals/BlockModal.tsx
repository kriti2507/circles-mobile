/**
 * BlockModal Component
 * Confirmation modal for blocking a user
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { usersService } from '../../services/users';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';

interface BlockModalProps {
  visible: boolean;
  userId: string;
  userName: string;
  userAvatar?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  visible,
  userId,
  userName,
  userAvatar,
  onClose,
  onSuccess,
}) => {
  const [isBlocking, setIsBlocking] = useState(false);

  const handleBlock = useCallback(async () => {
    setIsBlocking(true);
    try {
      await usersService.blockUser(userId);

      onClose();
      onSuccess?.();

      Alert.alert(
        'User Blocked',
        `${userName} has been blocked. They won't be able to see your profile or interact with you.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to block user. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  }, [userId, userName, onClose, onSuccess]);

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="ban-outline" size={32} color={Colors.error} />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Avatar source={userAvatar} name={userName} size="lg" />
          <Text style={styles.userName}>{userName}</Text>
        </View>

        {/* Title and Message */}
        <Text style={styles.title}>Block {userName}?</Text>
        <Text style={styles.message}>
          They won't be able to:
        </Text>

        {/* Consequences List */}
        <View style={styles.consequences}>
          <View style={styles.consequenceItem}>
            <Ionicons name="close-circle" size={18} color={Colors.error} />
            <Text style={styles.consequenceText}>See your profile</Text>
          </View>
          <View style={styles.consequenceItem}>
            <Ionicons name="close-circle" size={18} color={Colors.error} />
            <Text style={styles.consequenceText}>Send you messages</Text>
          </View>
          <View style={styles.consequenceItem}>
            <Ionicons name="close-circle" size={18} color={Colors.error} />
            <Text style={styles.consequenceText}>Join activities you create</Text>
          </View>
        </View>

        <Text style={styles.note}>
          You can unblock them later from your settings.
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={styles.cancelButton}
          />
          <Button
            title="Block"
            onPress={handleBlock}
            loading={isBlocking}
            style={styles.blockButton}
            textStyle={styles.blockButtonText}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  userName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  consequences: {
    alignSelf: 'stretch',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  consequenceText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  note: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
  },
  blockButton: {
    flex: 1,
    backgroundColor: Colors.error,
  },
  blockButtonText: {
    color: Colors.surfaceLight,
  },
});

export default BlockModal;
