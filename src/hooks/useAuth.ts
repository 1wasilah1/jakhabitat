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
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  };

  const clearStorage = () => {
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  };

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.login(credentials);
      let user = response.user;
      
      // If user info is minimal, get full user info
      if (!user.username || !user.id) {
        user = await authService.getMe(response.accessToken);
      }
      
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

  const logout = useCallback(async () => {
    console.log('Logging out...');
    
    // Call logout API if we have an access token
    if (authState.accessToken) {
      try {
        await authService.logout(authState.accessToken);
      } catch (error) {
        console.warn('Logout API failed:', error);
      }
    }
    
    clearStorage();
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
    console.log('Logout completed');
  }, [authState.accessToken]);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
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
    const storedAccessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (storedAccessToken) {
      try {
        const user = await authService.getMe(storedAccessToken);
        
        setAuthState({
          user,
          accessToken: storedAccessToken,
          refreshToken: sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        clearStorage();
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    ...authState,
    authState,
    login,
    logout,
    refreshToken,
  };
};