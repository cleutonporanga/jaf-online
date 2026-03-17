
"use client";

import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'administrador' | 'professor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (firebaseUser: FirebaseUser | null, role?: UserRole) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (firebaseUser, role = 'professor') => {
    if (firebaseUser) {
      set({
        user: {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          email: firebaseUser.email || '',
          role: role,
          avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/150/150`
        },
        isAuthenticated: true
      });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
