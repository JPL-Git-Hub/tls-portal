import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminPanel } from './AdminPanel';

export function AdminDashboard() {
  const { userRole, currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your law firm portal system
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {userRole}
              </span>
              <span className="text-sm text-gray-500">
                {currentUser?.email}
              </span>
            </div>
          </div>
          
          <AdminPanel />
        </div>
      </div>
    </div>
  );
}