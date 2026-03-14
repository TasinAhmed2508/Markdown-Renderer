import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const STORAGE_KEY = 'ta-renderx-spellcheck';
let enabled = false;

function apply(textarea) {
    if (!textarea) return;
    textarea.setAttribute('spellcheck', String(enabled));
}

function updateButton() {
    const btn = document.getElementById('btn-spellcheck');
    if (btn) {
        btn.classList.toggle('active', enabled);
        btn.title = enabled ? 'Spellcheck: On' : 'Spellcheck: Off';
    }
}

function toggle() {
    enabled = !enabled;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
    apply(elements.input);
    updateButton();
}

export function initSpellcheck() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
        enabled = JSON.parse(saved);
    }

    apply(elements.input);
    updateButton();

    const btn = document.getElementById('btn-spellcheck');
    if (btn) btn.addEventListener('click', toggle);

    registerCommand('toggle-spellcheck', {
        name: 'Toggle Spellcheck',
        icon: 'spell-check',
        category: 'editor',
        execute: toggle
    });
}
