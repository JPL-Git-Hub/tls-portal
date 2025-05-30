export interface Document {
  id: string;
  clientId: string;
  tenantId: string;
  
  // File information
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  
  // Metadata
  category: DocumentCategory;
  matterId?: string;
  description?: string;
  tags: string[];
  
  // Upload information
  uploadedBy: string; // user ID
  uploadedByType: 'client' | 'lawyer' | 'staff';
  uploadDate: Date;
  
  // Status
  status: 'processing' | 'active' | 'archived';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentCategory = 
  | 'contract'
  | 'correspondence'
  | 'court-filing'
  | 'evidence'
  | 'invoice'
  | 'identification'
  | 'other';

export interface DocumentUpload {
  file: File;
  category: DocumentCategory;
  matterId?: string;
  description?: string;
  tags?: string[];
}

export interface DocumentFilter {
  category?: DocumentCategory;
  matterId?: string;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
  uploadedByType?: 'client' | 'lawyer' | 'staff';
}

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
];

export const FILE_TYPE_EXTENSIONS: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'text/plain': ['.txt'],
};

// Max file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function getFileExtension(fileName: string): string {
  return fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
}

export function isAllowedFileType(file: File): boolean {
  return ALLOWED_FILE_TYPES.includes(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}