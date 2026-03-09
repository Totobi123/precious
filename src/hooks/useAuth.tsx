import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { api } from '@/integrations/superbase';

interface User {
  email: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  verifyOtp: (email: string, otp: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkSession = useCallback(async () => {
    const apiKey = localStorage.getItem('superbase_api_key');
    if (!apiKey) {
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // For Superbase, we can try to get the user's profile or just use the API key
      // If the key exists, we assume logged in for now, or check a 'me' endpoint if exists
      // Based on docs, we'll store email in localstorage too for UI
      const savedEmail = localStorage.getItem('user_email');
      if (savedEmail) {
        setUser({ email: savedEmail });
        // Hardcoded admin check based on your provided admin key for now, 
        // or check if email is admin@gmail.com
        setIsAdmin(savedEmail === 'admin@gmail.com' || savedEmail === 'admin@preciousnails.com');
      }
    } catch (err) {
      localStorage.removeItem('superbase_api_key');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.auth.login({ email, password });
      if (data.api_key) {
        localStorage.setItem('superbase_api_key', data.api_key);
        localStorage.setItem('user_email', email);
        setUser({ email });
        setIsAdmin(email === 'admin@gmail.com' || email === 'admin@preciousnails.com');
        return {};
      }
      return { error: { message: 'Login failed' } };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await api.auth.signup({ email, password });
      return {};
    } catch (error: any) {
      return { error };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      await api.auth.verifyOtp({ email, otp });
      return {};
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('superbase_api_key');
    localStorage.removeItem('user_email');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signUp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
