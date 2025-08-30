import { useState, useEffect } from 'react';
import TiptapEditor from './components/Editor/TiptapEditor';
import MarkdownPreview from './components/Preview/MarkdownPreview';
import { useTheme } from './hooks/useTheme';
import { useVersioning } from './hooks/useVersioning';
import type { ContentState } from './types/editor';

// Layout Components
import AppLayout from './components/Layout/AppLayout';
import MainContent from './components/Layout/MainContent';
import EditorSection from './components/Layout/EditorSection';
import Toolbar from './components/Layout/Toolbar';
import StatusBar from './components/Layout/StatusBar';

// Versioning Components
import { PromptManager } from './components/Versions';

// Import design tokens
import './styles/design-tokens.css';
import './App.css';

function App() {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  
  // Apply theme to document root on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  
  // Versioning functionality
  const {
    documentState,
    saveVersion,
    loadVersion,
    deleteVersion,
    updateContent,
    hasUnsavedChanges,
    loadDocumentFromStorage,
    createNewDocument,
    isLoading,
    error,
    storageStatus,
  } = useVersioning('');

  // Handle content changes from editor
  const handleContentChange = (newContent: ContentState) => {
    updateContent(newContent.html);
  };

  // Handle loading sample content
  const handleLoadSample = async () => {
    await updateContent(sampleContent);
  };

  // Handle clearing content
  const handleClearContent = async () => {
    await updateContent('');
  };

  // Handle saving version
  const handleSaveVersion = async (content: string, name?: string) => {
    await saveVersion(content, name);
  };

  // Sample LLM prompt content for testing
  const sampleContent = `# AI Content Writer Prompt

## Context
You are an expert content writer with 10+ years of experience in creating engaging, SEO-optimized content for technology companies. You specialize in writing blog posts, technical documentation, and marketing copy.

## Instructions
Write a comprehensive blog post about "The Future of AI in Software Development" that includes:

1. **Introduction** - Hook the reader with an interesting statistic or story
2. **Current State** - Discuss how AI is currently being used in development
3. **Future Trends** - Predict 3-5 key trends for the next 5 years
4. **Benefits & Challenges** - Balanced view of pros and cons
5. **Conclusion** - Actionable takeaways for developers

## Constraints
- Target audience: Software developers and tech leaders
- Word count: 1500-2000 words
- Tone: Professional but accessible
- Include at least 3 relevant statistics or studies
- Use markdown formatting for structure

## Example Output Structure
\`\`\`markdown
# The Future of AI in Software Development

[Your content here...]

## Key Takeaways
- Point 1
- Point 2
- Point 3
\`\`\`

## Additional Notes
- Focus on practical applications developers can implement today
- Include code examples where relevant
- Optimize for both technical accuracy and readability`;

  return (
    <AppLayout>
      {/* Enhanced Header */}
      <header className="sticky top-0 z-[var(--z-sticky)] bg-surface-primary/95 backdrop-blur-sm border-b border-primary shadow-elevation-1 w-full">
        <div className="layout-container">
          <div className="flex justify-between items-center h-[var(--header-height)]">
            {/* Left Section - Title and Version */}
            <div className="flex items-center space-md">
              <div className="flex items-center space-md">
                {/* App Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-elevation-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                
                {/* Title and Version */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-md">
                  <h1 className="text-heading-2 bg-clip-text">
                    Markdown Prompt Editor
                  </h1>
                  {/* <div className="flex items-center space-sm mt-1 sm:mt-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-primary-100 text-primary-800 border border-primary-200">
                      v1.0
                    </span>
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-success-50 text-success-600 border border-success-200">
                      Beta
                    </span>
                  </div> */}
                </div>
              </div>
            </div>
            
            {/* Right Section - Theme Controls */}
            <div className="flex items-center space-md">
              {/* Theme Selector */}
              <div className="hidden sm:flex items-center space-md">
                <label className="text-body-small font-medium text-secondary">
                  Theme
                </label>
                <div className="relative">
                  <select
                    value={theme.current}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                    className="appearance-none px-4 py-2 pr-8 text-body-small font-medium border border-primary rounded-lg bg-surface-primary text-primary hover:border-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-normal shadow-elevation-1"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="relative p-3 rounded-xl bg-surface-tertiary hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-normal shadow-elevation-1 hover:shadow-elevation-2 group"
                title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              >
                <div className="relative w-5 h-5">
                  {isDark ? (
                    <svg className="w-5 h-5 text-warning-500 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-primary-600 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <MainContent className="flex-1 flex flex-col w-full">
        {/* Toolbar */}
        <Toolbar>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Primary Actions - Always visible */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleLoadSample}
                className="inline-flex items-center px-3 py-2 sm:px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-normal shadow-elevation-1 hover:shadow-elevation-2 text-body-small"
                title="Load sample prompt"
              >
                <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Load Sample</span>
                <span className="sm:hidden">Sample</span>
              </button>
              
              <button
                onClick={handleClearContent}
                className="inline-flex items-center px-3 py-2 sm:px-4 bg-surface-primary text-text-primary font-medium rounded-lg border border-primary hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-normal shadow-elevation-1 hover:shadow-elevation-2 text-body-small"
                title="Clear current prompt"
              >
                <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Clear</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>

            {/* Divider - Hidden on mobile */}
            <div className="hidden md:block w-px h-6 bg-primary opacity-30"></div>
            
            {/* Prompt Management - Responsive */}
            <div className="relative flex-1 min-w-0">
              <PromptManager
                onLoadDocument={loadDocumentFromStorage}
                onNewDocument={createNewDocument}
                onLoadVersion={loadVersion}
                onDeleteVersion={deleteVersion}
                onSaveVersion={handleSaveVersion}
                currentDocumentId={documentState.id}
                currentContent={documentState.content}
                hasUnsavedChanges={hasUnsavedChanges()}
              />
            </div>
          </div>
        </Toolbar>
        <StatusBar>
          <div className="flex items-center space-md">
            <div className="flex items-center space-sm text-body-small text-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">{Math.ceil(documentState.content.length / 4)}</span>
              <span>tokens</span>
            </div>
            {documentState.content.length > 0 && (
              <div className="flex items-center space-sm text-body-small text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="font-medium">{documentState.content.trim() ? documentState.content.trim().split(/\s+/).length : 0}</span>
                <span>words</span>
              </div>
            )}
            
            {/* Storage Status */}
            {isLoading && (
              <div className="flex items-center space-sm text-body-small text-secondary">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Saving...</span>
              </div>
            )}
            
            {/* Storage Driver Info */}
            {/* {storageStatus.enabled && (
              <div className="flex items-center space-sm text-body-small text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span className={storageStatus.available ? 'text-success' : 'text-warning'}>
                  {storageStatus.available ? storageStatus.driver : 'No storage'}
                </span>
              </div>
            )} */}
            
            {error && (
              <div className="flex items-center space-sm text-body-small text-error">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
        </StatusBar>

        {/* Editor Section */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 w-full h-full">
          <EditorSection
            editor={
              <TiptapEditor
                initialContent={documentState.content}
                onContentChange={handleContentChange}
                onSaveVersion={() => saveVersion(documentState.content)}
                config={{
                  placeholder: "Write your LLM prompt here...",
                  theme: theme.current,
                }}
              />
            }

            preview={
              <MarkdownPreview
                content={documentState.content}
                
              />
            }
          />
        </div>

        {/* Status Bar */}
       
      </MainContent>
    </AppLayout>
  );
}

export default App;
