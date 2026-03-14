import { state, setState } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const STORAGE_KEY = 'custom-themes';
const ACTIVE_CUSTOM_THEME_KEY = 'active-custom-theme';

const DEFAULT_COLORS = {
    background: '#0f0f0f',
    text: '#e0e0e0',
    accent: '#6366f1',
    codeBg: '#1a1a2e',
    border: '#2a2a3a'
};

function getCustomThemes() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
}

function saveCustomThemes(themes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
}

function applyCustomColors(colors) {
    const root = document.documentElement;
    root.style.setProperty('--custom-bg', colors.background);
    root.style.setProperty('--custom-text', colors.text);
    root.style.setProperty('--custom-accent', colors.accent);
    root.style.setProperty('--custom-code-bg', colors.codeBg);
    root.style.setProperty('--custom-border', colors.border);

    // Apply directly as CSS overrides
    root.style.setProperty('--bg-primary', colors.background);
    root.style.setProperty('--bg-secondary', colors.codeBg);
    root.style.setProperty('--text-primary', colors.text);
    root.style.setProperty('--border-color', colors.border);

    document.body.style.background = colors.background;
    document.body.style.color = colors.text;

    localStorage.setItem(ACTIVE_CUSTOM_THEME_KEY, JSON.stringify(colors));
}

function clearCustomColors() {
    const root = document.documentElement;
    ['--custom-bg', '--custom-text', '--custom-accent', '--custom-code-bg', '--custom-border',
     '--bg-primary', '--bg-secondary', '--text-primary', '--border-color'].forEach(p => root.style.removeProperty(p));
    document.body.style.background = '';
    document.body.style.color = '';
    localStorage.removeItem(ACTIVE_CUSTOM_THEME_KEY);
}

function injectModalStyles() {
    if (document.getElementById('custom-theme-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'custom-theme-modal-styles';
    style.textContent = `
        #custom-theme-modal {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 9999;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
        }
        #custom-theme-modal.active { display: flex; }
        #custom-theme-modal .modal-content {
            background: rgba(20, 20, 35, 0.92);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 28px;
            width: 420px;
            max-width: 95vw;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 25px 60px rgba(0,0,0,0.5);
            color: #e0e0e0;
        }
        #custom-theme-modal h3 {
            margin: 0 0 20px;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #custom-theme-modal .color-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
        }
        #custom-theme-modal .color-row label {
            font-size: 13px;
            color: #aaa;
        }
        #custom-theme-modal .color-row input[type="color"] {
            width: 40px;
            height: 30px;
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 6px;
            background: transparent;
            cursor: pointer;
            padding: 0;
        }
        #custom-theme-modal .btn-row {
            display: flex;
            gap: 8px;
            margin-top: 18px;
            flex-wrap: wrap;
        }
        #custom-theme-modal button {
            padding: 7px 16px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.06);
            color: #e0e0e0;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s;
        }
        #custom-theme-modal button:hover { background: rgba(255,255,255,0.12); }
        #custom-theme-modal button.primary {
            background: rgba(99,102,241,0.3);
            border-color: rgba(99,102,241,0.4);
        }
        #custom-theme-modal button.primary:hover { background: rgba(99,102,241,0.5); }
        #custom-theme-modal button.danger {
            background: rgba(239,68,68,0.2);
            border-color: rgba(239,68,68,0.3);
        }
        #custom-theme-modal button.danger:hover { background: rgba(239,68,68,0.4); }
        #custom-theme-modal .saved-themes {
            margin-top: 18px;
            border-top: 1px solid rgba(255,255,255,0.08);
            padding-top: 14px;
        }
        #custom-theme-modal .saved-themes h4 {
            font-size: 14px;
            margin: 0 0 10px;
            color: #999;
        }
        #custom-theme-modal .saved-theme-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            border-radius: 8px;
            background: rgba(255,255,255,0.04);
            margin-bottom: 6px;
        }
        #custom-theme-modal .saved-theme-item:hover {
            background: rgba(255,255,255,0.08);
        }
        #custom-theme-modal .theme-name-input {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 8px;
            padding: 7px 12px;
            color: #e0e0e0;
            font-size: 13px;
            width: 100%;
            margin-bottom: 10px;
            outline: none;
        }
        #custom-theme-modal .theme-name-input:focus {
            border-color: rgba(99,102,241,0.4);
        }
        #custom-theme-modal .color-preview-strip {
            display: flex;
            gap: 4px;
            margin-right: 10px;
        }
        #custom-theme-modal .color-preview-strip span {
            width: 14px;
            height: 14px;
            border-radius: 3px;
            border: 1px solid rgba(255,255,255,0.1);
        }

        /* Font settings section */
        #custom-theme-modal .font-section {
            margin-top: 18px;
            border-top: 1px solid rgba(255,255,255,0.08);
            padding-top: 14px;
        }
        #custom-theme-modal .font-section h4 {
            font-size: 14px;
            margin: 0 0 12px;
            color: #999;
        }
        #custom-theme-modal .setting-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }
        #custom-theme-modal .setting-row label {
            font-size: 13px;
            color: #aaa;
        }
        #custom-theme-modal .setting-row select,
        #custom-theme-modal .setting-row input[type="range"] {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 6px;
            padding: 5px 8px;
            color: #e0e0e0;
            font-size: 12px;
            cursor: pointer;
        }
        #custom-theme-modal .setting-row input[type="range"] {
            width: 120px;
            accent-color: #6366f1;
        }
        #custom-theme-modal .range-value {
            font-size: 12px;
            color: #888;
            min-width: 40px;
            text-align: right;
        }
    `;
    document.head.appendChild(style);
}

function createModal() {
    if (document.getElementById('custom-theme-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'custom-theme-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>🎨 Theme Settings</h3>

            <div class="color-row">
                <label>Background</label>
                <input type="color" id="ct-background" value="${DEFAULT_COLORS.background}">
            </div>
            <div class="color-row">
                <label>Text</label>
                <input type="color" id="ct-text" value="${DEFAULT_COLORS.text}">
            </div>
            <div class="color-row">
                <label>Accent</label>
                <input type="color" id="ct-accent" value="${DEFAULT_COLORS.accent}">
            </div>
            <div class="color-row">
                <label>Code Background</label>
                <input type="color" id="ct-codeBg" value="${DEFAULT_COLORS.codeBg}">
            </div>
            <div class="color-row">
                <label>Border</label>
                <input type="color" id="ct-border" value="${DEFAULT_COLORS.border}">
            </div>

            <input type="text" class="theme-name-input" id="ct-name" placeholder="Theme name...">

            <div class="btn-row">
                <button class="primary" id="ct-apply">Apply</button>
                <button id="ct-save">Save Theme</button>
                <button id="ct-reset">Reset to Default</button>
                <button class="danger" id="ct-close">Close</button>
            </div>

            <div class="saved-themes">
                <h4>Saved Themes</h4>
                <div id="ct-saved-list"></div>
            </div>

            <div id="font-settings-section"></div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Color pickers - live preview
    const pickers = ['background', 'text', 'accent', 'codeBg', 'border'];
    pickers.forEach(key => {
        const input = document.getElementById(`ct-${key}`);
        input.addEventListener('input', () => {
            const colors = getCurrentPickerColors();
            applyCustomColors(colors);
        });
    });

    // Apply button
    document.getElementById('ct-apply').addEventListener('click', () => {
        const colors = getCurrentPickerColors();
        applyCustomColors(colors);
    });

    // Save button
    document.getElementById('ct-save').addEventListener('click', () => {
        const name = document.getElementById('ct-name').value.trim();
        if (!name) { document.getElementById('ct-name').focus(); return; }
        const themes = getCustomThemes();
        themes[name] = getCurrentPickerColors();
        saveCustomThemes(themes);
        renderSavedThemes();
        document.getElementById('ct-name').value = '';
    });

    // Reset button
    document.getElementById('ct-reset').addEventListener('click', () => {
        clearCustomColors();
        Object.entries(DEFAULT_COLORS).forEach(([key, val]) => {
            document.getElementById(`ct-${key}`).value = val;
        });
    });

    // Close button
    document.getElementById('ct-close').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    renderSavedThemes();
}

function getCurrentPickerColors() {
    return {
        background: document.getElementById('ct-background').value,
        text: document.getElementById('ct-text').value,
        accent: document.getElementById('ct-accent').value,
        codeBg: document.getElementById('ct-codeBg').value,
        border: document.getElementById('ct-border').value,
    };
}

function renderSavedThemes() {
    const list = document.getElementById('ct-saved-list');
    if (!list) return;
    const themes = getCustomThemes();
    const keys = Object.keys(themes);

    if (keys.length === 0) {
        list.innerHTML = '<div style="font-size:12px;color:#666;padding:6px 0;">No saved themes</div>';
        return;
    }

    list.innerHTML = keys.map(name => {
        const c = themes[name];
        return `
            <div class="saved-theme-item">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div class="color-preview-strip">
                        <span style="background:${c.background}"></span>
                        <span style="background:${c.text}"></span>
                        <span style="background:${c.accent}"></span>
                    </div>
                    <span style="font-size:13px;">${name}</span>
                </div>
                <div style="display:flex;gap:4px;">
                    <button onclick="document.dispatchEvent(new CustomEvent('ct-load',{detail:'${name}'}))">Load</button>
                    <button class="danger" onclick="document.dispatchEvent(new CustomEvent('ct-delete',{detail:'${name}'}))">✕</button>
                </div>
            </div>
        `;
    }).join('');
}

function openModal() {
    createModal();
    const modal = document.getElementById('custom-theme-modal');
    modal.classList.add('active');

    // Restore active custom theme colors to pickers if any
    try {
        const saved = JSON.parse(localStorage.getItem(ACTIVE_CUSTOM_THEME_KEY));
        if (saved) {
            Object.entries(saved).forEach(([key, val]) => {
                const el = document.getElementById(`ct-${key}`);
                if (el) el.value = val;
            });
        }
    } catch {}
}

export function initCustomTheme() {
    injectModalStyles();

    // Listen for load/delete events from saved themes
    document.addEventListener('ct-load', (e) => {
        const themes = getCustomThemes();
        const colors = themes[e.detail];
        if (!colors) return;
        Object.entries(colors).forEach(([key, val]) => {
            const el = document.getElementById(`ct-${key}`);
            if (el) el.value = val;
        });
        applyCustomColors(colors);
    });

    document.addEventListener('ct-delete', (e) => {
        const themes = getCustomThemes();
        delete themes[e.detail];
        saveCustomThemes(themes);
        renderSavedThemes();
    });

    // Restore custom theme on load if one was active
    try {
        const saved = JSON.parse(localStorage.getItem(ACTIVE_CUSTOM_THEME_KEY));
        if (saved) applyCustomColors(saved);
    } catch {}

    registerCommand('theme-settings', {
        name: 'Theme Settings',
        icon: 'palette',
        category: 'appearance',
        execute: openModal
    });
}
