/**
 * Modal Component
 * Reusable modal with backdrop
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Layout } from '../../constants/spacing';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'center' | 'bottom';
  dismissOnBackdrop?: boolean;
  style?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  position = 'center',
  dismissOnBackdrop = true,
  style,
}) => {
  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[
              styles.container,
              position === 'bottom' && styles.bottomContainer,
            ]}
          >
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.content,
                  position === 'bottom' && styles.bottomContent,
                  style,
                ]}
              >
                {position === 'bottom' && <View style={styles.handle} />}
                {children}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

// Confirmation dialog preset
interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
}) => {
  const { Text } = require('react-native');
  const { Button } = require('./Button');

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.dialog}>
        <Text style={styles.dialogTitle}>{title}</Text>
        <Text style={styles.dialogMessage}>{message}</Text>
        <View style={styles.dialogButtons}>
          <Button
            title={cancelText}
            variant="ghost"
            onPress={onClose}
            style={styles.dialogButton}
          />
          <Button
            title={confirmText}
            variant={destructive ? 'primary' : 'primary'}
            onPress={() => {
              onConfirm();
              onClose();
            }}
            style={[
              styles.dialogButton,
              destructive && styles.destructiveButton,
            ]}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    padding: 0,
  },
  content: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  bottomContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: Spacing['3xl'],
    maxWidth: '100%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },

  // Dialog styles
  dialog: {
    alignItems: 'center',
  },
  dialogTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  dialogMessage: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  dialogButton: {
    flex: 1,
  },
  destructiveButton: {
    backgroundColor: Colors.error,
  },
});

export default Modal;
