'use client';

import { FC, createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {UserType} from "@nlc-ai/types";
import {authAPI} from "@nlc-ai/web-auth";

import { SettingsContextType } from '../types/settings.types';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  userType: UserType;
  getProfile: () => Promise<any>;
}

export const SettingsProvider: FC<SettingsProviderProps> = ({
  children,
  userType,
}) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (() => refreshProfile())();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [error]);

  const value: SettingsContextType = {
    user,
    userType,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
    refreshProfile,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
