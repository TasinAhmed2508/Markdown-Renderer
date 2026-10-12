import { registerCommand } from './commands.js';

const HLJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/';
const STORAGE_KEY = 'code-theme';

const THEMES = [
    { id: 'github-dark', name: 'GitHub Dark' },
    { id: 'monokai', name: 'Monokai' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'nord', name: 'Nord' },
    { id: 'atom-one-dark', name: 'Atom One Dark' },
    { id: 'vs2015', name: 'VS 2015' },
    { id: 'tokyo-night-dark', name: 'Tokyo Night Dark' },
    { id: 'github', name: 'GitHub Light' },
    { id: 'atom-one-light', name: 'Atom One Light' },
    { id: 'vs', name: 'VS Light' }
];

function getHljsLink() {
    return document.querySelector('link[href*="highlight.js"][href*="styles"]');
}

function setTheme(themeId) {
    const link = getHljsLink();
    if (!link) return;
    link.href = `${HLJS_CDN}${themeId}.min.css`;
    localStorage.setItem(STORAGE_KEY, themeId);

    // Re-highlight all code blocks
    requestAnimationFrame(() => {
        document.querySelectorAll('pre code').forEach(block => {
            block.removeAttribute('data-highlighted');
            if (window.hljs) window.hljs.highlightElement(block);
        });
    });

    // Update dropdown if it exists
    const select = document.getElementById('code-theme-select');
    if (select) select.value = themeId;
}

function injectStyles() {
    if (document.getElementById('code-theme-styles')) return;
    const style = document.createElement('style');
    style.id = 'code-theme-styles';
    style.textContent = `
        #code-theme-select {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 6px;
            padding: 5px 8px;
            color: #e0e0e0;
            font-size: 12px;
            cursor: pointer;
            outline: none;
            transition: border-color 0.2s;
        }
        #code-theme-select:focus {
            border-color: rgba(99,102,241,0.4);
        }
        #code-theme-select option {
            background: #1a1a2e;
            color: #e0e0e0;
        }
        [data-theme="light"] #code-theme-select {
            background: #ffffff;
            border-color: #cbd5e1;
            color: #334155;
        }
        [data-theme="light"] #code-theme-select option {
            background: #ffffff;
            color: #334155;
        }
    `;
    document.head.appendChild(style);
}

function createSelect() {
    if (document.getElementById('code-theme-select')) return;

    const saved = localStorage.getItem(STORAGE_KEY) || 'github-dark';
    const select = document.createElement('select');
    select.id = 'code-theme-select';
    select.title = 'Syntax highlight theme';

    THEMES.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        if (t.id === saved) opt.selected = true;
        select.appendChild(opt);
    });

    select.addEventListener('change', () => setTheme(select.value));

    // Mount into the editor toolbar (fallback: navbar actions)
    const host = document.getElementById('editor-toolbar')
        || document.getElementById('app-toolbar');
    if (host) host.appendChild(select);
}

export function initCodeTheme() {
    injectStyles();
    createSelect();

    // Restore saved theme
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setTheme(saved);

    registerCommand('code-theme', {
        name: 'Change Code Theme',
        icon: 'code-2',
        category: 'appearance',
        execute() {
            const select = document.getElementById('code-theme-select');
            if (select) select.focus();
        }
    });
}
