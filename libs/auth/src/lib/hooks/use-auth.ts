'use client';

import { useState, useEffect } from 'react';
import {LoginResponse} from "../types";
import {authAPI} from "../api";
import {AUTH_USER_TYPE, USER_TYPE} from "@nlc-ai/types";

interface AuthState {
  user: LoginResponse['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (role?: AUTH_USER_TYPE) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuthStatus(role);
  }, [role]);

  const checkAuthStatus = async (role?: AUTH_USER_TYPE) => {
    try {
      if (!authState.isLoading) {
        setAuthState(prevState => ({
          ...prevState,
          isLoading: true,
        }));
      }
      const user = await authAPI.getProfile();

      if (role) {
        if ((user.role && user.role !== role) || (!user.role && role === USER_TYPE.admin)) {
          throw new Error('Unauthorised');
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
      await authAPI.logout();
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe?: boolean,
    userType?: AUTH_USER_TYPE
  ) => {
    try {
      const response = await authAPI.login(email, password, rememberMe, userType);
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

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
  };
};
