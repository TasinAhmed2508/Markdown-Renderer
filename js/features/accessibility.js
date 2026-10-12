import { registerCommand } from './commands.js';

let highContrastEnabled = false;

function addAriaLabels() {
    const labels = {
        'btn-format': 'Format markdown',
        'btn-copy': 'Copy HTML to clipboard',
        'btn-export-trigger': 'Open export menu',
        'btn-export-png': 'Export as PNG image',
        'btn-export-html': 'Export as HTML',
        'btn-export-pdf': 'Export as PDF',
        'btn-download-md': 'Save markdown file',
        'btn-theme-toggle': 'Toggle theme',
        'btn-find-toggle': 'Toggle search',
        'btn-typewriter': 'Toggle typewriter mode',
        'btn-word-wrap': 'Toggle word wrap',
        'btn-spellcheck': 'Toggle spellcheck',
        'btn-zen-mode': 'Toggle zen mode',
        'btn-toc': 'Toggle table of contents',
        'btn-outline': 'Toggle document outline',
        'btn-slides': 'Start presentation mode',
        'btn-version-history': 'Toggle version history',
        'btn-settings': 'Open settings',
        'btn-share': 'Share document',
        'markdown-input': 'Markdown editor'
    };
    for (const [id, label] of Object.entries(labels)) {
        const el = document.getElementById(id);
        if (el && !el.getAttribute('aria-label')) {
            el.setAttribute('aria-label', label);
        }
    }
}

function addRoles() {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.setAttribute('role', 'navigation');

    const toolbar = document.getElementById('editor-toolbar');
    if (toolbar) toolbar.setAttribute('role', 'toolbar');

    const output = document.getElementById('markdown-output');
    if (output) output.setAttribute('role', 'document');

    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        if (!btn.getAttribute('role')) btn.setAttribute('role', 'button');
    });
}

function createSkipLink() {
    const link = document.createElement('a');
    link.href = '#markdown-input';
    link.textContent = 'Skip to editor';
    link.className = 'skip-to-content';
    Object.assign(link.style, {
        position: 'absolute', top: '-40px', left: '0', background: '#000',
        color: '#fff', padding: '8px 16px', zIndex: '10000', fontSize: '14px',
        transition: 'top 0.2s'
    });
    link.addEventListener('focus', () => { link.style.top = '0'; });
    link.addEventListener('blur', () => { link.style.top = '-40px'; });
    document.body.prepend(link);
}

function createLiveRegion() {
    const region = document.createElement('div');
    region.id = 'aria-live-status';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    Object.assign(region.style, {
        position: 'absolute', width: '1px', height: '1px',
        overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap'
    });
    document.body.appendChild(region);
}

export function announceStatus(message) {
    const region = document.getElementById('aria-live-status');
    if (region) {
        region.textContent = '';
        requestAnimationFrame(() => { region.textContent = message; });
    }
}

function handleReducedMotion() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    function apply(matches) {
        const canvas = document.getElementById('canvas-container');
        if (canvas && matches) {
            canvas.style.display = 'none';
        }
    }
    apply(mq.matches);
    mq.addEventListener('change', (e) => apply(e.matches));
}

function toggleHighContrast() {
    highContrastEnabled = !highContrastEnabled;
    document.body.classList.toggle('high-contrast', highContrastEnabled);
    announceStatus(highContrastEnabled ? 'High contrast mode enabled' : 'High contrast mode disabled');
}

export function initAccessibility() {
    addAriaLabels();
    addRoles();
    createSkipLink();
    createLiveRegion();
    handleReducedMotion();

    registerCommand('toggle-high-contrast', {
        name: 'Toggle High Contrast',
        icon: 'contrast',
        category: 'accessibility',
        execute: toggleHighContrast
    });

    registerCommand('announce-word-count', {
        name: 'Announce Word Count',
        icon: 'hash',
        category: 'accessibility',
        execute: () => {
            const wc = document.getElementById('word-count');
            if (wc) announceStatus(wc.textContent);
        }
    });
}
