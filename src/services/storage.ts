import type { Version, DocumentState } from '../types/editor';

/**
 * IndexedDB Storage Service for Version Management
 */
class VersionStorageService {
  private dbName = 'markdown-prompt-editor';
  private dbVersion = 1;
  private storeName = 'versions';
  private db: IDBDatabase | null = null;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create versions store
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('documentId', 'documentId', { unique: false });
        }
      };
    });
  }

  /**
   * Save a document state with all its versions
   */
  async saveDocument(documentState: DocumentState): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Save the document state
      const documentRequest = store.put({
        id: documentState.id,
        type: 'document',
        content: documentState.content,
        updatedAt: documentState.updatedAt,
        createdAt: new Date().toISOString(),
      });

      // Save all versions
      const versionPromises = documentState.versions.map(version => {
        return new Promise<void>((resolveVersion, rejectVersion) => {
          const versionRequest = store.put({
            id: version.id,
            type: 'version',
            documentId: documentState.id,
            name: version.name,
            content: version.content,
            summary: version.summary,
            createdAt: version.createdAt,
          });

          versionRequest.onsuccess = () => resolveVersion();
          versionRequest.onerror = () => rejectVersion(versionRequest.error);
        });
      });

      documentRequest.onsuccess = async () => {
        try {
          await Promise.all(versionPromises);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      documentRequest.onerror = () => {
        reject(documentRequest.error);
      };
    });
  }

  /**
   * Load a document state with all its versions
   */
  async loadDocument(documentId: string): Promise<DocumentState | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      // Load document
      const documentRequest = store.get(documentId);
      
      documentRequest.onsuccess = () => {
        const document = documentRequest.result;
        if (!document || document.type !== 'document') {
          resolve(null);
          return;
        }

        // Load versions for this document
        const versionIndex = store.index('documentId');
        const versionRequest = versionIndex.getAll(documentId);

        versionRequest.onsuccess = () => {
          const versionRecords = versionRequest.result;
          const versions: Version[] = versionRecords
            .filter((record: any) => record.type === 'version')
            .map((record: any) => ({
              id: record.id,
              name: record.name,
              content: record.content,
              summary: record.summary,
              createdAt: record.createdAt,
            }))
            .sort((a: Version, b: Version) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

          const documentState: DocumentState = {
            id: document.id,
            content: document.content,
            versions,
            updatedAt: document.updatedAt,
          };

          resolve(documentState);
        };

        versionRequest.onerror = () => {
          reject(versionRequest.error);
        };
      };

      documentRequest.onerror = () => {
        reject(documentRequest.error);
      };
    });
  }

  /**
   * Get all document IDs
   */
  async getAllDocumentIds(): Promise<string[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.getAll();
      
      request.onsuccess = () => {
        const documents = request.result
          .filter((record: any) => record.type === 'document')
          .map((record: any) => record.id);
        resolve(documents);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Delete a document and all its versions
   */
  async deleteDocument(documentId: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Delete document
      const documentRequest = store.delete(documentId);

      // Delete all versions for this document
      const versionIndex = store.index('documentId');
      const versionRequest = versionIndex.getAllKeys(documentId);

      documentRequest.onsuccess = () => {
        versionRequest.onsuccess = () => {
          const versionKeys = versionRequest.result;
          const deletePromises = versionKeys.map((key: any) => {
            return new Promise<void>((resolveDelete, rejectDelete) => {
              const deleteRequest = store.delete(key);
              deleteRequest.onsuccess = () => resolveDelete();
              deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
            });
          });

          Promise.all(deletePromises)
            .then(() => resolve())
            .catch(reject);
        };

        versionRequest.onerror = () => {
          reject(versionRequest.error);
        };
      };

      documentRequest.onerror = () => {
        reject(documentRequest.error);
      };
    });
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{ totalDocuments: number; totalVersions: number; estimatedSize: number }> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.getAll();
      
      request.onsuccess = () => {
        const records = request.result;
        const documents = records.filter((record: any) => record.type === 'document');
        const versions = records.filter((record: any) => record.type === 'version');
        
        // Estimate size (rough calculation)
        const estimatedSize = JSON.stringify(records).length;

        resolve({
          totalDocuments: documents.length,
          totalVersions: versions.length,
          estimatedSize,
        });
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Export singleton instance
export const versionStorage = new VersionStorageService();
