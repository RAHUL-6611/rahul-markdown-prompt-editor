import React, { useState } from 'react';
import type { Version } from '../../types/editor';
import './VersionsPanel.css';

interface VersionsPanelProps {
  versions: Version[];
  currentContent: string;
  onLoadVersion: (versionId: string) => void;
  onDeleteVersion: (versionId: string) => void;
  onSaveVersion: (content: string, name?: string) => void;
  hasUnsavedChanges: boolean;
  className?: string;
}

export const VersionsPanel: React.FC<VersionsPanelProps> = ({
  versions,
  currentContent,
  onLoadVersion,
  onDeleteVersion,
  onSaveVersion,
  hasUnsavedChanges,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveVersion = () => {
    if (currentContent.trim()) {
      onSaveVersion(currentContent, newVersionName || undefined);
      setNewVersionName('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
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

  return (
    <div className={`versions-panel ${className}`}>
      {/* Versions Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-surface-primary text-text-primary font-medium rounded-lg border border-primary hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-normal shadow-elevation-1 hover:shadow-elevation-2 text-body-small"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Versions ({versions.length})
        {hasUnsavedChanges && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-warning-100 text-warning-800 border border-warning-200">
            Unsaved
          </span>
        )}
      </button>

      {/* Save Version Button */}
      <button
        onClick={handleSaveVersion}
        disabled={!currentContent.trim()}
        className={`inline-flex items-center px-4 py-2 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-normal shadow-elevation-1 hover:shadow-elevation-2 text-body-small disabled:opacity-50 disabled:cursor-not-allowed ${
          showSuccess 
            ? 'bg-success text-text-inverse' 
            : 'bg-primary text-text-inverse hover:from-primary-700 hover:to-primary-800'
        }`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {showSuccess ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          )}
        </svg>
        {showSuccess ? 'Saved!' : 'Save Version'}
      </button>

      {/* Version Name Input */}
      <input
        type="text"
        value={newVersionName}
        onChange={(e) => setNewVersionName(e.target.value)}
        placeholder="Version name (optional)"
        className="px-3 py-2 border border-primary rounded-lg bg-surface-primary text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-normal text-body-small"
      />

      {/* Versions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-primary border border-primary rounded-lg shadow-elevation-3 z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-heading-4 font-semibold text-primary mb-4">Saved Versions</h3>
            
            {versions.length === 0 ? (
              <div className="text-center py-8 text-secondary">
                <svg className="w-12 h-12 mx-auto mb-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-body">No saved versions yet</p>
                <p className="text-caption text-tertiary">Save your first version to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-3 border border-primary rounded-lg hover:bg-surface-secondary transition-normal"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-sm mb-2">
                          <h4 className="text-body font-medium text-primary truncate">
                            {version.name}
                          </h4>
                          <span className="text-caption text-secondary">
                            {formatDate(version.createdAt)}
                          </span>
                        </div>
                        <p className="text-caption text-secondary line-clamp-2">
                          {version.summary}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-sm ml-4">
                        <button
                          onClick={() => onLoadVersion(version.id)}
                          className="p-2 text-secondary hover:text-primary hover:bg-surface-tertiary rounded-lg transition-normal"
                          title="Load this version"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => onDeleteVersion(version.id)}
                          className="p-2 text-secondary hover:text-error hover:bg-error-50 rounded-lg transition-normal"
                          title="Delete this version"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
