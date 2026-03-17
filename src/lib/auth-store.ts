
"use client";

import { create } from 'zustand';

export type UserRole = 'admin' | 'professor';

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
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

// Since we can't use real Firebase in this environment, we mock it.
// In a real app, this would interact with Firebase Auth and Firestore.
export const useAuth = create<AuthState>((set) => ({
  user: {
    id: 'u1',
    name: 'Ana Silva',
    email: 'ana.silva@scholarview.edu',
    role: 'professor',
    avatar: 'https://picsum.photos/seed/teacher/150/150'
  },
  isAuthenticated: true,
  login: (email, role) => set({ 
    user: { 
      id: Math.random().toString(), 
      name: email.split('@')[0], 
      email, 
      role,
      avatar: `https://picsum.photos/seed/${role}/150/150`
    }, 
    isAuthenticated: true 
  }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
