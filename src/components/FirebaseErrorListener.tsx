'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * Prevents total app crash in production while allowing debugging in development.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Log to console for persistent visibility
      console.error('[Firebase Permission Error]:', error.message);
      setError(error);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // Log fatal errors in console instead of throwing to prevent app-wide crashes
  if (error && process.env.NODE_ENV === 'development') {
    // We log but don't throw to avoid the generic Next.js error screen in production
    console.warn('Firestore Permission Error detected. Check console for details.');
  }

  return null;
}
