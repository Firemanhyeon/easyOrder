import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'admin' | 'store_owner';
type User = { id: number; email: string; role: Role } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  setAuth: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (!token) { setUser(null); return; }
    const p = parseJwt(token);
    const r = p?.role;
    if (r !== 'admin' && r !== 'store_owner') { setUser(null); return; }
    setUser({ id: p?.id, email: p?.email, role: r });
  }, [token]);

  const setAuth = (t: string | null) => {
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
    setToken(t);
  };

  const logout = () => setAuth(null);

  const value = useMemo(() => ({ user, token, setAuth, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
