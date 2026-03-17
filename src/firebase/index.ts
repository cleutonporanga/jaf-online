
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Prioritize explicit config to avoid 'app/no-options' error on platforms like Vercel
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.warn('Firebase explicit initialization failed, attempting automatic fallback:', e);
      try {
        firebaseApp = initializeApp();
      } catch (innerError) {
        console.error('Firebase initialization completely failed:', innerError);
        throw innerError;
      }
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
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
