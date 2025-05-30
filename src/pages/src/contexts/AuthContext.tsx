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
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useClient } from './ClientContext';
import type { Client } from '@tls-portal/shared';

interface AuthContextType {
  currentUser: User | null;
  clientData: Client | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, clientId?: string) => Promise<void>;
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
  
  // Get client from subdomain context
  const { client: subdomainClient, isValidPortal } = useClient();

  // Fetch client data when user is authenticated
  async function fetchClientData(user: User) {
    try {
      // If we're on a client subdomain, use that client
      if (subdomainClient && isValidPortal) {
        // Verify the user belongs to this client
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.clientId === subdomainClient.id) {
            setClientData(subdomainClient);
            return;
          } else {
            // User doesn't belong to this client portal
            throw new Error('Access denied to this portal');
          }
        }
      } else {
        // Not on a subdomain - fetch client from user's claims or user doc
        const idToken = await user.getIdTokenResult();
        const clientId = idToken.claims.clientId as string || user.displayName;
        
        if (clientId) {
          // Search for client across all tenants
          const tenantsSnapshot = await getDocs(collection(db, 'tenants'));
          
          for (const tenantDoc of tenantsSnapshot.docs) {
            const clientDoc = await getDoc(
              doc(db, 'tenants', tenantDoc.id, 'clients', clientId)
            );
            
            if (clientDoc.exists()) {
              setClientData({ id: clientDoc.id, ...clientDoc.data() } as Client);
              return;
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load client data');
      // Log out if user doesn't have access
      if (err instanceof Error && err.message.includes('Access denied')) {
        await signOut(auth);
      }
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
  }, [subdomainClient, isValidPortal]);

  // Login function
  async function login(email: string, password: string) {
    try {
      setError(null);
      
      // If on a client portal, verify the email belongs to this client
      if (subdomainClient && isValidPortal) {
        // Check if email is authorized for this client
        const authorizedEmails = [
          subdomainClient.profile.email,
          ...(subdomainClient.authorizedUsers || [])
        ];
        
        if (!authorizedEmails.includes(email)) {
          throw new Error('This email is not authorized for this portal');
        }
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      await fetchClientData(result.user);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  }

  // Register function (for first-time portal access)
  async function register(email: string, password: string, clientId?: string) {
    try {
      setError(null);
      
      // Determine which client this registration is for
      const targetClientId = clientId || subdomainClient?.id;
      
      if (!targetClientId) {
        throw new Error('Unable to determine client for registration');
      }
      
      // Create the auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store the client ID reference in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        clientId: targetClientId,
        email,
        createdAt: new Date(),
      });
      
      // Update the user's display name with client ID for now
      await updateProfile(result.user, {
        displayName: targetClientId
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

  const value = {
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
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}