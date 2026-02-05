/**
 * useLocation Hook
 * Location permissions and current location
 */

import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number;
  longitude: number;
  city?: string;
  countryCode?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);

  /**
   * Check location permissions
   */
  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (err) {
      setError('Failed to check location permission');
      return false;
    }
  }, []);

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (err) {
      setError('Failed to request location permission');
      return false;
    }
  }, []);

  /**
   * Get current location
   */
  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setError('Location permission denied');
          return null;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation: LocationState = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      // Try to get city name
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (geocode) {
          newLocation.city = geocode.city || geocode.subregion || geocode.region || undefined;
          newLocation.countryCode = geocode.isoCountryCode || undefined;
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed:', geocodeError);
      }

      setLocation(newLocation);
      return newLocation;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkPermission, requestPermission]);

  /**
   * Search for a location by address
   */
  const searchLocation = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await Location.geocodeAsync(address);
      if (results.length === 0) {
        setError('Location not found');
        return null;
      }

      const result = results[0];
      const newLocation: LocationState = {
        latitude: result.latitude,
        longitude: result.longitude,
      };

      // Get city name from the result
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: result.latitude,
          longitude: result.longitude,
        });

        if (geocode) {
          newLocation.city = geocode.city || geocode.subregion || geocode.region || undefined;
          newLocation.countryCode = geocode.isoCountryCode || undefined;
        }
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError);
      }

      return newLocation;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Location search failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    location,
    isLoading,
    error,
    permissionStatus,
    hasPermission: permissionStatus === 'granted',
    checkPermission,
    requestPermission,
    getCurrentLocation,
    searchLocation,
    setLocation,
    clearError: () => setError(null),
  };
};

export default useLocation;
