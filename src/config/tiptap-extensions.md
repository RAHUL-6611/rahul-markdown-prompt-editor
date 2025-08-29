# Tiptap Extensions Reference

## 📋 Available Extensions for Selection

### 🏗️ **Core Nodes (Document Structure)**

#### **Basic Structure**
- **Document** - The root node of the editor
- **Paragraph** - Basic paragraph node
- **Text** - Text content node
- **HardBreak** - Line break (Shift+Enter)

#### **Headings & Organization**
- **Heading** - H1-H6 headings with levels
- **HorizontalRule** - Horizontal divider line
- **TableOfContents** - Auto-generated table of contents

#### **Lists**
- **BulletList** - Unordered lists
- **OrderedList** - Numbered lists
- **ListItem** - Individual list items
- **TaskList** - Checkbox lists
- **TaskItem** - Individual task items

#### **Code & Technical**
- **CodeBlock** - Multi-line code blocks
- **CodeBlockLowlight** - Syntax highlighted code blocks
- **InlineCode** - Inline code formatting

#### **Media & Rich Content**
- **Image** - Image insertion and management
- **Emoji** - Emoji picker and insertion
- **Mention** - @mentions functionality

#### **Advanced Structure**
- **Blockquote** - Quote blocks
- **Details** - Collapsible content sections
- **DetailsContent** - Content within details
- **DetailsSummary** - Summary for details
- **Table** - Data tables
- **TableRow** - Table rows
- **TableCell** - Table cells
- **TableHeader** - Table header cells

---

### 🎨 **Marks (Text Formatting)**

#### **Basic Formatting**
- **Bold** - **Bold text**
- **Italic** - *Italic text*
- **Underline** - <u>Underlined text</u>
- **Strike** - ~~Strikethrough text~~

#### **Advanced Formatting**
- **Code** - `Inline code`
- **Highlight** - ==Highlighted text==
- **Color** - Colored text
- **Subscript** - Subscript text
- **Superscript** - Superscript text

#### **Links & References**
- **Link** - [Link text](url)
- **Mention** - @username mentions

---

### ⚙️ **Functionality Extensions**

#### **User Interface**
- **BubbleMenu** - Floating formatting menu
- **FloatingMenu** - Floating insert menu
- **DragHandle** - Drag and drop handles
- **Dropcursor** - Visual drop indicators
- **Gapcursor** - Cursor between blocks

#### **Content Management**
- **Placeholder** - Placeholder text
- **CharacterCount** - Character/word counting
- **Focus** - Focus management
- **History** - Undo/redo functionality
- **UniqueID** - Unique identifiers for nodes

#### **Import/Export**
- **Import** - Content import functionality
- **Export** - Content export (HTML, JSON, Markdown)

#### **Collaboration**
- **Collaboration** - Real-time collaboration
- **CollaborationCursor** - Cursor positions of collaborators
- **Comments** - Comment system

#### **AI & Automation**
- **AIAgent** - AI-powered assistance
- **AIChanges** - AI-suggested changes
- **AIGeneration** - AI content generation
- **AISuggestion** - AI suggestions

#### **Advanced Features**
- **Mathematics** - Math equation support
- **Typography** - Typography improvements
- **TextAlign** - Text alignment options
- **FontFamily** - Font family selection
- **InvisibleCharacters** - Show hidden characters
- **ListKeymap** - List keyboard shortcuts
- **SnapshotCompare** - Version comparison

---

## 🎯 **Recommended Extensions for V1**

### **Essential (Starter Kit)**
```typescript
import StarterKit from '@tiptap/starter-kit'
```
**Includes:**
- Document, Paragraph, Text
- Heading (H1-H6)
- Bold, Italic, Strike
- Code, CodeBlock
- BulletList, OrderedList, ListItem
- Blockquote
- HorizontalRule
- HardBreak

### **Recommended Additions for V1**
```typescript
// Enhanced functionality
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import FloatingMenu from '@tiptap/extension-floating-menu'

// GitHub Flavored Markdown support
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-header'
import TableHeader from '@tiptap/extension-table-cell'
```

### **Optional for V1**
```typescript
// Advanced features
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
```

---

## 🔧 **Extension Configuration Examples**

### **Basic Configuration**
```typescript
const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6]
    },
    codeBlock: {
      HTMLAttributes: {
        class: 'bg-gray-100 p-4 rounded'
      }
    }
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-600 hover:text-blue-800'
    }
  }),
  Placeholder.configure({
    placeholder: 'Start writing your markdown...'
  })
]
```

### **Advanced Configuration**
```typescript
const extensions = [
  StarterKit,
  Link.configure({
    protocols: ['http', 'https', 'mailto', 'tel'],
    autolink: true,
    linkOnPaste: true
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return 'Heading'
      }
      return 'Start writing...'
    }
  }),
  CharacterCount.configure({
    limit: 10000
  }),
  BubbleMenu.configure({
    element: null,
    shouldShow: ({ editor, view, state, oldState, from, to }) => {
      return from !== to && !editor.isDestroyed
    }
  })
]
```

---

## 📝 **Selection Guide**

### **For V1 (Basic Editor)**
**Must Have:**
- StarterKit (includes all basics)
- Link (for markdown links)
- Placeholder (user experience)

**Nice to Have:**
- CharacterCount (content limits)
- TaskList/TaskItem (GitHub flavored markdown)
- Table extensions (if you want table support)

### **For Future Versions**
- Collaboration extensions (V2+)
- AI extensions (V3+)
- Advanced formatting (V2+)
- Image support (V2+)

---

## ❓ **Questions for You**

1. **Which extensions would you like to include in V1?**
   - StarterKit (recommended)
   - Link extension?
   - Placeholder extension?
   - TaskList/TaskItem for GitHub flavored markdown?
   - Table support?

2. **Any specific configuration preferences?**
   - Heading levels (H1-H6 or H1-H3)?
   - Link behavior (auto-link, click to open)?
   - Character limits?

3. **UI/UX preferences?**
   - Bubble menu for formatting?
   - Floating menu for insertions?
   - Custom styling for code blocks?

Please let me know your selections and I'll implement the chosen extensions with proper configuration!
