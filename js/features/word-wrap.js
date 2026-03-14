import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const STORAGE_KEY = 'ta-renderx-word-wrap';
let enabled = false;

function applyWrap(textarea) {
    if (!textarea) return;
    textarea.style.whiteSpace = enabled ? 'pre-wrap' : 'pre';
    textarea.style.wordBreak = enabled ? 'break-word' : 'normal';
}

function updateButton() {
    const btn = document.getElementById('btn-word-wrap');
    if (btn) {
        btn.classList.toggle('active', enabled);
        btn.title = enabled ? 'Word Wrap: On' : 'Word Wrap: Off';
    }
}

function toggle() {
    enabled = !enabled;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
    applyWrap(elements.input);
    updateButton();
}

export function initWordWrap() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
        enabled = JSON.parse(saved);
    }

    applyWrap(elements.input);
    updateButton();

    const btn = document.getElementById('btn-word-wrap');
    if (btn) btn.addEventListener('click', toggle);

    registerCommand('toggle-word-wrap', {
        name: 'Toggle Word Wrap',
        shortcut: 'alt+z',
        icon: 'wrap-text',
        category: 'editor',
        execute: toggle
    });
}
