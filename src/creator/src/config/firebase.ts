/**
 * Firebase Admin SDK initialization
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let initialized = false;

export function initializeFirebase() {
  if (initialized) return;

  try {
    // In production, use default credentials from service account
    if (process.env.NODE_ENV === 'production') {
      // Cloud Run automatically uses the service account credentials
      initializeApp();
    } else {
      // In development, use project ID and connect to emulators if available
      const projectId = process.env.FIREBASE_PROJECT_ID || 'tls-portal-dev';
      
      // Initialize with projectId only - this works for emulator mode
      initializeApp({
        projectId: projectId,
      });
      
      // Set up emulator connection
      if (process.env.FIRESTORE_EMULATOR_HOST || process.env.USE_EMULATOR === 'true') {
        // For development without emulators running, we need to handle this gracefully
        const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
        process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
        console.log('Configured for Firestore emulator:', emulatorHost);
        console.log('Note: Ensure Firebase emulators are running or remove USE_EMULATOR from .env');
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
