import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Client } from '@tls-portal/shared';

interface AuthContextType {
  currentUser: User | null;
  clientData: Client | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, clientId: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch client data when user is authenticated
  async function fetchClientData(user: User) {
    try {
      // Get client ID from user's custom claims or metadata
      const idToken = await user.getIdTokenResult();
      const clientId = idToken.claims.clientId as string;
      
      if (clientId) {
        // For now, we'll use a simple tenant structure
        const tenantId = 'default-tenant';
        const clientDoc = await getDoc(
          doc(db, 'tenants', tenantId, 'clients', clientId)
        );
        
        if (clientDoc.exists()) {
          setClientData({ id: clientDoc.id, ...clientDoc.data() } as Client);
        }
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
    }
  }

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchClientData(user);
      } else {
        setClientData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login function
  async function login(email: string, password: string) {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await fetchClientData(result.user);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  }

  // Register function (for first-time portal access)
  async function register(email: string, password: string, clientId: string) {
    try {
      setError(null);
      
      // Create the auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store the client ID reference in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        clientId,
        email,
        createdAt: new Date(),
      });
      
      // Update the user's display name with client ID for now
      await updateProfile(result.user, {
        displayName: clientId
      });
      
      await fetchClientData(result.user);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  }

  // Logout function
  async function logout() {
    try {
      await signOut(auth);
      setClientData(null);
    } catch (err: any) {
      setError('Failed to log out');
      throw err;
    }
  }

  // Password reset
  async function resetPassword(email: string) {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  }

  // Clear error
  function clearError() {
    setError(null);
  }

  const value: AuthContextType = {
    currentUser,
    clientData,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    default:
      return 'An error occurred. Please try again';
  }
}