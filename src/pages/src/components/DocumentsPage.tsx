import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DocumentService } from '../services/documentService';
import DocumentUpload from './DocumentUpload';
import DocumentPreview from './DocumentPreview';
import LoadingSpinner from './LoadingSpinner';
import type { Document, DocumentCategory, DocumentFilter } from '../types/document';
import { formatFileSize } from '../types/document';

export default function DocumentsPage() {
  const { currentUser, clientData } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState<DocumentFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (currentUser && clientData) {
      loadDocuments();
    }
  }, [currentUser, clientData, filter]);

  const loadDocuments = async () => {
    if (!currentUser || !clientData) return;

    try {
      setLoading(true);
      setError(null);
      
      const documentService = new DocumentService(
        clientData.tenantId,
        clientData.id,
        currentUser.uid
      );
      
      const docs = await documentService.getDocuments({
        ...filter,
        searchTerm: searchTerm || undefined
      });
      
      setDocuments(docs);
    } catch (err: any) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments();
  };

  const handleDelete = async (documentId: string) => {
    if (!currentUser || !clientData) return;
    
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const documentService = new DocumentService(
        clientData.tenantId,
        clientData.id,
        currentUser.uid
      );
      
      await documentService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err: any) {
      alert('Failed to delete document');
    }
  };

  const getCategoryBadgeColor = (category: DocumentCategory) => {
    const colors: Record<DocumentCategory, string> = {
      contract: 'bg-purple-100 text-purple-800',
      correspondence: 'bg-blue-100 text-blue-800',
      'court-filing': 'bg-red-100 text-red-800',
      evidence: 'bg-yellow-100 text-yellow-800',
      invoice: 'bg-green-100 text-green-800',
      identification: 'bg-gray-100 text-gray-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload and manage your legal documents
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filter.category || ''}
            onChange={(e) => setFilter({ ...filter, category: e.target.value as DocumentCategory || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="contract">Contract</option>
            <option value="correspondence">Correspondence</option>
            <option value="court-filing">Court Filing</option>
            <option value="evidence">Evidence</option>
            <option value="invoice">Invoice</option>
            <option value="identification">Identification</option>
            <option value="other">Other</option>
          </select>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
          
          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {showUpload ? 'Cancel Upload' : 'Upload Documents'}
          </button>
        </form>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
          <DocumentUpload
            onUploadComplete={() => {
              setShowUpload(false);
              loadDocuments();
            }}
          />
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner text="Loading documents..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-gray-500">No documents uploaded yet</p>
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <svg
                          className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.fileName}
                          </p>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>•</span>
                            <span>{formatDate(doc.uploadDate)}</span>
                            {doc.description && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-xs">{doc.description}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(doc.category)}`}>
                          {doc.category}
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0 flex items-center space-x-4">
                      <button
                        onClick={() => setPreviewDocument(doc)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Preview
                      </button>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          fileUrl={previewDocument.fileUrl}
          fileName={previewDocument.fileName}
          fileType={previewDocument.fileType}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
}