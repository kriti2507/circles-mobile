/**
 * ReportModal Component
 * Modal for reporting users, messages, or content
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { usersService } from '../../services/users';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, BorderRadius, IconSize } from '../../constants/spacing';

type ReportReason = 'harassment' | 'spam' | 'inappropriate' | 'no_show' | 'other';

interface ReportOption {
  value: ReportReason;
  label: string;
  icon: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  { value: 'harassment', label: 'Harassment', icon: 'warning-outline' },
  { value: 'spam', label: 'Spam', icon: 'mail-unread-outline' },
  { value: 'inappropriate', label: 'Inappropriate content', icon: 'alert-circle-outline' },
  { value: 'no_show', label: 'No show', icon: 'time-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

interface ReportModalProps {
  visible: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  userId,
  userName,
  onClose,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    setSelectedReason(null);
    setDetails('');
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for your report.');
      return;
    }

    setIsSubmitting(true);
    try {
      await usersService.reportUser(userId, {
        reason: selectedReason,
        details: details.trim() || undefined,
      });

      handleClose();
      onSuccess?.();

      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep Circles safe. We will review your report.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedReason, details, userId, handleClose, onSuccess]);

  return (
    <Modal visible={visible} onClose={handleClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Report {userName}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={IconSize.md} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Reason Selection */}
          <Text style={styles.sectionTitle}>What's the issue?</Text>
          <View style={styles.optionsList}>
            {REPORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  selectedReason === option.value && styles.optionSelected,
                ]}
                onPress={() => setSelectedReason(option.value)}
              >
                <View
                  style={[
                    styles.optionIcon,
                    selectedReason === option.value && styles.optionIconSelected,
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={IconSize.sm}
                    color={
                      selectedReason === option.value
                        ? Colors.surfaceLight
                        : Colors.textMuted
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedReason === option.value && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedReason === option.value && (
                  <Ionicons name="checkmark" size={IconSize.sm} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Details Input */}
          <Text style={styles.sectionTitle}>Additional details (optional)</Text>
          <TextInput
            style={styles.detailsInput}
            placeholder="Tell us more about what happened..."
            placeholderTextColor={Colors.textMuted}
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{details.length}/500</Text>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title="Submit Report"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!selectedReason}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  optionsList: {
    marginBottom: Spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: Colors.primaryTransparent10,
    borderColor: Colors.primary,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionIconSelected: {
    backgroundColor: Colors.primary,
  },
  optionLabel: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  optionLabelSelected: {
    color: Colors.primary,
  },
  detailsInput: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    minHeight: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  charCount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
});

export default ReportModal;
