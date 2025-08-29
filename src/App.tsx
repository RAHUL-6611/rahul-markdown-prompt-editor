import { useState } from 'react';
import TiptapEditor from './components/Editor/TiptapEditor';
import MarkdownPreview from './components/Preview/MarkdownPreview';
import SplitView from './components/Layout/SplitView';
import { useTheme } from './hooks/useTheme';
import { useDebouncedContent } from './hooks/useEditor';
import type { ContentState } from './types/editor';
import './App.css';

function App() {
  const [content, setContent] = useState<string>('');
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  const debouncedContent = useDebouncedContent(content);

  // Handle content changes from editor
  const handleContentChange = (newContent: ContentState) => {
    setContent(newContent.html);
  };

  // Sample markdown content for testing
  const sampleContent = `# Welcome to Markdown Editor

This is a **powerful** markdown editor built with Tiptap and React.

## Features

- **Real-time preview** - See your markdown rendered instantly
- **Rich formatting** - Bold, italic, headings, lists, and more
- **GitHub Flavored Markdown** - Tables, task lists, and more
- **Dark/Light themes** - Switch between themes
- **Responsive design** - Works on desktop and mobile

### Try it out!

1. Type in the editor on the left
2. See the preview update on the right
3. Use keyboard shortcuts like **Ctrl+B** for bold

\`\`\`javascript
// Code blocks are supported too!
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

> This is a blockquote. You can use it for important notes.

[Learn more about Markdown](https://www.markdownguide.org/)

---

*Happy writing!*`;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className="border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Markdown Editor
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                V1
              </span>
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Theme:</span>
                <select
                  value={theme.current}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle theme"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Demo Controls */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setContent(sampleContent)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Load Sample Content
          </button>
          <button
            onClick={() => setContent('')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Clear Content
          </button>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <span className="mr-2">Content length:</span>
            <span className="font-mono">{content.length} characters</span>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="h-[600px]">
          <SplitView
            editor={
              <TiptapEditor
                initialContent={content}
                onContentChange={handleContentChange}
                config={{
                  placeholder: "Start writing your markdown...",
                  theme: theme.current,
                }}
              />
            }
            preview={
              <MarkdownPreview
                content={debouncedContent}
                config={{
                  githubFlavoredMarkdown: true,
                  syntaxHighlighting: true,
                }}
              />
            }
            config={{
              ratio: 0.5, // 50/50 split
              resizable: false,
            }}
          />
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Built with <span className="text-red-500">♥</span> using{' '}
              <a href="https://tiptap.dev" className="text-blue-600 dark:text-blue-400 hover:underline">
                Tiptap
              </a>
              ,{' '}
              <a href="https://react.dev" className="text-blue-600 dark:text-blue-400 hover:underline">
                React
              </a>
              , and{' '}
              <a href="https://tailwindcss.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                Tailwind CSS
              </a>
            </p>
            <p className="mt-1">
              Version 1 - Basic Split View Editor with Live Preview
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
