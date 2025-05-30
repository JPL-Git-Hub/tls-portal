export interface User {
  id: string;
  email: string;
  displayName?: string;
  clientId?: string;
  tenantId?: string;
  role: UserRole;
  permissions?: Permission[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export enum UserRole {
  SUPERADMIN = 'superadmin',  // Full system access (you)
  ATTORNEY = 'attorney',      // Attorney access (also you)
  ADMIN = 'admin',           // Firm admin/staff
  CLIENT = 'client',         // Client users
  GUEST = 'guest'            // Limited access
}

export enum Permission {
  // System permissions
  MANAGE_SYSTEM = 'manage_system',
  MANAGE_TENANTS = 'manage_tenants',
  
  // Firm permissions
  MANAGE_FIRM = 'manage_firm',
  MANAGE_ATTORNEYS = 'manage_attorneys',
  MANAGE_CLIENTS = 'manage_clients',
  MANAGE_BILLING = 'manage_billing',
  
  // Client permissions
  VIEW_DOCUMENTS = 'view_documents',
  UPLOAD_DOCUMENTS = 'upload_documents',
  VIEW_INVOICES = 'view_invoices',
  PAY_INVOICES = 'pay_invoices',
  
  // Matter permissions
  VIEW_ALL_MATTERS = 'view_all_matters',
  VIEW_OWN_MATTERS = 'view_own_matters',
  EDIT_MATTERS = 'edit_matters',
  
  // Communication
  SEND_MESSAGES = 'send_messages',
  VIEW_MESSAGES = 'view_messages'
}

// Role-based permission defaults
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPERADMIN]: [
    // All permissions
    ...Object.values(Permission)
  ],
  [UserRole.ATTORNEY]: [
    Permission.MANAGE_FIRM,
    Permission.MANAGE_CLIENTS,
    Permission.MANAGE_BILLING,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_INVOICES,
    Permission.VIEW_ALL_MATTERS,
    Permission.EDIT_MATTERS,
    Permission.SEND_MESSAGES,
    Permission.VIEW_MESSAGES
  ],
  [UserRole.ADMIN]: [
    Permission.MANAGE_CLIENTS,
    Permission.MANAGE_BILLING,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_INVOICES,
    Permission.VIEW_ALL_MATTERS,
    Permission.SEND_MESSAGES,
    Permission.VIEW_MESSAGES
  ],
  [UserRole.CLIENT]: [
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_INVOICES,
    Permission.PAY_INVOICES,
    Permission.VIEW_OWN_MATTERS,
    Permission.SEND_MESSAGES,
    Permission.VIEW_MESSAGES
  ],
  [UserRole.GUEST]: [
    Permission.VIEW_DOCUMENTS,
    Permission.VIEW_OWN_MATTERS
  ]
};

// Helper function to check permissions
export function hasPermission(user: User, permission: Permission): boolean {
  // Superadmin always has permission
  if (user.role === UserRole.SUPERADMIN) return true;
  
  // Check explicit permissions first
  if (user.permissions?.includes(permission)) return true;
  
  // Check role-based permissions
  return rolePermissions[user.role]?.includes(permission) || false;
}

// Helper to check if user can access client data
export function canAccessClient(user: User, clientId: string): boolean {
  // Superadmin and attorney can access all clients
  if ([UserRole.SUPERADMIN, UserRole.ATTORNEY].includes(user.role)) return true;
  
  // Admin can access all clients in their tenant
  if (user.role === UserRole.ADMIN) return true;
  
  // Clients can only access their own data
  return user.role === UserRole.CLIENT && user.clientId === clientId;
}