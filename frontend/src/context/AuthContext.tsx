import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authApi } from '../api/authApi';

interface AuthContextType {
  token: string | null;
  storeId: string | null;
  isAuthenticated: boolean;
  login: (storeId: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'table-order-admin-token';
const STORE_KEY = 'table-order-admin-store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [storeId, setStoreId] = useState<string | null>(() => localStorage.getItem(STORE_KEY));

  const login = useCallback(async (sid: string, username: string, password: string) => {
    const result = await authApi.login(sid, username, password);
    setToken(result.token);
    setStoreId(result.storeId);
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(STORE_KEY, result.storeId);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setStoreId(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ token, storeId, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
