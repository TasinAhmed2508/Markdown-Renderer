# ⚡ TA RenderX - Modular Markdown Renderer

A high-performance, visually stunning Markdown Editor & Renderer built with vanilla JavaScript (ES Modules). Features Glassmorphism UI, real-time preview, Mermaid diagrams, KaTeX math (with ChatGPT format support), and light/dark themes.

## 🚀 Features

### Core
- **Live Preview**: Real-time rendering with sync scrolling
- **Glassmorphism UI**: Modern, frosted-glass aesthetic
- **Aurora Background**: Animated shader-based background (Three.js)
- **Auto-Save**: Persists content, theme, and settings to LocalStorage
- **Dark/Light Mode**: Toggle between themes with beautiful backgrounds

### Editing & Formatting
- **Syntax Highlighting**: Powered by `highlight.js` (GitHub Dark theme)
- **Auto-Formatting**: One-click code cleanup using `Prettier`
- **Editor Toolbar**: Shortcuts for Bold, Italic, Lists, Code, etc.
- **Find & Replace**: Built-in search functionality
- **Typewriter Mode**: Keeps your active line centered
- **Line Numbers**: Auto-syncing line numbers

### Rich Content
- **Math Support**: LaTeX equations via `KaTeX`
  - Standard: `$$...$$`, `\[...\]`, `\(...\)`, `$...$`
  - ChatGPT format: `[...]` bare brackets (indented blocks supported)
- **Diagrams**: 
  - **Mermaid**: Flowcharts, sequences, Gantt charts
  - **PlantUML**: Comprehensive UML diagrams (`uml` or `plantuml` blocks)
  - **Chart.js**: Render bar/line/pie charts from JSON (`chart` or `chartjs` blocks)
- **Smart Embeds**: Auto-converts CodeSandbox and Replit links
- **Premium Tables**: Styled tables with hover effects and gradients

### Code Features
- **Copy Code**: One-click copy button on all code blocks
- **Multi-Language Support**: Syntax highlighting for 100+ languages (Rust, Go, Swift, Kotlin, etc.)
- **Error Handling**: Visual feedback for diagram syntax errors

### Export
- **Export PNG**: High-resolution screenshot capture
- **Export PDF**: Theme-aware A4 PDF generation
- **Save MD**: Download raw `.md` file
- **Copy HTML**: Copy styled HTML to clipboard

## 🛠️ Setup & Usage

Requires a local server (ES Modules need CORS).

```bash
# Option 1: Node.js (Recommended)
npx serve -p 8080

# Option 2: Python
python -m http.server 8080

# Then open http://localhost:8080
```

## 📂 Project Structure

```
TA-RenderX/
├── index.html                 # Entry point (HTML + inline shader)
├── README.md                  # This file
│
├── css/                       # Styling (100 lines max per file)
│   ├── base/                  # Foundation styles
│   │   ├── reset.css          # CSS reset
│   │   ├── scrollbar.css      # Custom scrollbars
│   │   └── variables.css      # CSS custom properties
│   │
│   ├── components/            # UI component styles
│   │   ├── buttons.css        # Metal buttons, tool buttons
│   │   ├── controls.css       # Form controls
│   │   ├── diagrams.css       # Mermaid diagram styling
│   │   ├── editor.css         # Markdown input textarea
│   │   ├── editor-toolbar.css # Toolbar buttons & find/replace
│   │   ├── embeds.css         # Embedded content styling
│   │   ├── glass-pane.css     # Glassmorphism panels
│   │   ├── linenumbers.css    # Editor line numbers
│   │   ├── loader.css         # Loading spinner
│   │   ├── math.css           # KaTeX math typography
│   │   ├── navbar.css         # Top navigation bar
│   │   ├── swatches.css       # Theme color swatches
│   │   └── tables.css         # Premium table styling
│   │
│   ├── layout/                # Page layout
│   │   └── layout.css         # Grid, containers, body styles
│   │
│   ├── responsive/            # Media queries
│   │   └── mobile.css         # Mobile-specific styles
│   │
│   └── themes/                # Theme variations
│       └── light.css          # Light mode overrides
│
├── js/                        # Logic (100 lines max per file)
│   ├── main.js                # App entry, initialization
│   │
│   ├── core/                  # Core rendering pipeline
│   │   ├── state.js           # Global state management
│   │   ├── parser.js          # Marked.js parser configuration
│   │   ├── renderer.js        # Render pipeline orchestration
│   │   ├── math-handler.js    # LaTeX protection/restoration
│   │   └── post-render.js     # KaTeX, Mermaid, embeds post-processing
│   │
│   ├── features/              # Feature modules
│   │   ├── copy.js            # HTML copy to clipboard
│   │   ├── download.js        # Download .md file
│   │   ├── editor-tools.js    # Toolbar formatting buttons
│   │   ├── embeds.js          # CodeSandbox/Replit embeds
│   │   ├── export.js          # PNG/PDF export handlers
│   │   ├── format.js          # Prettier formatting
│   │   ├── linenumbers.js     # Line number sync
│   │   ├── padding.js         # Preview padding control
│   │   ├── pdf-generator.js   # PDF generation (theme-aware)
│   │   ├── scroll.js          # Sync scroll between panes
│   │   ├── search.js          # Find & replace
│   │   ├── shader.js          # Shader initialization (stub)
│   │   ├── statusbar.js       # Word count, read time
│   │   ├── storage.js         # LocalStorage persistence
│   │   ├── theme.js           # Theme switching & toggle
│   │   └── typewriter.js      # Typewriter mode
│   │
│   ├── ui/                    # UI & DOM handling
│   │   ├── dom.js             # DOM element references
│   │   ├── events.js          # Input/output event handlers
│   │   ├── loader.js          # Loader show/hide
│   │   └── search-bar.js      # Search bar UI component
│   │
│   └── utils/                 # Utilities
│       ├── helpers.js         # Debounce, utility functions
│       └── shaders.js         # GLSL shader source code
│
├── tests/                     # Unit tests
│   └── index.html             # Test runner
│
└── .agent/                    # AI agent configuration
    └── workflows/
        └── agent.md           # Development guidelines
```

## 🎨 Theme System

### Dark Mode (Default)
- Aurora shader background
- Dark glass panels
- Light text on dark backgrounds

### Light Mode
- Pastel gradient background (blue → cyan → yellow → pink)
- White glass panels
- Dark text on light backgrounds
- Toggle via sun/moon button in navbar

## 📐 Math Rendering

Supports multiple LaTeX formats including ChatGPT output:

```markdown
Display math (any of these):
$$E = mc^2$$
\[E = mc^2\]
[
E = mc^2
]

Inline math:
\(E = mc^2\)
$E = mc^2$
```

## 🔧 Development Rules

- **Max 100 lines per CSS/JS file**
- Use ES6 modules (`import`/`export`)
- ASCII-only in code
- Preserve existing class names

## 📄 License

MIT
