/**
 * Create Activity Screen
 * Form to create a new activity
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useActivities } from '../../src/hooks/useActivities';
import { useLocation } from '../../src/hooks/useLocation';
import { Colors } from '../../src/constants/colors';
import { FontFamily, FontSize } from '../../src/constants/typography';
import { Spacing, BorderRadius, IconSize } from '../../src/constants/spacing';

interface FormData {
  title: string;
  description: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  scheduledAt: Date;
  maxParticipants: number;
}

export default function CreateActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createActivity, isLoading } = useActivities();
  const { getCurrentLocation, location } = useLocation();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    locationName: '',
    latitude: null,
    longitude: null,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    maxParticipants: 6,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleUseCurrentLocation = useCallback(async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setFormData((prev) => ({
        ...prev,
        locationName: loc.city ? `${loc.city}, ${loc.countryCode || ''}` : 'Current Location',
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
    }
  }, [getCurrentLocation]);

  const handleDateChange = useCallback((_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => {
        const newDate = new Date(prev.scheduledAt);
        newDate.setFullYear(selectedDate.getFullYear());
        newDate.setMonth(selectedDate.getMonth());
        newDate.setDate(selectedDate.getDate());
        return { ...prev, scheduledAt: newDate };
      });
    }
  }, []);

  const handleTimeChange = useCallback((_event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormData((prev) => {
        const newDate = new Date(prev.scheduledAt);
        newDate.setHours(selectedTime.getHours());
        newDate.setMinutes(selectedTime.getMinutes());
        return { ...prev, scheduledAt: newDate };
      });
    }
  }, []);

  const adjustParticipants = useCallback((delta: number) => {
    setFormData((prev) => ({
      ...prev,
      maxParticipants: Math.max(2, Math.min(8, prev.maxParticipants + delta)),
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.locationName.trim()) {
      newErrors.locationName = 'Location is required';
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.locationName = 'Please use current location or enter a valid location';
    }

    if (formData.scheduledAt <= new Date()) {
      newErrors.scheduledAt = 'Activity must be scheduled in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const activity = await createActivity({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        locationName: formData.locationName.trim(),
        latitude: formData.latitude!,
        longitude: formData.longitude!,
        scheduledAt: formData.scheduledAt.toISOString(),
        maxParticipants: formData.maxParticipants,
      });

      router.replace(`/activity/${activity.id}`);
    } catch (err: any) {
      const message = err?.message || 'Failed to create activity. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate, createActivity, router]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={IconSize.md} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Activity</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.inputGroup}>
            <Input
              label="Title"
              placeholder="e.g., Morning coffee meetup"
              value={formData.title}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, title: text }));
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              error={errors.title}
              maxLength={100}
            />
            <Text style={styles.charCount}>{formData.title.length}/100</Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Input
              label="Description (optional)"
              placeholder="Tell people what to expect..."
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity
              style={[styles.locationPicker, errors.locationName && styles.locationPickerError]}
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="location-outline" size={IconSize.md} color={Colors.primary} />
              <Text
                style={[
                  styles.locationText,
                  !formData.locationName && styles.locationPlaceholder,
                ]}
              >
                {formData.locationName || 'Tap to use current location'}
              </Text>
              <Ionicons name="navigate" size={IconSize.sm} color={Colors.textMuted} />
            </TouchableOpacity>
            {errors.locationName && (
              <Text style={styles.errorText}>{errors.locationName}</Text>
            )}
          </View>

          {/* Date & Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date & Time</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={IconSize.sm} color={Colors.primary} />
                <Text style={styles.dateTimeText}>{formatDate(formData.scheduledAt)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={IconSize.sm} color={Colors.primary} />
                <Text style={styles.dateTimeText}>{formatTime(formData.scheduledAt)}</Text>
              </TouchableOpacity>
            </View>
            {errors.scheduledAt && (
              <Text style={styles.errorText}>{errors.scheduledAt}</Text>
            )}
          </View>

          {/* Max Participants */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Participants</Text>
            <Card style={styles.participantsCard}>
              <View style={styles.participantsRow}>
                <TouchableOpacity
                  style={[
                    styles.participantButton,
                    formData.maxParticipants <= 2 && styles.participantButtonDisabled,
                  ]}
                  onPress={() => adjustParticipants(-1)}
                  disabled={formData.maxParticipants <= 2}
                >
                  <Ionicons
                    name="remove"
                    size={IconSize.md}
                    color={formData.maxParticipants <= 2 ? Colors.gray300 : Colors.textPrimary}
                  />
                </TouchableOpacity>
                <View style={styles.participantValue}>
                  <Text style={styles.participantNumber}>{formData.maxParticipants}</Text>
                  <Text style={styles.participantLabel}>people</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.participantButton,
                    formData.maxParticipants >= 8 && styles.participantButtonDisabled,
                  ]}
                  onPress={() => adjustParticipants(1)}
                  disabled={formData.maxParticipants >= 8}
                >
                  <Ionicons
                    name="add"
                    size={IconSize.md}
                    color={formData.maxParticipants >= 8 ? Colors.gray300 : Colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            </Card>
            <Text style={styles.hint}>Including yourself (2-8 people)</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + Spacing.base }]}>
        <Button
          title="Create Activity"
          onPress={handleSubmit}
          size="lg"
          loading={isSubmitting}
        />
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.scheduledAt}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={formData.scheduledAt}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
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
  closeButton: {
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  charCount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  locationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationPickerError: {
    borderColor: Colors.error,
    backgroundColor: Colors.surfaceLight,
  },
  locationText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  locationPlaceholder: {
    color: Colors.textMuted,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.base,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 48,
    gap: Spacing.sm,
  },
  dateTimeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  participantsCard: {
    padding: Spacing.base,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantButtonDisabled: {
    opacity: 0.5,
  },
  participantValue: {
    alignItems: 'center',
  },
  participantNumber: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
  },
  participantLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  bottomActions: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    backgroundColor: Colors.surfaceLight,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});
