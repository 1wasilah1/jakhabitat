import { LoginRequest, LoginResponse, AuthMeRequest, RefreshTokenRequest, User } from '@/types/auth';

const API_BASE = 'https://dprkp.jakarta.go.id/api/sso/v1';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Login failed');
    }

    return {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      user: result.data.user
    };
  }

  async getMe(accessToken: string, appId: number = 1): Promise<User> {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      mode: 'cors',
      body: JSON.stringify({ app_id: appId }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to get user info');
    }

    return {
      id: result.data.id,
      username: result.data.username,
      name: result.data.name || result.data.username,
      email: result.data.email,
      role: result.data.role
    };
  }

  async logout(accessToken: string, appId: number = 9): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      mode: 'cors',
      body: JSON.stringify({ app_id: appId }),
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Logout failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Token refresh failed');
      }

      // Refresh token response doesn't return new tokens, just sets cookies
      // Return existing tokens to maintain session
      return {
        accessToken: refreshToken, // Keep existing for now
        refreshToken: refreshToken,
        user: null // Will be fetched separately
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to authentication server');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();