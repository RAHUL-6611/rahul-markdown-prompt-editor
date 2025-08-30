import localforage from 'localforage';
import type { DocumentState } from '../types/editor';
import { isVersionEnabled } from '../config/features';

/**
 * LocalForage Storage Service for Version Management
 * Provides unified storage API with automatic fallback (IndexedDB -> WebSQL -> localStorage)
 */
class VersionStorageService {
  private store: LocalForage;
  private isInitialized = false;

  constructor() {
    // Configure localForage
    this.store = localforage.createInstance({
      name: 'markdown-prompt-editor',
      version: 1.0,
      storeName: 'versions',
      description: 'Markdown Prompt Editor - Document and Version Storage'
    });

    // Set driver priority: IndexedDB -> WebSQL -> localStorage
    this.store.setDriver([
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ]);
  }

  /**
   * Initialize the storage service
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Check if persistence is enabled
    if (!isVersionEnabled('V2_PERSISTENCE')) {
      console.log('Persistence disabled, using in-memory storage only');
      this.isInitialized = true;
      return;
    }

    try {
      // Test storage availability
      await this.store.ready();
      console.log('LocalForage initialized successfully with driver:', this.store.driver());
      this.isInitialized = true;
    } catch (error) {
      console.warn('LocalForage initialization failed, using in-memory storage:', error);
      this.isInitialized = true;
      // Continue with in-memory state only
    }
  }

  /**
   * Save a document state with all its versions
   */
  async saveDocument(documentState: DocumentState): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!isVersionEnabled('V2_PERSISTENCE')) {
      return; // Skip persistence if disabled
    }

    try {
      const data = {
        documents: { [documentState.id]: documentState },
        versions: documentState.versions.reduce((acc, version) => {
          acc[version.id] = { ...version, documentId: documentState.id };
          return acc;
        }, {} as Record<string, any>)
      };

      await this.store.setItem('app-data', data);
    } catch (error) {
      console.error('Failed to save document to storage:', error);
      throw new Error('Failed to save document to storage');
    }
  }

  /**
   * Load a document state with all its versions
   */
  async loadDocument(documentId: string): Promise<DocumentState | null> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!isVersionEnabled('V2_PERSISTENCE')) {
      return null; // No persistence when disabled
    }

    try {
      const data = await this.store.getItem('app-data') as any;
      if (!data || !data.documents) {
        return null;
      }

      const document = data.documents[documentId];
      if (!document) {
        return null;
      }

      // Get versions for this document
      const versions = Object.values(data.versions || {})
        .filter((v: any) => v.documentId === documentId)
        .map((v: any) => ({
          id: v.id,
          name: v.name,
          content: v.content,
          summary: v.summary,
          createdAt: v.createdAt,
        }))
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      return {
        id: document.id,
        content: document.content,
        versions,
        updatedAt: document.updatedAt,
      };
    } catch (error) {
      console.error('Failed to load document from storage:', error);
      return null;
    }
  }

  /**
   * Get all document IDs
   */
  async getAllDocumentIds(): Promise<string[]> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!isVersionEnabled('V2_PERSISTENCE')) {
      return [];
    }

    try {
      const data = await this.store.getItem('app-data') as any;
      if (!data || !data.documents) {
        return [];
      }

      return Object.keys(data.documents);
    } catch (error) {
      console.error('Failed to get document IDs from storage:', error);
      return [];
    }
  }

  /**
   * Delete a document and all its versions
   */
  async deleteDocument(documentId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!isVersionEnabled('V2_PERSISTENCE')) {
      return;
    }

    try {
      const data = await this.store.getItem('app-data') as any;
      if (!data) {
        return;
      }

      // Delete document
      if (data.documents) {
        delete data.documents[documentId];
      }

      // Delete associated versions
      if (data.versions) {
        const versionIds = Object.keys(data.versions).filter(
          (id) => data.versions[id].documentId === documentId
        );
        versionIds.forEach(id => delete data.versions[id]);
      }

      await this.store.setItem('app-data', data);
    } catch (error) {
      console.error('Failed to delete document from storage:', error);
      throw new Error('Failed to delete document from storage');
    }
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!isVersionEnabled('V2_PERSISTENCE')) {
      return;
    }

    try {
      await this.store.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{ totalDocuments: number; totalVersions: number; estimatedSize: number }> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!isVersionEnabled('V2_PERSISTENCE')) {
      return { totalDocuments: 0, totalVersions: 0, estimatedSize: 0 };
    }

    try {
      const data = await this.store.getItem('app-data') as any;
      if (!data) {
        return { totalDocuments: 0, totalVersions: 0, estimatedSize: 0 };
      }

      const documents = Object.keys(data.documents || {});
      const versions = Object.keys(data.versions || {});
      
      return {
        totalDocuments: documents.length,
        totalVersions: versions.length,
        estimatedSize: JSON.stringify(data).length,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalDocuments: 0, totalVersions: 0, estimatedSize: 0 };
    }
  }

  /**
   * Get the current storage driver being used
   */
  getCurrentDriver(): string {
    return this.store.driver() || 'unknown';
  }

  /**
   * Check if storage is available
   */
  async isStorageAvailable(): Promise<boolean> {
    if (!isVersionEnabled('V2_PERSISTENCE')) {
      return false;
    }

    try {
      await this.store.ready();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const versionStorage = new VersionStorageService();
