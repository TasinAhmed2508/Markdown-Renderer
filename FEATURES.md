# 🚀 TA RenderX — Feature Roadmap & Suggestions

> A curated list of features that would take this markdown renderer to the next level,
> organized by priority and category.

---

## 🔥 High Priority — Core UX Gaps

### 1. Keyboard Shortcuts System
Currently all features are click-driven only. A proper shortcut system would dramatically improve power-user experience.

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+K` | Insert link |
| `Ctrl+Shift+C` | Inline code |
| `Ctrl+S` | Manual save / download |
| `Ctrl+F` | Focus find bar |
| `Ctrl+H` | Find & replace |
| `Ctrl+Shift+V` | Paste as plain text |
| `Ctrl+Z / Y` | Undo / Redo tracking |
| `Ctrl+D` | Duplicate line |
| `Tab / Shift+Tab` | Indent / outdent selected lines |

### 2. Undo / Redo History
The editor has no undo history beyond the browser's native textarea undo. A proper history stack would allow:
- Unlimited undo/redo with `Ctrl+Z` / `Ctrl+Y`
- History snapshots per meaningful edit (not per keystroke)
- Visual undo timeline (optional)

### 3. Image Upload & Management
Currently images can only be referenced by URL. Add:
- Drag & drop image upload into the editor
- Paste image from clipboard (`Ctrl+V`)
- Convert to Base64 data URL or upload to a local/cloud store
- Image gallery panel for managing uploaded images

### 4. Tab / Indent Support
Pressing Tab in the textarea currently moves focus away. Should support:
- `Tab` inserts 2/4 spaces (configurable)
- `Shift+Tab` removes indent
- Multi-line indent/outdent with selection
- Auto-indent on Enter (match previous line indent)

### 5. Table of Contents (TOC) Generator
Auto-generate a clickable table of contents from headings:
- Floating TOC sidebar or dropdown
- Click to jump to heading in preview
- Auto-update as headings change
- Copy TOC as markdown

---

## ✨ Medium Priority — Editor Enhancements

### 6. Split Pane Resize
Allow users to drag the divider between editor and preview to resize panes:
- Draggable splitter bar
- Double-click to reset to 50/50
- Remember preference in localStorage
- Collapse editor or preview completely

### 7. Multiple Documents / Tabs
Support working on multiple markdown files simultaneously:
- Tab bar above the editor
- Create new / close / rename tabs
- All tabs saved in localStorage
- Import `.md` files from disk

### 8. Markdown Table Editor
A visual table editor overlay:
- Click a table in preview to open the editor
- Add/remove rows and columns
- Drag to reorder columns
- Auto-align table syntax in the editor

### 9. Spellcheck & Grammar
Integrate spellcheck capabilities:
- Inline red underlines for misspelled words
- Right-click suggestions
- Toggle spellcheck on/off
- Support for code-aware spellcheck (skip code blocks, URLs)

### 10. Word Wrap Toggle
Add a toggle button to switch between:
- `pre` (no wrap, horizontal scroll) — current behavior
- `pre-wrap` (soft wrap at viewport edge)
- Remember preference per session

### 11. Focus / Zen Mode
A distraction-free writing mode:
- Hide toolbar, status bar, and all chrome
- Full-screen editor only (or editor + preview)
- Dim non-current paragraph (spotlight mode)
- `Esc` to exit
- Combine with existing typewriter mode

### 12. Drag & Drop `.md` File Import
Allow opening markdown files by drag & drop:
- Drop a `.md` file onto the editor area
- Parse and load contents into editor
- Show filename in the title bar / tab
- Confirm before replacing current content

---

## 🎨 Medium Priority — Visual & Theme Features

### 13. Custom Theme Creator
Let users create and save their own themes:
- Color picker for background, text, accents
- Preview in real-time
- Export/import theme as JSON
- Community theme sharing (future)

### 14. Syntax Theme Picker for Code Blocks
Allow choosing highlight.js themes independently:
- Dropdown to pick from popular themes (monokai, github-dark, dracula, nord, etc.)
- Live preview of code blocks
- Separate from the main app theme

### 15. Font Customization
Let users pick editor and preview fonts:
- Font family selector (serif, sans-serif, monospace, custom)
- Font size slider
- Line height adjustment
- Preview-specific font settings

### 16. Dark Mode Variants for All Themes
Currently only `default` and `light` have full CSS. Extend to:
- Sunset Dark / Sunset Light
- Ocean Dark / Ocean Light
- Forest Dark / Forest Light
- Auto-detect system preference (`prefers-color-scheme`)

---

## 📊 Medium Priority — Rendering & Content

### 17. Footnotes Support
Add footnote rendering for academic/technical writing:
```markdown
This claim needs a source[^1].

[^1]: Source: Research Paper, 2024.
```
- Rendered as superscript links
- Footnotes collected at bottom of preview
- Click to jump between reference and footnote

### 18. Admonitions / Callout Blocks
GitHub/Obsidian style callout blocks:
```markdown
> [!NOTE]
> This is a note callout.

> [!WARNING]
> This is a warning.

> [!TIP]
> Helpful tip here.
```
- Styled with icons and colors per type (note, warning, tip, caution, important)

### 19. Emoji Picker & Shortcode Support
- `:smile:` → 😄 shortcode rendering
- Emoji picker button in toolbar
- Autocomplete popup when typing `:`

### 20. Link Preview Cards
When a bare URL is on its own line, show an Open Graph preview card:
- Fetch title, description, image from the URL
- Render as a styled card in preview
- Fallback to plain link if metadata unavailable

### 21. Mermaid Live Editor Panel
Instead of editing mermaid in raw text only:
- Side panel for mermaid diagram editing
- Syntax highlighting for mermaid
- Error messages inline
- Template gallery (flowchart, sequence, ER, Gantt starters)

### 22. CSV / Data Table Rendering
Support rendering CSV code blocks as formatted tables:
````markdown
```csv
Name,Age,City
Alice,30,NYC
Bob,25,London
```
````
- Auto-detect CSV format
- Render as a styled, sortable table
- Support TSV too

---

## 🔧 Low Priority — Quality of Life

### 23. Command Palette
VS Code-style command palette (`Ctrl+Shift+P`):
- Search all available commands
- Quick access to theme switch, export, format
- Fuzzy search

### 24. Minimap / Document Outline
A small overview sidebar showing:
- Miniature version of the full document
- Click to navigate
- Or a structured outline (headings tree)

### 25. Version History / Snapshots
Local version tracking:
- Auto-snapshot every N minutes
- View diff between versions
- Restore any previous version
- Storage in IndexedDB (larger than localStorage)

### 26. Presentation / Slide Mode
Convert markdown to a slide deck:
- Use `---` as slide separators
- Full-screen presentation mode
- Arrow key navigation
- Speaker notes support (content after `???`)

### 27. Collaborative Editing (Advanced)
Real-time multi-user editing:
- WebSocket or WebRTC-based sync
- Cursor presence indicators
- Conflict resolution
- Share via link

### 28. Plugin / Extension System
Allow users to add custom features:
- Plugin API for custom renderers
- Hook into render pipeline
- Custom toolbar buttons
- Community plugin registry

### 29. Export to More Formats
Expand export capabilities:
- **DOCX** (via pandoc or docx.js)
- **EPUB** (for e-readers)
- **LaTeX** source file
- **Markdown with embedded images** (base64)
- **JSON AST** (parsed markdown tree)

### 30. Accessibility Improvements
- ARIA labels on all interactive elements
- Screen reader announcements for state changes
- High contrast theme option
- Keyboard-only navigation support
- Reduced motion mode (disable shader background)

---

## 📱 Low Priority — Platform Features

### 31. PWA (Progressive Web App)
Make the app installable:
- Service worker for offline support
- App manifest with icon
- Works fully offline after first load
- Cache all CDN libraries locally

### 32. Mobile-Optimized Editor
Current mobile support is basic. Improve with:
- Swipe to switch between editor and preview
- Floating toolbar that follows cursor
- Pinch-to-zoom on preview
- Mobile-friendly find/replace

### 33. Print Stylesheet
A dedicated `@media print` CSS:
- Clean, ink-friendly output
- No UI chrome, no background shader
- Proper page breaks
- Print button in toolbar

---

## 📋 Summary Matrix

| # | Feature | Impact | Effort | Priority |
|---|---------|--------|--------|----------|
| 1 | Keyboard Shortcuts | 🟢 High | 🟢 Low | 🔥 High |
| 2 | Undo/Redo History | 🟢 High | 🟡 Med | 🔥 High |
| 3 | Image Upload | 🟢 High | 🟡 Med | 🔥 High |
| 4 | Tab/Indent Support | 🟢 High | 🟢 Low | 🔥 High |
| 5 | TOC Generator | 🟡 Med | 🟢 Low | 🔥 High |
| 6 | Split Pane Resize | 🟡 Med | 🟢 Low | ✨ Med |
| 7 | Multiple Tabs | 🟡 Med | 🟡 Med | ✨ Med |
| 8 | Table Editor | 🟡 Med | 🟡 Med | ✨ Med |
| 9 | Spellcheck | 🟡 Med | 🟡 Med | ✨ Med |
| 10 | Word Wrap Toggle | 🟡 Med | 🟢 Low | ✨ Med |
| 11 | Zen Mode | 🟡 Med | 🟢 Low | ✨ Med |
| 12 | Drag & Drop Import | 🟡 Med | 🟢 Low | ✨ Med |
| 13 | Custom Themes | 🟡 Med | 🟡 Med | 🎨 Med |
| 14 | Code Theme Picker | 🟢 Low | 🟢 Low | 🎨 Med |
| 15 | Font Customization | 🟢 Low | 🟢 Low | 🎨 Med |
| 16 | Dark Variants | 🟡 Med | 🟡 Med | 🎨 Med |
| 17 | Footnotes | 🟡 Med | 🟢 Low | 📊 Med |
| 18 | Admonitions | 🟡 Med | 🟢 Low | 📊 Med |
| 19 | Emoji Support | 🟢 Low | 🟢 Low | 📊 Med |
| 20 | Link Previews | 🟢 Low | 🟡 Med | 📊 Med |
| 21 | Mermaid Editor | 🟡 Med | 🔴 High | 📊 Med |
| 22 | CSV Tables | 🟢 Low | 🟢 Low | 📊 Med |
| 23 | Command Palette | 🟡 Med | 🟡 Med | 🔧 Low |
| 24 | Minimap/Outline | 🟢 Low | 🟡 Med | 🔧 Low |
| 25 | Version History | 🟡 Med | 🟡 Med | 🔧 Low |
| 26 | Slide Mode | 🟡 Med | 🔴 High | 🔧 Low |
| 27 | Collaboration | 🔴 High | 🔴 High | 🔧 Low |
| 28 | Plugin System | 🔴 High | 🔴 High | 🔧 Low |
| 29 | More Export Formats | 🟡 Med | 🟡 Med | 🔧 Low |
| 30 | Accessibility | 🟢 High | 🟡 Med | 🔧 Low |
| 31 | PWA | 🟡 Med | 🟡 Med | 📱 Low |
| 32 | Mobile Editor | 🟡 Med | 🟡 Med | 📱 Low |
| 33 | Print Stylesheet | 🟢 Low | 🟢 Low | 📱 Low |

---

> **Recommended starting order:** #1 → #4 → #5 → #10 → #11 → #12 → #18 → #17 → #2 → #3
> These give the highest UX impact with the lowest implementation effort.
