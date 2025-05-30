import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClient } from '../contexts/ClientContext';
import LoadingSpinner from './LoadingSpinner';
import { useState } from 'react';
import { isClientPortal } from '../utils/subdomain';

export default function DashboardLayout() {
  const { currentUser, clientData, logout } = useAuth();
  const { client } = useClient();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isPortal = isClientPortal();

  // Use appropriate route prefix based on context
  const routePrefix = isPortal ? '' : '/portal';

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate(`${routePrefix}/login`);
    } catch (error) {
      console.error('Failed to log out:', error);
      setIsLoggingOut(false);
    }
  }

  if (!currentUser || !clientData) {
    return <LoadingSpinner fullScreen text="Loading your portal..." />;
  }

  // Display client-specific branding when on subdomain
  const portalTitle = isPortal && client ? 
    `${client.profile.firstName} ${client.profile.lastName}'s Portal` : 
    'Client Portal';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">{portalTitle}</h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link
                  to={`${routePrefix}/dashboard`}
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to={`${routePrefix}/documents`}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Documents
                </Link>
                <Link
                  to={`${routePrefix}/messages`}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Messages
                </Link>
                <Link
                  to={`${routePrefix}/billing`}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Billing
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {clientData.profile.firstName}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      <div className="sm:hidden bg-white border-b">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to={`${routePrefix}/dashboard`}
            className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          >
            Dashboard
          </Link>
          <Link
            to={`${routePrefix}/documents`}
            className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          >
            Documents
          </Link>
          <Link
            to={`${routePrefix}/messages`}
            className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          >
            Messages
          </Link>
          <Link
            to={`${routePrefix}/billing`}
            className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          >
            Billing
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}