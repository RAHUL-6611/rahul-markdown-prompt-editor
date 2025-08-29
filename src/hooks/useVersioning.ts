import { useState, useCallback } from 'react';
import type { Version, DocumentState } from '../types/editor';

/**
 * Hook for managing prompt versions
 */
export const useVersioning = (initialContent: string = '') => {
  const [documentState, setDocumentState] = useState<DocumentState>({
    id: generateDocumentId(),
    content: initialContent,
    versions: [],
    updatedAt: new Date().toISOString(),
  });

  /**
   * Save current content as a new version
   */
  const saveVersion = useCallback((content: string, name?: string) => {
    const newVersion: Version = {
      id: generateVersionId(),
      createdAt: new Date().toISOString(),
      name: name || generateVersionName(),
      content,
      summary: generateContentSummary(content),
    };

    setDocumentState(prev => ({
      ...prev,
      content,
      versions: [newVersion, ...prev.versions],
      updatedAt: new Date().toISOString(),
    }));

    return newVersion;
  }, []);

  /**
   * Load a specific version
   */
  const loadVersion = useCallback((versionId: string) => {
    const version = documentState.versions.find(v => v.id === versionId);
    if (version) {
      setDocumentState(prev => ({
        ...prev,
        content: version.content,
        updatedAt: new Date().toISOString(),
      }));
      return version.content;
    }
    return null;
  }, [documentState.versions]);

  /**
   * Delete a version
   */
  const deleteVersion = useCallback((versionId: string) => {
    setDocumentState(prev => ({
      ...prev,
      versions: prev.versions.filter(v => v.id !== versionId),
    }));
  }, []);

  /**
   * Update current content without creating a version
   */
  const updateContent = useCallback((content: string) => {
    setDocumentState(prev => ({
      ...prev,
      content,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

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

  return {
    documentState,
    saveVersion,
    loadVersion,
    deleteVersion,
    updateContent,
    getLatestVersion,
    hasUnsavedChanges,
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
