/**
 * Firebase Admin SDK initialization
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let initialized = false;

export function initializeFirebase() {
  if (initialized) return;

  try {
    // In production/staging, use default credentials from service account
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
      // Cloud Run automatically uses the service account credentials
      initializeApp();
    } else {
      // In development, use project ID and connect to emulators if available
      const projectId = process.env.FIREBASE_PROJECT_ID || 'tls-portal-dev';
      
      initializeApp({
        projectId,
      });
      
      // Connect to emulators if available
      if (process.env.FIRESTORE_EMULATOR_HOST) {
        console.log('Using Firestore emulator:', process.env.FIRESTORE_EMULATOR_HOST);
      }
    }
    
    initialized = true;
    console.log('Firebase Admin SDK initialized');
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
