import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { authService } from '../../services/auth.service';
import type { LoginPayload } from '../../types/auth/auth.payload';
import type { User } from '../../types/auth/auth.response';

const TOKEN_COOKIE_NAME = 'auth_token';
const USER_COOKIE_NAME = 'auth_user';
const COOKIE_EXPIRY_DAYS = 7;

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = Cookies.get(USER_COOKIE_NAME);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return Cookies.get(TOKEN_COOKIE_NAME) || null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(payload);
      
      if (response.success && response.token && response.user) {
        // Create user object with name from firstName and lastName
        const userData: User = {
          ...response.user,
          name: response.user.name || 
            (response.user.firstName && response.user.lastName 
              ? `${response.user.firstName} ${response.user.lastName}`.trim()
              : response.user.firstName || response.user.email),
          id: response.user.id || response.user._id || '',
        };
        
        // Save token to cookie with 7-day expiry
        Cookies.set(TOKEN_COOKIE_NAME, response.token, { 
          expires: COOKIE_EXPIRY_DAYS,
          sameSite: 'Lax'
        });
        
        // Store user info in cookie
        Cookies.set(USER_COOKIE_NAME, JSON.stringify(userData), { 
          expires: COOKIE_EXPIRY_DAYS,
          sameSite: 'Lax'
        });
        
        setToken(response.token);
        setUser(userData);
        
        // Navigate to home page after successful login
        navigate('/home');
        
        return true;
      } else {
        setError('Login failed. Please check your credentials.');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove(TOKEN_COOKIE_NAME);
    Cookies.remove(USER_COOKIE_NAME);
    setToken(null);
    setUser(null);
    
    // Navigate to login page after logout
    navigate('/');
  };

  return {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };
}
