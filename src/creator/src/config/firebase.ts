/**
 * Firebase Admin SDK initialization
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let initialized = false;

export function initializeFirebase() {
  if (initialized) return;

  try {
    // IMPORTANT: Always use emulators in development to prevent accidental Google Cloud connections
    if (process.env.NODE_ENV !== 'production') {
      // Force emulator usage in development
      const projectId = process.env.FIREBASE_PROJECT_ID || 'the-law-shop-457607';
      const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
      
      // Set emulator host BEFORE initializing to ensure it's used
      process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
      
      console.log('Initializing Firebase in DEVELOPMENT mode');
      console.log('Using Firestore emulator:', emulatorHost);
      console.log('Project ID:', projectId);
      
      // Initialize with minimal config for emulator mode
      initializeApp({
        projectId: projectId,
      });
      
      console.log('Note: Ensure Firebase emulators are running with: firebase emulators:start');
    } else {
      // Production mode - only use in actual deployed environments
      console.log('Initializing Firebase in PRODUCTION mode');
      // Cloud Run automatically uses the service account credentials
      initializeApp();
    }
    
    initialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

export function getDb() {
  if (!initialized) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return getFirestore();
}

export const auth = {
  verifyIdToken: async (token: string) => {
    if (!initialized) {
      throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return getAuth().verifyIdToken(token);
  }
};
