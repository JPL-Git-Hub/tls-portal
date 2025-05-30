import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  UploadTask 
} from 'firebase/storage';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  deleteDoc 
} from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import type { Document, DocumentUpload, DocumentFilter } from '../types/document';
import { v4 as uuidv4 } from 'uuid';

export class DocumentService {
  private tenantId: string;
  private clientId: string;
  private userId: string;

  constructor(tenantId: string, clientId: string, userId: string) {
    this.tenantId = tenantId;
    this.clientId = clientId;
    this.userId = userId;
  }

  // Upload a document with progress tracking
  async uploadDocument(
    upload: DocumentUpload,
    onProgress?: (progress: number) => void
  ): Promise<Document> {
    const documentId = uuidv4();
    const timestamp = new Date();
    
    // Create storage path: tenants/{tenantId}/clients/{clientId}/documents/{documentId}/{filename}
    const storagePath = `tenants/${this.tenantId}/clients/${this.clientId}/documents/${documentId}/${upload.file.name}`;
    const storageRef = ref(storage, storagePath);
    
    // Start upload
    const uploadTask = uploadBytesResumable(storageRef, upload.file);
    
    // Track progress
    if (onProgress) {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        }
      );
    }
    
    // Wait for upload to complete
    await uploadTask;
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Create document metadata
    const documentData: Omit<Document, 'id'> = {
      clientId: this.clientId,
      tenantId: this.tenantId,
      fileName: upload.file.name,
      fileSize: upload.file.size,
      fileType: upload.file.type,
      fileUrl: downloadURL,
      category: upload.category,
      matterId: upload.matterId,
      description: upload.description || '',
      tags: upload.tags || [],
      uploadedBy: this.userId,
      uploadedByType: 'client', // For now, assuming client upload
      uploadDate: timestamp,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    // Save metadata to Firestore
    const docRef = doc(
      db, 
      'tenants', 
      this.tenantId, 
      'clients', 
      this.clientId, 
      'documents', 
      documentId
    );
    
    await setDoc(docRef, {
      ...documentData,
      uploadDate: Timestamp.fromDate(documentData.uploadDate),
      createdAt: Timestamp.fromDate(documentData.createdAt),
      updatedAt: Timestamp.fromDate(documentData.updatedAt),
    });
    
    return {
      id: documentId,
      ...documentData,
    };
  }

  // Get all documents for the client
  async getDocuments(filter?: DocumentFilter): Promise<Document[]> {
    const docsCollection = collection(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'documents'
    );
    
    let q = query(docsCollection, orderBy('uploadDate', 'desc'));
    
    // Apply filters
    if (filter?.category) {
      q = query(q, where('category', '==', filter.category));
    }
    
    if (filter?.matterId) {
      q = query(q, where('matterId', '==', filter.matterId));
    }
    
    if (filter?.uploadedByType) {
      q = query(q, where('uploadedByType', '==', filter.uploadedByType));
    }
    
    const snapshot = await getDocs(q);
    
    const documents: Document[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      documents.push({
        id: doc.id,
        ...data,
        uploadDate: data.uploadDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Document);
    });
    
    // Apply client-side search if needed
    if (filter?.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      return documents.filter(doc => 
        doc.fileName.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return documents;
  }

  // Get a single document
  async getDocument(documentId: string): Promise<Document | null> {
    const docRef = doc(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'documents',
      documentId
    );
    
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      uploadDate: data.uploadDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Document;
  }

  // Delete a document
  async deleteDocument(documentId: string): Promise<void> {
    // Get document to find storage path
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Delete from storage
    const storagePath = `tenants/${this.tenantId}/clients/${this.clientId}/documents/${documentId}/${document.fileName}`;
    const storageRef = ref(storage, storagePath);
    
    try {
      await deleteObject(storageRef);
    } catch (error: any) {
      // Storage file might not exist, continue with Firestore deletion
      console.warn('Storage deletion failed:', error);
    }
    
    // Delete from Firestore
    const docRef = doc(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'documents',
      documentId
    );
    
    await deleteDoc(docRef);
  }

  // Update document metadata
  async updateDocument(
    documentId: string, 
    updates: Partial<Pick<Document, 'category' | 'description' | 'tags' | 'matterId'>>
  ): Promise<void> {
    const docRef = doc(
      db,
      'tenants',
      this.tenantId,
      'clients',
      this.clientId,
      'documents',
      documentId
    );
    
    await setDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    }, { merge: true });
  }
}