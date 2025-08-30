import { useState, useCallback, useEffect } from 'react';
import type { Version, DocumentState } from '../types/editor';
import { versionStorage } from '../services/storage';
import { isVersionEnabled } from '../config/features';

/**
 * Hook for managing prompt versions
 */
export const useVersioning = (initialContent: string = '', documentId?: string) => {
  const [documentState, setDocumentState] = useState<DocumentState>({
    id: documentId || generateDocumentId(),
    content: initialContent,
    versions: [],
    updatedAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<{
    available: boolean;
    driver: string;
    enabled: boolean;
  }>({
    available: false,
    driver: 'unknown',
    enabled: isVersionEnabled('V2_PERSISTENCE'),
  });

  /**
   * Save current content as a new version
   */
  const saveVersion = useCallback(async (content: string, name?: string) => {
    const newVersion: Version = {
      id: generateVersionId(),
      createdAt: new Date().toISOString(),
      name: name || generateVersionName(),
      content,
      summary: generateContentSummary(content),
    };

    const updatedState = {
      ...documentState,
      content,
      versions: [newVersion, ...documentState.versions],
      updatedAt: new Date().toISOString(),
    };

    setDocumentState(updatedState);

    try {
      await versionStorage.saveDocument(updatedState);
      setError(null);
    } catch (err) {
      console.warn('Failed to save version to storage:', err);
      setError('Failed to save version (using in-memory only)');
    }

    return newVersion;
  }, [documentState]);

  /**
   * Load a specific version
   */
  const loadVersion = useCallback(async (versionId: string) => {
    const version = documentState.versions.find(v => v.id === versionId);
    if (version) {
      const updatedState = {
        ...documentState,
        content: version.content,
        updatedAt: new Date().toISOString(),
      };
      
      setDocumentState(updatedState);

      try {
        await versionStorage.saveDocument(updatedState);
        setError(null);
      } catch (err) {
        console.warn('Failed to save current state to storage:', err);
        setError('Failed to save current state (using in-memory only)');
      }

      return version.content;
    }
    return null;
  }, [documentState]);

  /**
   * Delete a version
   */
  const deleteVersion = useCallback(async (versionId: string) => {
    const updatedState = {
      ...documentState,
      versions: documentState.versions.filter(v => v.id !== versionId),
    };
    
    setDocumentState(updatedState);

    try {
      await versionStorage.saveDocument(updatedState);
      setError(null);
    } catch (err) {
      console.warn('Failed to delete version from storage:', err);
      setError('Failed to delete version (using in-memory only)');
    }
  }, [documentState]);

  /**
   * Update current content without creating a version
   */
  const updateContent = useCallback(async (content: string) => {
    const updatedState = {
      ...documentState,
      content,
      updatedAt: new Date().toISOString(),
    };
    
    setDocumentState(updatedState);

    // Auto-save current state to storage
    try {
      await versionStorage.saveDocument(updatedState);
      setError(null);
    } catch (err) {
      console.warn('Failed to save current state to storage:', err);
      setError('Failed to save current state (using in-memory only)');
    }
  }, [documentState]);

  /**
   * Get the latest version
   */
  const getLatestVersion = useCallback(() => {
    return documentState.versions[0] || null;
  }, [documentState.versions]);

  /**
   * Check if content has changed since last version
   */
  const hasUnsavedChanges = useCallback(() => {
    const latestVersion = getLatestVersion();
    if (!latestVersion) return documentState.content.length > 0;
    return latestVersion.content !== documentState.content;
  }, [documentState.content, getLatestVersion]);

  /**
   * Load document from storage
   */
  const loadDocumentFromStorage = useCallback(async (docId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedDocument = await versionStorage.loadDocument(docId);
      if (loadedDocument) {
        setDocumentState(loadedDocument);
      }
    } catch (err) {
      console.warn('Failed to load document from storage:', err);
      setError('Failed to load document from storage');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new document
   */
  const createNewDocument = useCallback(() => {
    const newDocumentState: DocumentState = {
      id: generateDocumentId(),
      content: '',
      versions: [],
      updatedAt: new Date().toISOString(),
    };
    setDocumentState(newDocumentState);
    setError(null);
  }, []);

  /**
   * Initialize storage and check availability
   */
  const initializeStorage = useCallback(async () => {
    try {
      await versionStorage.init();
      
      // Check storage availability
      const available = await versionStorage.isStorageAvailable();
      const driver = versionStorage.getCurrentDriver();
      
      setStorageStatus({
        available,
        driver,
        enabled: isVersionEnabled('V2_PERSISTENCE'),
      });

      if (documentId) {
        await loadDocumentFromStorage(documentId);
      }
    } catch (err) {
      console.warn('Storage initialization failed, continuing without persistence:', err);
      setStorageStatus({
        available: false,
        driver: 'none',
        enabled: isVersionEnabled('V2_PERSISTENCE'),
      });
      setError(null); // Don't show error to user, just log it
    }
  }, [documentId, loadDocumentFromStorage]);

  // Initialize storage and load document if documentId is provided
  useEffect(() => {
    initializeStorage();
  }, [initializeStorage]);

  return {
    documentState,
    saveVersion,
    loadVersion,
    deleteVersion,
    updateContent,
    getLatestVersion,
    hasUnsavedChanges,
    loadDocumentFromStorage,
    createNewDocument,
    isLoading,
    error,
    storageStatus,
  };
};

/**
 * Generate a unique document ID
 */
function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique version ID
 */
function generateVersionId(): string {
  return `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a version name based on timestamp
 */
function generateVersionName(): string {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  return `Version ${date}`;
}

/**
 * Generate a summary of the content
 */
function generateContentSummary(content: string): string {
  if (!content.trim()) return 'Empty prompt';
  
  const words = content.trim().split(/\s+/);
  const wordCount = words.length;
  const charCount = content.length;
  
  // Get first few words as preview
  const preview = words.slice(0, 10).join(' ');
  const suffix = words.length > 10 ? '...' : '';
  
  return `${wordCount} words, ${charCount} chars - ${preview}${suffix}`;
}
