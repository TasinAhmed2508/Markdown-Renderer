import { registerCommand } from './commands.js';

const STORAGE_KEY = 'font-settings';

const FONT_FAMILIES = [
    { id: 'system', name: 'System Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    { id: 'inter', name: 'Inter', value: '"Inter", sans-serif', google: 'Inter:wght@400;500;600;700' },
    { id: 'jetbrains', name: 'JetBrains Mono', value: '"JetBrains Mono", monospace', google: 'JetBrains+Mono:wght@400;500;600;700' },
    { id: 'fira', name: 'Fira Code', value: '"Fira Code", monospace', google: 'Fira+Code:wght@400;500;600;700' },
    { id: 'source-code', name: 'Source Code Pro', value: '"Source Code Pro", monospace', google: 'Source+Code+Pro:wght@400;500;600;700' },
    { id: 'georgia', name: 'Georgia', value: 'Georgia, serif' },
    { id: 'merriweather', name: 'Merriweather', value: '"Merriweather", serif', google: 'Merriweather:wght@400;700' }
];

const DEFAULTS = {
    previewFont: 'system',
    editorFont: 'system',
    fontSize: 16,
    lineHeight: 1.6
};

function getSettings() {
    try {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
    } catch { return { ...DEFAULTS }; }
}

function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadGoogleFont(spec) {
    if (!spec) return;
    const id = `gfont-${spec.replace(/[^a-z0-9]/gi, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
    document.head.appendChild(link);
}

function getFontValue(fontId) {
    const f = FONT_FAMILIES.find(ff => ff.id === fontId);
    return f ? f.value : FONT_FAMILIES[0].value;
}

function applySettings(settings) {
    const previewFont = FONT_FAMILIES.find(f => f.id === settings.previewFont);
    const editorFont = FONT_FAMILIES.find(f => f.id === settings.editorFont);

    // Load Google Fonts if needed
    if (previewFont?.google) loadGoogleFont(previewFont.google);
    if (editorFont?.google) loadGoogleFont(editorFont.google);

    const root = document.documentElement;
    root.style.setProperty('--font-preview', getFontValue(settings.previewFont));
    root.style.setProperty('--font-editor', getFontValue(settings.editorFont));
    root.style.setProperty('--font-size', settings.fontSize + 'px');
    root.style.setProperty('--line-height', settings.lineHeight);

    // Apply to elements
    const preview = document.getElementById('canvas');
    if (preview) {
        preview.style.fontFamily = getFontValue(settings.previewFont);
        preview.style.fontSize = settings.fontSize + 'px';
        preview.style.lineHeight = settings.lineHeight;
    }

    const editor = document.getElementById('markdown-input');
    if (editor) {
        editor.style.fontFamily = getFontValue(settings.editorFont);
        editor.style.fontSize = settings.fontSize + 'px';
        editor.style.lineHeight = settings.lineHeight;
    }

    // The line-number gutter must use identical metrics or the numbers drift.
    const gutter = document.getElementById('line-numbers');
    if (gutter) {
        gutter.style.fontFamily = getFontValue(settings.editorFont);
        gutter.style.fontSize = settings.fontSize + 'px';
        gutter.style.lineHeight = settings.lineHeight;
    }

    saveSettings(settings);
}

function createFontOptions(selectedId) {
    return FONT_FAMILIES.map(f =>
        `<option value="${f.id}" ${f.id === selectedId ? 'selected' : ''}>${f.name}</option>`
    ).join('');
}

function renderFontControls() {
    const container = document.getElementById('font-settings-section');
    if (!container) return;

    const settings = getSettings();

    container.innerHTML = `
        <div class="font-section">
            <h4>📝 Font Settings</h4>

            <div class="setting-row">
                <label>Preview Font</label>
                <select id="fs-preview-font">${createFontOptions(settings.previewFont)}</select>
            </div>

            <div class="setting-row">
                <label>Editor Font</label>
                <select id="fs-editor-font">${createFontOptions(settings.editorFont)}</select>
            </div>

            <div class="setting-row">
                <label>Font Size</label>
                <input type="range" id="fs-font-size" min="12" max="24" step="1" value="${settings.fontSize}">
                <span class="range-value" id="fs-font-size-val">${settings.fontSize}px</span>
            </div>

            <div class="setting-row">
                <label>Line Height</label>
                <input type="range" id="fs-line-height" min="1.2" max="2.4" step="0.1" value="${settings.lineHeight}">
                <span class="range-value" id="fs-line-height-val">${settings.lineHeight}</span>
            </div>
        </div>
    `;

    // Bind events
    document.getElementById('fs-preview-font').addEventListener('change', (e) => {
        const s = getSettings();
        s.previewFont = e.target.value;
        applySettings(s);
    });

    document.getElementById('fs-editor-font').addEventListener('change', (e) => {
        const s = getSettings();
        s.editorFont = e.target.value;
        applySettings(s);
    });

    document.getElementById('fs-font-size').addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        document.getElementById('fs-font-size-val').textContent = val + 'px';
        const s = getSettings();
        s.fontSize = val;
        applySettings(s);
    });

    document.getElementById('fs-line-height').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('fs-line-height-val').textContent = val.toFixed(1);
        const s = getSettings();
        s.lineHeight = val;
        applySettings(s);
    });
}

// Observe font-settings-section appearance (it's created by custom-theme modal)
function watchForContainer() {
    const observer = new MutationObserver(() => {
        const container = document.getElementById('font-settings-section');
        if (container && !container.dataset.initialized) {
            container.dataset.initialized = 'true';
            renderFontControls();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

export function initFontSettings() {
    // Apply saved settings on load
    const settings = getSettings();
    applySettings(settings);

    watchForContainer();

    registerCommand('font-settings', {
        name: 'Font Settings',
        icon: 'type',
        category: 'appearance',
        execute() {
            // Open the custom theme modal which contains font settings
            const modal = document.getElementById('custom-theme-modal');
            if (modal) {
                modal.classList.add('active');
                renderFontControls();
            }
        }
    });
}
