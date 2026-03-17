'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

/**
 * Initializes the Firebase services only in the browser environment.
 * Uses a singleton pattern to ensure only one instance of each service exists.
 */
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    try {
      if (!getApps().length) {
        appInstance = initializeApp(firebaseConfig);
      } else {
        appInstance = getApp();
      }
      
      if (!authInstance) authInstance = getAuth(appInstance);
      if (!dbInstance) dbInstance = getFirestore(appInstance);
      
      return { 
        firebaseApp: appInstance, 
        auth: authInstance, 
        firestore: dbInstance 
      };
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
  }

  return {
    firebaseApp: null as any,
    auth: null as any,
    firestore: null as any
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
