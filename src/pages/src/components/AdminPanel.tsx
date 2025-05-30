import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, Permission, UserRole } from '@tls-portal/shared';

export const AdminPanel: React.FC = () => {
  const { user, currentUser } = useAuth();

  // Only show for superadmin or attorney roles
  if (!user || ![UserRole.SUPERADMIN, UserRole.ATTORNEY].includes(user.role)) {
    return null;
  }

  const isSuperAdmin = user.role === UserRole.SUPERADMIN;
  const isJosephLeon = currentUser?.email === 'josephleon@thelawshop.com';

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm bg-blue-600 px-2 py-1 rounded">
            {user.role}
          </span>
          {isJosephLeon && (
            <span className="text-sm bg-purple-600 px-2 py-1 rounded">
              Founder
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Superadmin Controls */}
        {isSuperAdmin && (
          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-semibold mb-2">System Controls</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/admin/tenants" className="hover:text-blue-400">
                  Manage Tenants
                </a>
              </li>
              <li>
                <a href="/admin/system" className="hover:text-blue-400">
                  System Settings
                </a>
              </li>
              <li>
                <a href="/admin/logs" className="hover:text-blue-400">
                  Audit Logs
                </a>
              </li>
            </ul>
          </div>
        )}

        {/* Attorney Controls */}
        {hasPermission(user, Permission.MANAGE_CLIENTS) && (
          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-semibold mb-2">Firm Management</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/admin/clients" className="hover:text-blue-400">
                  All Clients
                </a>
              </li>
              <li>
                <a href="/admin/matters" className="hover:text-blue-400">
                  All Matters
                </a>
              </li>
              <li>
                <a href="/admin/billing" className="hover:text-blue-400">
                  Billing Overview
                </a>
              </li>
            </ul>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-700 p-4 rounded">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">
              Create New Client
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm">
              Generate Invoice
            </button>
            {isSuperAdmin && (
              <button className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm">
                Deploy Update
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Switcher for Joseph */}
      {isJosephLeon && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className="text-sm text-gray-400 mb-2">Switch Account:</p>
          <div className="flex space-x-4">
            <button 
              className="text-sm hover:text-blue-400"
              onClick={() => {/* Implement account switching */}}
            >
              josephleon@ (Superadmin)
            </button>
            <button 
              className="text-sm hover:text-blue-400"
              onClick={() => {/* Implement account switching */}}
            >
              joe.leon@ (Attorney)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};