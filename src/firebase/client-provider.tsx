'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Ensures Firebase is initialized on the client side and manages the 
 * lifecycle of Firebase service instances.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Initial state might be nulls during SSR
  const [services, setServices] = useState(() => initializeFirebase());

  useEffect(() => {
    // Once the component mounts on the client, window is guaranteed to be defined.
    // We re-initialize to get real service instances and trigger a re-render.
    const initializedServices = initializeFirebase();
    setServices(initializedServices);
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
