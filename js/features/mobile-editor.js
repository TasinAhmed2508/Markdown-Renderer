/**
 * Mobile Editor Module
 * Enhanced mobile editing with swipe gestures, floating toggle, and selection toolbar
 */

import { state, setState } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const MOBILE_BREAKPOINT = 768;
const SWIPE_THRESHOLD = 50;

let currentPane = 'editor'; // 'editor' | 'preview'

function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
}

function switchPane(pane) {
    currentPane = pane;
    const editorPane = document.querySelector('.glass-pane.border-t');
    const previewPane = document.querySelector('.glass-pane.relative.overflow-hidden');
    if (!editorPane || !previewPane) return;

    if (pane === 'preview') {
        editorPane.style.display = 'none';
        previewPane.style.display = 'flex';
    } else {
        editorPane.style.display = 'flex';
        previewPane.style.display = 'none';
    }

    const toggleBtn = document.getElementById('mobile-pane-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = pane === 'editor'
            ? '<i data-lucide="eye" class="w-5 h-5"></i>'
            : '<i data-lucide="edit-3" class="w-5 h-5"></i>';
        if (window.lucide) window.lucide.createIcons();
    }
}

function initSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (!isMobile()) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Only register horizontal swipes
        if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) return;

        if (deltaX < 0) {
            switchPane('preview');
        } else {
            switchPane('editor');
        }
    }, { passive: true });
}

function createToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'mobile-pane-toggle';
    btn.className = 'mobile-pane-toggle';
    btn.innerHTML = '<i data-lucide="eye" class="w-5 h-5"></i>';
    btn.title = 'Switch Pane';
    btn.addEventListener('click', () => {
        switchPane(currentPane === 'editor' ? 'preview' : 'editor');
    });
    document.body.appendChild(btn);
    if (window.lucide) window.lucide.createIcons();
}

function createSelectionToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'mobile-format-toolbar';
    toolbar.className = 'mobile-format-toolbar';
    toolbar.innerHTML = `
        <button data-fmt="bold" title="Bold"><i class="fas fa-bold"></i></button>
        <button data-fmt="italic" title="Italic"><i class="fas fa-italic"></i></button>
        <button data-fmt="code" title="Code"><i class="fas fa-code"></i></button>
        <button data-fmt="link" title="Link"><i class="fas fa-link"></i></button>
    `;
    toolbar.style.display = 'none';
    document.body.appendChild(toolbar);

    toolbar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-fmt]');
        if (!btn) return;
        const input = elements.input;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        const selected = text.substring(start, end);
        let replacement = selected;

        switch (btn.dataset.fmt) {
            case 'bold': replacement = `**${selected}**`; break;
            case 'italic': replacement = `*${selected}*`; break;
            case 'code': replacement = `\`${selected}\``; break;
            case 'link': replacement = `[${selected}](url)`; break;
        }

        input.value = text.substring(0, start) + replacement + text.substring(end);
        setState({ markdown: input.value });
        toolbar.style.display = 'none';
    });

    document.addEventListener('selectionchange', () => {
        if (!isMobile()) return;
        const input = elements.input;
        if (!input || document.activeElement !== input) {
            toolbar.style.display = 'none';
            return;
        }
        const start = input.selectionStart;
        const end = input.selectionEnd;
        if (start === end) {
            toolbar.style.display = 'none';
            return;
        }

        const rect = input.getBoundingClientRect();
        toolbar.style.display = 'flex';
        toolbar.style.left = `${rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2)}px`;
        toolbar.style.top = `${rect.top - 50}px`;
    });
}

function injectMobileStyles() {
    const style = document.createElement('style');
    style.id = 'mobile-editor-styles';
    style.textContent = `
        .mobile-pane-toggle {
            display: none;
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 1000;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(99, 102, 241, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            backdrop-filter: blur(10px);
            transition: transform 0.2s, background 0.2s;
        }
        .mobile-pane-toggle:active { transform: scale(0.9); }

        .mobile-format-toolbar {
            position: fixed;
            z-index: 1001;
            background: rgba(13, 17, 23, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            padding: 4px;
            gap: 2px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(12px);
        }
        .mobile-format-toolbar button {
            width: 36px;
            height: 36px;
            border: none;
            background: transparent;
            color: #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
        }
        .mobile-format-toolbar button:active {
            background: rgba(99, 102, 241, 0.3);
        }

        @media (max-width: 767px) {
            .mobile-pane-toggle { display: flex; }
        }
    `;
    document.head.appendChild(style);
}

export function initMobileEditor() {
    injectMobileStyles();
    initSwipeGestures();
    createToggleButton();
    createSelectionToolbar();

    registerCommand('toggle-mobile-pane', {
        name: 'Toggle Mobile Pane',
        icon: 'smartphone',
        category: 'mobile',
        execute() { switchPane(currentPane === 'editor' ? 'preview' : 'editor'); }
    });

    console.log('Mobile Editor initialized');
}
