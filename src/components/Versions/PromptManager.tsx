import React, { useState, useEffect } from 'react';
import { versionStorage } from '../../services/storage';
import type { DocumentState, Version } from '../../types/editor';
import './PromptManager.css';

interface PromptManagerProps {
  onLoadDocument: (documentId: string) => void;
  onNewDocument: () => void;
  onLoadVersion: (versionId: string) => void;
  onDeleteVersion: (versionId: string) => void;
  onSaveVersion: (content: string, name?: string) => void;
  currentDocumentId: string;
  currentContent: string;
  hasUnsavedChanges: boolean;
  className?: string;
}

interface PromptItem {
  id: string;
  name: string;
  content: string;
  updatedAt: string;
  type: 'document' | 'version';
  parentId?: string;
  summary?: string;
}

export const PromptManager: React.FC<PromptManagerProps> = ({
  onLoadDocument,
  onNewDocument,
  onLoadVersion,
  onDeleteVersion,
  onSaveVersion,
  currentDocumentId,
  currentContent,
  hasUnsavedChanges,
  className = '',
}) => {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'versions'>('all');
  const [newVersionName, setNewVersionName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPrompts = async () => {
    setIsLoading(true);
    try {
      const documentIds = await versionStorage.getAllDocumentIds();
      const allPrompts: PromptItem[] = [];

      // Load all documents and their versions
      for (const docId of documentIds) {
        const doc = await versionStorage.loadDocument(docId);
        if (doc) {
          // Add document
          allPrompts.push({
            id: doc.id,
            name: `Document ${doc.id.slice(-8)}`,
            content: doc.content,
            updatedAt: doc.updatedAt,
            type: 'document',
          });

          // Add versions
          doc.versions.forEach(version => {
            allPrompts.push({
              id: version.id,
              name: version.name,
              content: version.content,
              updatedAt: version.createdAt,
              type: 'version',
              parentId: doc.id,
              summary: version.summary || undefined,
            });
          });
        }
      }

      // Sort by updatedAt (newest first)
      allPrompts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setPrompts(allPrompts);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPrompts();
    }
  }, [isOpen]);

  const handleSaveVersion = () => {
    if (currentContent.trim()) {
      onSaveVersion(currentContent, newVersionName || undefined);
      setNewVersionName('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleDeletePrompt = async (prompt: PromptItem) => {
    const isDocument = prompt.type === 'document';
    const confirmMessage = isDocument 
      ? 'Are you sure you want to delete this document and all its versions?' 
      : 'Are you sure you want to delete this version?';

    if (confirm(confirmMessage)) {
      try {
        if (isDocument) {
          await versionStorage.deleteDocument(prompt.id);
        } else {
          onDeleteVersion(prompt.id);
        }
        await loadPrompts();
      } catch (error) {
        console.error('Failed to delete prompt:', error);
      }
    }
  };

  const handleLoadPrompt = (prompt: PromptItem) => {
    if (prompt.type === 'document') {
      onLoadDocument(prompt.id);
    } else {
      onLoadVersion(prompt.id);
    }
    setIsOpen(false);
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
    if (!content.trim()) return 'Empty prompt';
    const words = content.trim().split(/\s+/);
    return words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'documents') return prompt.type === 'document' && matchesSearch;
    if (activeTab === 'versions') return prompt.type === 'version' && matchesSearch;
    
    return matchesSearch;
  });

  const documents = prompts.filter(p => p.type === 'document');
  const versions = prompts.filter(p => p.type === 'version');

  return (
    <div className={`prompt-manager ${className}`}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 sm:px-4 bg-surface-primary text-text-primary font-medium rounded-lg border border-primary hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-normal shadow-elevation-1 hover:shadow-elevation-2 text-body-small"
      >
        <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden sm:inline">
          Prompts ({documents.length} docs, {versions.length} versions)
        </span>
        <span className="sm:hidden">
          Prompts ({documents.length + versions.length})
        </span>
        {hasUnsavedChanges && (
          <span className="ml-1 sm:ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-caption bg-warning-100 text-warning-800 border border-warning-200">
            <span className="hidden sm:inline">Unsaved</span>
            <span className="sm:hidden">!</span>
          </span>
        )}
      </button>

      {/* Save Version Button - Hidden on mobile (moved to mobile menu) */}
      <button
        onClick={handleSaveVersion}
        disabled={!currentContent.trim()}
        className={`hidden sm:inline-flex items-center px-3 py-2 sm:px-4 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-normal shadow-elevation-1 hover:shadow-elevation-2 text-body-small disabled:opacity-50 disabled:cursor-not-allowed ${
          showSuccess 
            ? 'bg-success-500 text-white' 
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
        title="Save current content as a new version"
      >
        <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {showSuccess ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          )}
        </svg>
        <span className="hidden sm:inline">{showSuccess ? 'Saved!' : 'Save Version'}</span>
        <span className="sm:hidden">{showSuccess ? '✓' : 'Save'}</span>
      </button>

      {/* Version Name Input - Hidden on mobile to save space */}
      <input
        type="text"
        value={newVersionName}
        onChange={(e) => setNewVersionName(e.target.value)}
        placeholder="Version name (optional)"
        className="hidden md:block px-3 py-2 border border-primary rounded-lg bg-surface-primary text-text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-normal text-body-small"
      />

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-primary border border-primary rounded-lg shadow-elevation-3 z-50 max-h-96 overflow-y-auto w-full sm:w-auto sm:min-w-md">
          <div className="p-3 sm:p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading-4 font-semibold text-primary">Prompt Manager</h3>
              <button
                onClick={onNewDocument}
                className="inline-flex items-center px-3 py-1 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-normal text-body-small"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">New Document</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>

            {/* Search - Simplified on mobile */}
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts..."
                className="w-full px-3 py-2 border border-primary rounded-lg bg-surface-primary text-text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-normal text-body-small"
              />
            </div>

            {/* Tabs - Simplified on mobile */}
            <div className="flex space-x-1 mb-4 border-b border-primary overflow-x-auto">
              {[
                { key: 'all', label: `All (${prompts.length})`, shortLabel: 'All' },
                { key: 'documents', label: `Documents (${documents.length})`, shortLabel: 'Docs' },
                { key: 'versions', label: `Versions (${versions.length})`, shortLabel: 'Vers' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-2 sm:px-3 py-2 text-body-small font-medium rounded-t-lg transition-normal whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.key
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary hover:text-primary hover:bg-surface-secondary'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="text-center py-8 text-secondary">
                <svg className="w-8 h-8 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-body">Loading prompts...</p>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-8 text-secondary">
                <svg className="w-12 h-12 mx-auto mb-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-body">
                  {searchQuery ? 'No prompts found' : 'No prompts yet'}
                </p>
                <p className="text-caption text-tertiary">
                  {searchQuery ? 'Try adjusting your search' : 'Create your first document to get started'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`p-2 sm:p-3 border rounded-lg transition-normal cursor-pointer ${
                      prompt.id === currentDocumentId
                        ? 'border-primary bg-primary-50'
                        : 'border-primary hover:bg-surface-secondary'
                    }`}
                    onClick={() => handleLoadPrompt(prompt)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-sm mb-1 sm:mb-2">
                          <div className="flex items-center space-sm">
                            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {prompt.type === 'document' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                            <h4 className="text-body font-medium text-primary truncate">
                              {prompt.name}
                            </h4>
                          </div>
                          
                          {prompt.id === currentDocumentId && (
                            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-caption bg-primary-100 text-primary-800 border border-primary-200">
                              <span className="hidden sm:inline">Current</span>
                              <span className="sm:hidden">Now</span>
                            </span>
                          )}
                          
                          <span className="text-caption text-secondary">
                            {formatDate(prompt.updatedAt)}
                          </span>
                        </div>
                        
                        <p className="text-caption text-secondary line-clamp-2">
                          {prompt.summary || getContentPreview(prompt.content)}
                        </p>
                        
                        {prompt.type === 'version' && prompt.parentId && (
                          <p className="text-caption text-tertiary mt-1">
                            <span className="hidden sm:inline">Version of Document </span>
                            <span className="sm:hidden">From </span>
                            {prompt.parentId.slice(-8)}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePrompt(prompt);
                        }}
                        className="p-2 text-secondary hover:text-error hover:bg-error-50 rounded-lg transition-normal ml-2"
                        title={`Delete this ${prompt.type}`}
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
