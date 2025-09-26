'use client';

import { useState, useEffect } from 'react';
import { UserType } from "@nlc-ai/types";
import { authAPI } from "../api";
import type { LoginResponse } from "../types";

interface AuthState {
  user: LoginResponse['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (userType?: UserType) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuthStatus(userType);
  }, [userType]);

  const checkAuthStatus = async (userType?: UserType) => {
    try {
      if (!authState.isLoading) {
        setAuthState(prevState => ({
          ...prevState,
          isLoading: true,
        }));
      }

      if (!authAPI.hasToken()) {
        throw new Error('No token found');
      }

      const user = await authAPI.getProfile();

      if (userType) {
        if ((user.type && user.type !== userType) || (!user.type && userType === UserType.ADMIN)) {
          throw new Error('Unauthorized user type');
        }
      }

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      // Clear any stale tokens
      authAPI.removeToken();
    }
  };

  const login = async (
    email: string,
    password: string,
    userType: UserType,
    rememberMe?: boolean,
  ) => {
    try {
      const response = await authAPI.login(email, password, userType, rememberMe);
      setAuthState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const refreshProfile = async () => {
    if (authState.isAuthenticated) {
      try {
        const user = await authAPI.getProfile();
        setAuthState(prevState => ({
          ...prevState,
          user,
        }));
      } catch (error) {
        console.error('Failed to refresh profile:', error);
        await logout();
      }
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
    refreshProfile,
  };
};
