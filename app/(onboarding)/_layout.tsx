/**
 * Onboarding Stack Layout
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="name" />
      <Stack.Screen name="location" />
      <Stack.Screen name="languages" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="bio" />
    </Stack>
  );
}
