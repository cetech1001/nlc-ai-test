import { useState, useEffect, useCallback } from 'react';
import { NotificationPreferences, UpdatePreferencesRequest } from '@nlc-ai/sdk-notifications';
import {NLCClient} from "@nlc-ai/sdk-main";
// import {sdkClient} from "../sdk-client";

export const useNotificationPreferences = (sdkClient: NLCClient) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const prefs = await sdkClient.notifications.getPreferences();
      setPreferences(prefs);

      return prefs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preferences';
      setError(errorMessage);
      console.error('Error fetching preferences:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (updates: UpdatePreferencesRequest) => {
    try {
      setLoading(true);
      setError(null);

      const updatedPrefs = await sdkClient.notifications.updatePreferences(updates);
      setPreferences(updatedPrefs);

      return updatedPrefs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      console.error('Error updating preferences:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
  };
};
