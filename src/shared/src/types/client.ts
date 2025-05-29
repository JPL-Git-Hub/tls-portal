/**
 * Client data types for the TLS Portal system
 */

export interface ClientProfile {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientMetadata {
  source: 'web_form' | 'admin_entry' | 'import';
  tags: string[];
  notes?: string;
}

export interface Client {
  id: string;
  tenantId: string;
  subdomain: string;
  profile: ClientProfile;
  metadata: ClientMetadata;
  status: 'active' | 'inactive' | 'archived';
  portalUrl: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export type CreateClientInput = Omit<
  Client,
  'id' | 'subdomain' | 'portalUrl' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'
>;

export type UpdateClientInput = Partial<
  Omit<Client, 'id' | 'tenantId' | 'subdomain' | 'createdAt' | 'createdBy'>
>;
