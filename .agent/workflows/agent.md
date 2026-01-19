---
description: Development guidelines for the Markdown Renderer project
---

# Markdown Renderer Development Workflow

This project uses a strict modular file structure. Follow these rules for all changes.

## File Structure Rules

### CSS Files (`css/`)
- **Max 100 lines per file**
- Organize by purpose:
  - `base/` - Reset, variables, scrollbar
  - `components/` - UI elements (buttons, navbar, editor, etc.)
  - `layout/` - Grid, containers, spacing
  - `responsive/` - Media queries
  - `themes/` - Theme variations

### JS Files (`js/`)
- **Max 100 lines per file**
- Organize by purpose:
  - `core/` - State, parser, renderer pipeline
  - `features/` - Feature modules (export, search, format, etc.)
  - `ui/` - DOM helpers, event handlers, UI components
  - `utils/` - Helpers, utilities

## Adding New Features

1. **Create new file** in appropriate directory
2. **Export functions** using ES6 modules
3. **Import in main.js** and wire up
4. **Add CSS** to component-specific file
5. **Update index.html** CSS links if new CSS file created

## Code Style

- ASCII-only (no Unicode in code unless already present)
- Use ES6 modules (`import`/`export`)
- Preserve existing class names and HTML structure
- Comment complex logic

## Verification Commands

// turbo
```powershell
# Check file line counts (run from project root)
Get-ChildItem -Recurse -Include *.js,*.css | ForEach-Object { 
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    if ($lines -gt 100) { 
        Write-Host "$($_.Name): $lines lines - EXCEEDS LIMIT" -ForegroundColor Red 
    }
}
```

## Module Import Order (main.js)
1. Core modules (state, renderer)
2. UI modules (dom, events, loader)
3. Feature modules (alphabetical)
4. Utils (helpers)
