import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getSubdomain } from '../utils/subdomain';
import type { Client } from '@tls-portal/shared/src/types/client';
import LoadingSpinner from '../components/LoadingSpinner';

interface ClientContextType {
  client: Client | null;
  loading: boolean;
  error: string | null;
  isValidPortal: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}

interface ClientProviderProps {
  children: React.ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidPortal, setIsValidPortal] = useState(false);

  useEffect(() => {
    loadClientBySubdomain();
  }, []);

  const loadClientBySubdomain = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get subdomain from URL
      const subdomain = getSubdomain();
      
      if (!subdomain) {
        // Not a client portal - this is the main app
        setIsValidPortal(false);
        setLoading(false);
        return;
      }

      // Search for client with this subdomain across all tenants
      // In production, you might want to optimize this with a subdomain index
      const tenantsSnapshot = await getDocs(collection(db, 'tenants'));
      
      let foundClient: Client | null = null;
      
      for (const tenantDoc of tenantsSnapshot.docs) {
        const clientsRef = collection(db, 'tenants', tenantDoc.id, 'clients');
        const q = query(clientsRef, where('subdomain', '==', subdomain));
        const clientsSnapshot = await getDocs(q);
        
        if (!clientsSnapshot.empty) {
          const clientDoc = clientsSnapshot.docs[0];
          foundClient = {
            id: clientDoc.id,
            ...clientDoc.data()
          } as Client;
          break;
        }
      }

      if (!foundClient) {
        // Also check by portal URL as fallback
        for (const tenantDoc of tenantsSnapshot.docs) {
          const clientsRef = collection(db, 'tenants', tenantDoc.id, 'clients');
          const portalUrl = `https://${subdomain}.${window.location.host.replace(/^[^.]+\./, '')}`;
          const q = query(clientsRef, where('portalUrl', '==', portalUrl));
          const clientsSnapshot = await getDocs(q);
          
          if (!clientsSnapshot.empty) {
            const clientDoc = clientsSnapshot.docs[0];
            foundClient = {
              id: clientDoc.id,
              ...clientDoc.data()
            } as Client;
            break;
          }
        }
      }

      if (foundClient) {
        setClient(foundClient);
        setIsValidPortal(true);
      } else {
        setError('Invalid portal URL. Please check your access link.');
        setIsValidPortal(false);
      }
    } catch (err) {
      console.error('Error loading client:', err);
      setError('Failed to load portal. Please try again later.');
      setIsValidPortal(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking subdomain
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner fullScreen text="Loading portal..." />
      </div>
    );
  }

  // Show error if invalid portal
  if (error && getSubdomain()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Portal Access Error</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <p className="mt-4 text-xs text-gray-500">
              If you believe this is an error, please contact your attorney's office.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientContext.Provider value={{ client, loading, error, isValidPortal }}>
      {children}
    </ClientContext.Provider>
  );
}

// Hook to require a valid client portal
export function useRequireClientPortal() {
  const { client, isValidPortal } = useClient();
  
  useEffect(() => {
    if (!isValidPortal && !getSubdomain()) {
      // Not on a subdomain, redirect to main site
      window.location.href = '/';
    }
  }, [isValidPortal]);
  
  return { client, isValidPortal };
}