import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DocumentService } from '../services/documentService';
import { 
  DocumentUpload as DocumentUploadType, 
  DocumentCategory,
  isAllowedFileType,
  formatFileSize,
  MAX_FILE_SIZE,
  FILE_TYPE_EXTENSIONS
} from '../types/document';
import LoadingSpinner from './LoadingSpinner';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
  matterId?: string;
}

export default function DocumentUpload({ onUploadComplete, matterId }: DocumentUploadProps) {
  const { currentUser, clientData } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!isAllowedFileType(file)) {
        setUploadErrors(prev => ({
          ...prev,
          [file.name]: `File type not allowed. Allowed types: PDF, Word, Images, Text`
        }));
        return false;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        setUploadErrors(prev => ({
          ...prev,
          [file.name]: `File too large. Maximum size: ${formatFileSize(MAX_FILE_SIZE)}`
        }));
        return false;
      }
      
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileName];
      return newErrors;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const uploadFiles = async () => {
    if (!currentUser || !clientData || files.length === 0) return;

    const documentService = new DocumentService(
      clientData.tenantId,
      clientData.id,
      currentUser.uid
    );

    for (const file of files) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        await documentService.uploadDocument(
          {
            file,
            category,
            matterId,
            description,
            tags: []
          },
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        );
        
        // Remove successful upload
        removeFile(file.name);
      } catch (error: any) {
        setUploadErrors(prev => ({
          ...prev,
          [file.name]: error.message || 'Upload failed'
        }));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
    
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const acceptedTypes = Object.entries(FILE_TYPE_EXTENSIONS)
    .flatMap(([, exts]) => exts)
    .join(',');

  return (
    <div className="w-full">
      {/* Category Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="contract">Contract</option>
          <option value="correspondence">Correspondence</option>
          <option value="court-filing">Court Filing</option>
          <option value="evidence">Evidence</option>
          <option value="invoice">Invoice</option>
          <option value="identification">Identification</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          placeholder="Brief description of the document(s)"
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          PDF, Word documents, images up to {formatFileSize(MAX_FILE_SIZE)}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)}
                </p>
                {uploadProgress[file.name] !== undefined && (
                  <div className="mt-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                  </div>
                )}
                {uploadErrors[file.name] && (
                  <p className="text-sm text-red-600 mt-1">
                    {uploadErrors[file.name]}
                  </p>
                )}
              </div>
              {!uploadProgress[file.name] && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.name);
                  }}
                  className="ml-4 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={uploadFiles}
          disabled={Object.keys(uploadProgress).length > 0}
          className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium ${
            Object.keys(uploadProgress).length > 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {Object.keys(uploadProgress).length > 0 ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="small" />
              <span className="ml-2">Uploading...</span>
            </span>
          ) : (
            `Upload ${files.length} file${files.length > 1 ? 's' : ''}`
          )}
        </button>
      )}
    </div>
  );
}