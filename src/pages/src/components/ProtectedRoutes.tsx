import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole, UserPermission } from '@tls-portal/shared';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: UserPermission;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requiredRole,
  requiredPermission,
  fallback 
}: ProtectedRouteProps) {
  const { currentUser, userRole, hasPermission, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && userRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(userRole)) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      requiredRole={['ADMIN', 'ATTORNEY', 'SUPERADMIN']} 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

export function AttorneyRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      requiredRole={['ATTORNEY', 'SUPERADMIN']} 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

export function SuperAdminRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      requiredRole="SUPERADMIN" 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

// Permission-based route protection
export function PermissionRoute({ 
  children, 
  permission, 
  fallback 
}: { 
  children: React.ReactNode; 
  permission: UserPermission; 
  fallback?: React.ReactNode;
}) {
  return (
    <ProtectedRoute 
      requiredPermission={permission} 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}