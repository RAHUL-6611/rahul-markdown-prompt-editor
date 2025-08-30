import React, { useState, useEffect } from 'react';
import { versionStorage } from '../../services/storage';
import './VersionsPanel.css';

interface DocumentManagerProps {
  onLoadDocument: (documentId: string) => void;
  onNewDocument: () => void;
  currentDocumentId: string;
  className?: string;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  onLoadDocument,
  onNewDocument,
  currentDocumentId,
  className = '',
}) => {
  const [documents, setDocuments] = useState<Array<{ id: string; updatedAt: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const documentIds = await versionStorage.getAllDocumentIds();
      const documentPromises = documentIds.map(async (id) => {
        const doc = await versionStorage.loadDocument(id);
        return doc ? { id: doc.id, updatedAt: doc.updatedAt, content: doc.content } : null;
      });
      
      const loadedDocuments = (await Promise.all(documentPromises)).filter((doc): doc is { id: string; updatedAt: string; content: string } => doc !== null);
      setDocuments(loadedDocuments);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document and all its versions?')) {
      try {
        await versionStorage.deleteDocument(documentId);
        await loadDocuments();
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getContentPreview = (content: string) => {
    if (!content.trim()) return 'Empty document';
    const words = content.trim().split(/\s+/);
    return words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');
  };

  return (
    <div className={`document-manager ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-surface-primary text-text-primary font-medium rounded-lg border border-primary hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-normal shadow-elevation-1 hover:shadow-elevation-2 text-body-small"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Documents ({documents.length})
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-primary border border-primary rounded-lg shadow-elevation-3 z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading-4 font-semibold text-primary">Documents</h3>
              <button
                onClick={onNewDocument}
                className="inline-flex items-center px-3 py-1 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-normal text-body-small"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New
              </button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8 text-secondary">
                <svg className="w-8 h-8 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-body">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-secondary">
                <svg className="w-12 h-12 mx-auto mb-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-body">No documents yet</p>
                <p className="text-caption text-tertiary">Create your first document to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 border rounded-lg transition-normal cursor-pointer ${
                      doc.id === currentDocumentId
                        ? 'border-primary bg-primary-50'
                        : 'border-primary hover:bg-surface-secondary'
                    }`}
                    onClick={() => {
                      onLoadDocument(doc.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-sm mb-2">
                          <h4 className="text-body font-medium text-primary truncate">
                            Document {doc.id.slice(-8)}
                          </h4>
                          {doc.id === currentDocumentId && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-primary-100 text-primary-800 border border-primary-200">
                              Current
                            </span>
                          )}
                          <span className="text-caption text-secondary">
                            {formatDate(doc.updatedAt)}
                          </span>
                        </div>
                        <p className="text-caption text-secondary line-clamp-2">
                          {getContentPreview(doc.content)}
                        </p>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                        className="p-2 text-secondary hover:text-error hover:bg-error-50 rounded-lg transition-normal ml-2"
                        title="Delete this document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
