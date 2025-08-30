/**
 * MarkdownPreview Component
 * Renders markdown content with live preview using react-markdown
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { PreviewComponentProps } from '../../types/editor';

export const MarkdownPreview: React.FC<PreviewComponentProps> = (props) => {
  const { content, config = {}, className = '', 'data-testid': testId } = props;
  const { githubFlavoredMarkdown = true } = config;

  // Check if content is empty
  const isEmpty = !content || content.trim().length === 0;

  // Detect prompt structure patterns
  const hasContext = content.includes('Context:') || content.includes('Background:');
  const hasInstructions = content.includes('Instructions:') || content.includes('Task:');
  const hasExamples = content.includes('Example:') || content.includes('Sample:');
  const hasConstraints = content.includes('Constraints:') || content.includes('Requirements:');

  return (
    <div className={`h-full min-h-[200px] md:min-h-[400px] flex flex-col bg-surface-primary border border-primary rounded-lg shadow-elevation-1 ${className}`} data-testid={testId || 'markdown-preview-container'}>
      {/* Prompt Preview Header */}
      <div className="px-4 py-3 border-b border-primary bg-surface-secondary rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between ">
          <div className="flex items-center space-md ">
            <h3 className="text-body font-medium text-primary flex-shrink-0">Prompt Preview</h3>
            
            {/* Prompt Structure Indicators */}
            <div className="flex items-center space-sm flex-shrink-0">
              {hasContext && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-primary-50 text-primary-700 border border-primary-200">
                  Context
                </span>
              )}
              {hasInstructions && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-success-50 text-success-600 border border-success-200">
                  Instructions
                </span>
              )}
              {hasExamples && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-warning-50 text-warning-600 border border-warning-200">
                  Examples
                </span>
              )}
              {hasConstraints && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-error-50 text-error-600 border border-error-200">
                  Constraints
                </span>
              )}
            </div>
          </div>

         
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4 max-h-[60vh] overflow-y-auto">
        <div className="content-container">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 mb-4 text-tertiary">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-body text-secondary mb-2">No prompt to preview</p>
              <p className="text-body-small text-tertiary">Start writing your LLM prompt in the editor</p>
            </div>
          ) : (
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none prose-headings:text-primary prose-headings:font-semibold prose-p:text-primary prose-p:leading-relaxed prose-strong:text-primary prose-strong:font-semibold prose-em:text-primary prose-blockquote:border-l-primary prose-blockquote:bg-surface-secondary prose-blockquote:text-secondary prose-code:text-primary prose-code:bg-surface-tertiary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface-tertiary prose-pre:border prose-pre:border-primary prose-ul:text-primary prose-ol:text-primary prose-li:text-primary">
              <ReactMarkdown
                remarkPlugins={githubFlavoredMarkdown ? [remarkGfm] : []}
                components={{
                  // Custom component overrides for better styling
                  h1: ({ children }) => <h1 className="text-heading-1 mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-heading-2 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-heading-3 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="text-body mb-4">{children}</p>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="text-body font-mono bg-surface-tertiary px-1 py-0.5 rounded text-primary">{children}</code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-surface-tertiary border border-primary rounded-lg p-4 overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary bg-surface-secondary pl-4 py-2 mb-4 italic text-secondary">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-body text-primary">{children}</li>,
                  a: ({ children, href }) => (
                    <a href={href} className="text-primary-600 hover:text-primary-700 underline transition-normal">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border border-primary rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2 bg-surface-secondary border-b border-primary text-left font-semibold text-primary">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 border-b border-primary text-primary">
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;
