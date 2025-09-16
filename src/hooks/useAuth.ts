import { useState, useEffect, useCallback } from 'react';
import { AuthState, LoginRequest, User } from '@/types/auth';
import { authService } from '@/services/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'jakhabitat_access_token',
  REFRESH_TOKEN: 'jakhabitat_refresh_token',
  USER: 'jakhabitat_user',
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const saveToStorage = (accessToken: string, refreshToken: string, user: User) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  };

  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.login(credentials);
      const user = await authService.getMe(response.accessToken);
      
      saveToStorage(response.accessToken, response.refreshToken, user);
      
      setAuthState({
        user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!storedRefreshToken) return false;

    try {
      const response = await authService.refreshToken(storedRefreshToken);
      const user = await authService.getMe(response.accessToken);
      
      saveToStorage(response.accessToken, response.refreshToken, user);
      
      setAuthState({
        user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }, [logout]);

  const initializeAuth = useCallback(async () => {
    const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedAccessToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        await authService.getMe(storedAccessToken);
        
        setAuthState({
          user,
          accessToken: storedAccessToken,
          refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshToken]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    ...authState,
    login,
    logout,
    refreshToken,
  };
};