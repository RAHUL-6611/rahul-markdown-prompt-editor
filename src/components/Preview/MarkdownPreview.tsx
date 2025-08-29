/**
 * MarkdownPreview Component
 * Renders markdown content with live preview using react-markdown
 */

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { isFeatureEnabled } from '../../config/features';
import type { PreviewComponentProps } from '../../types/editor';

/**
 * Main MarkdownPreview Component
 */
export const MarkdownPreview: React.FC<PreviewComponentProps> = (props) => {
  const {
    content,
    config = {},
    className = '',
    'data-testid': testId,
  } = props;

  // Destructure config with defaults
  const {
    syntaxHighlighting = isFeatureEnabled('SYNTAX_HIGHLIGHTING'),
    githubFlavoredMarkdown = isFeatureEnabled('GITHUB_FLAVORED_MD'),
    rehypePlugins = [],
    remarkPlugins = [],
  } = config;

  // Memoized plugins configuration
  const plugins = useMemo(() => {
    const remarkPluginsList = [...remarkPlugins];
    
    // Add GitHub Flavored Markdown if enabled
    if (githubFlavoredMarkdown) {
      remarkPluginsList.push(remarkGfm);
    }

    return {
      remarkPlugins: remarkPluginsList,
      rehypePlugins,
    };
  }, [githubFlavoredMarkdown, remarkPlugins, rehypePlugins]);

  // Memoized content to prevent unnecessary re-renders
  const memoizedContent = useMemo(() => content, [content]);

  // Handle empty content
  if (!memoizedContent.trim()) {
    return (
      <div
        className={`min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 ${className}`}
        data-testid={testId || 'markdown-preview-container'}
      >
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 mb-4 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">No content to preview</p>
            <p className="text-xs mt-1">Start typing in the editor to see the preview</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[400px] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 ${className}`}
      data-testid={testId || 'markdown-preview-container'}
    >
      {/* Preview Header */}
      <div className="px-4 py-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </h3>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            {githubFlavoredMarkdown && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                GitHub Flavored
              </span>
            )}
            {syntaxHighlighting && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                Syntax Highlighting
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-4 overflow-auto max-h-[calc(100vh-200px)]">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            {...plugins}
            className="markdown-preview prose prose-sm dark:prose-invert max-w-none"
          >
            {memoizedContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;
