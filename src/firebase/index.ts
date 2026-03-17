
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes the Firebase services only in the browser environment.
 * This prevents "app/no-options" errors during Next.js server-side rendering/pre-rendering.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    // Return placeholder services for SSR - they won't be used as hooks are client-only
    return {
      firebaseApp: null as any,
      auth: null as any,
      firestore: null as any
    };
  }

  let firebaseApp: FirebaseApp;

  // Check if Firebase is already initialized or if config is available
  const hasConfig = !!firebaseConfig.apiKey;

  if (!getApps().length) {
    try {
      if (!hasConfig) {
        console.warn('Firebase: configuration is missing. Services will be unavailable.');
        return {
          firebaseApp: null as any,
          auth: null as any,
          firestore: null as any
        };
      }
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Firebase initialization failed:', e);
      return {
        firebaseApp: null as any,
        auth: null as any,
        firestore: null as any
      };
    }
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  if (!firebaseApp) return { firebaseApp: null as any, auth: null as any, firestore: null as any };
  
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
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
