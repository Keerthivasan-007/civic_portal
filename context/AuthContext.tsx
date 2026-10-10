"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type Role = 'PUBLIC' | 'AUTHORITY' | 'UTILITY_WORKER';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  department_id?: number;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem('road_memory_user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else if (pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('road_memory_user', JSON.stringify(userData));
    router.push('/');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('road_memory_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
