import { registerCommand, searchCommands } from './commands.js';

const STYLES = `
#command-palette {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: none;
    align-items: flex-start;
    justify-content: center;
    padding-top: min(20vh, 160px);
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(8px);
    font-family: var(--font-system);
}
#command-palette.open {
    display: flex;
}
#command-palette .cp-container {
    width: 520px;
    max-height: 420px;
    background: rgba(13,17,23,0.95);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: cpSlideIn 0.18s ease-out;
}
@keyframes cpSlideIn {
    from { opacity: 0; transform: translateY(-12px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
#command-palette .cp-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
#command-palette .cp-icon {
    color: #6366f1;
    font-size: 16px;
    flex-shrink: 0;
}
#command-palette .cp-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #e5e7eb;
    font-size: 15px;
    font-family: var(--font-system);
}
#command-palette .cp-input::placeholder {
    color: #6b7280;
}
#command-palette .cp-results {
    flex: 1;
    overflow-y: auto;
    padding: 6px 0;
}
#command-palette .cp-category {
    padding: 8px 18px 4px;
    font-size: 10px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}
#command-palette .cp-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 18px;
    cursor: pointer;
    transition: background 0.1s;
}
#command-palette .cp-item:hover,
#command-palette .cp-item.selected {
    background: rgba(99,102,241,0.12);
}
#command-palette .cp-item-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 13px;
    flex-shrink: 0;
}
#command-palette .cp-item.selected .cp-item-icon {
    background: rgba(99,102,241,0.2);
    color: #a5b4fc;
}
#command-palette .cp-item-info {
    flex: 1;
    min-width: 0;
}
#command-palette .cp-item-name {
    font-size: 13px;
    color: #e5e7eb;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
#command-palette .cp-item-cat {
    font-size: 11px;
    color: #6b7280;
}
#command-palette .cp-shortcut {
    font-size: 11px;
    font-family: var(--font-mono);
    color: #6b7280;
    background: rgba(255,255,255,0.06);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.08);
    white-space: nowrap;
}
#command-palette .cp-empty {
    padding: 24px 18px;
    text-align: center;
    color: #6b7280;
    font-size: 13px;
}
#command-palette .cp-footer {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 18px;
    border-top: 1px solid rgba(255,255,255,0.06);
    font-size: 11px;
    color: #6b7280;
}
#command-palette .cp-footer kbd {
    font-family: var(--font-mono);
    font-size: 10px;
    background: rgba(255,255,255,0.06);
    padding: 1px 5px;
    border-radius: 3px;
    border: 1px solid rgba(255,255,255,0.08);
    color: #9ca3af;
}
`;

let overlay = null;
let inputEl = null;
let resultsEl = null;
let selectedIndex = 0;
let currentResults = [];

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
}

function open() {
    overlay.classList.add('open');
    inputEl.value = '';
    selectedIndex = 0;
    renderResults('');
    setTimeout(() => inputEl.focus(), 30);
}

function close() {
    overlay.classList.remove('open');
    inputEl.blur();
}

function isOpen() {
    return overlay.classList.contains('open');
}

function renderResults(query) {
    const commands = searchCommands(query);
    currentResults = commands;
    selectedIndex = Math.min(selectedIndex, Math.max(0, commands.length - 1));

    if (!commands.length) {
        resultsEl.innerHTML = '<div class="cp-empty">No commands found</div>';
        return;
    }

    // Group by category
    const groups = {};
    commands.forEach(cmd => {
        const cat = cmd.category || 'general';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(cmd);
    });

    let html = '';
    let globalIdx = 0;
    for (const [cat, cmds] of Object.entries(groups)) {
        html += `<div class="cp-category">${cat}</div>`;
        for (const cmd of cmds) {
            const sel = globalIdx === selectedIndex ? ' selected' : '';
            const shortcutHtml = cmd.shortcut
                ? `<span class="cp-shortcut">${cmd.shortcut}</span>`
                : '';
            const iconChar = cmd.icon ? cmd.icon.charAt(0).toUpperCase() : '⌘';
            html += `<div class="cp-item${sel}" data-idx="${globalIdx}" data-cmd-id="${cmd.id}">
                <div class="cp-item-icon">${iconChar}</div>
                <div class="cp-item-info">
                    <div class="cp-item-name">${cmd.name}</div>
                    <div class="cp-item-cat">${cat}</div>
                </div>
                ${shortcutHtml}
            </div>`;
            globalIdx++;
        }
    }

    resultsEl.innerHTML = html;

    resultsEl.querySelectorAll('.cp-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.idx);
            executeByIndex(idx);
        });
        item.addEventListener('mouseenter', () => {
            selectedIndex = parseInt(item.dataset.idx);
            updateSelection();
        });
    });
}

function updateSelection() {
    resultsEl.querySelectorAll('.cp-item').forEach((item, i) => {
        item.classList.toggle('selected', i === selectedIndex);
    });
    const sel = resultsEl.querySelector('.cp-item.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
}

function executeByIndex(idx) {
    const cmd = currentResults[idx];
    if (cmd) {
        close();
        try { cmd.execute(); } catch (e) { console.error('Command palette execute error:', e); }
    }
}

export function initCommandPalette() {
    injectStyles();

    overlay = document.createElement('div');
    overlay.id = 'command-palette';
    overlay.innerHTML = `
        <div class="cp-container">
            <div class="cp-input-wrap">
                <span class="cp-icon">⌘</span>
                <input class="cp-input" type="text" placeholder="Type a command..." autocomplete="off" spellcheck="false">
            </div>
            <div class="cp-results"></div>
            <div class="cp-footer">
                <span><kbd>↑↓</kbd> Navigate</span>
                <span><kbd>Enter</kbd> Run</span>
                <span><kbd>Esc</kbd> Close</span>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    inputEl = overlay.querySelector('.cp-input');
    resultsEl = overlay.querySelector('.cp-results');

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    inputEl.addEventListener('input', () => {
        selectedIndex = 0;
        renderResults(inputEl.value);
    });

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
            updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            executeByIndex(selectedIndex);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            close();
        }
    });

    registerCommand('open-command-palette', {
        name: 'Open Command Palette',
        shortcut: 'ctrl+shift+p',
        icon: 'terminal',
        category: 'general',
        execute: () => {
            if (isOpen()) close();
            else open();
        }
    });
}
