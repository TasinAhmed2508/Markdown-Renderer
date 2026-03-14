import { subscribe } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const STYLES = `
#btn-outline {
    position: fixed;
    bottom: 80px;
    right: 76px;
    z-index: 60;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(13,17,23,0.85);
    backdrop-filter: blur(16px);
    color: #86efac;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}
#btn-outline:hover {
    background: rgba(16,185,129,0.2);
    border-color: rgba(16,185,129,0.4);
    transform: scale(1.05);
}
#btn-outline.active {
    background: rgba(16,185,129,0.25);
    border-color: rgba(16,185,129,0.5);
}
#outline-panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 220px;
    height: 100%;
    z-index: 15;
    background: rgba(13,17,23,0.88);
    backdrop-filter: blur(20px);
    border-right: 1px solid rgba(255,255,255,0.06);
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
    display: flex;
    flex-direction: column;
    font-family: var(--font-system);
    overflow: hidden;
}
#outline-panel.open {
    transform: translateX(0);
}
#outline-panel .outline-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
#outline-panel .outline-header span {
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
#outline-panel .outline-close {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 16px;
    padding: 2px 6px;
    border-radius: 4px;
    transition: color 0.2s, background 0.2s;
}
#outline-panel .outline-close:hover {
    color: #fff;
    background: rgba(255,255,255,0.08);
}
#outline-panel .outline-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}
#outline-panel .outline-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    color: #9ca3af;
    font-size: 12px;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: all 0.15s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
#outline-panel .outline-item:hover {
    color: #e5e7eb;
    background: rgba(255,255,255,0.04);
}
#outline-panel .outline-item.visible {
    color: #86efac;
    border-left-color: #10b981;
    background: rgba(16,185,129,0.08);
}
#outline-panel .outline-level {
    font-size: 9px;
    font-weight: 700;
    color: #6b7280;
    min-width: 18px;
    text-align: center;
    border-radius: 3px;
    background: rgba(255,255,255,0.05);
    padding: 1px 4px;
}
#outline-panel .outline-empty {
    color: #6b7280;
    font-size: 12px;
    text-align: center;
    padding: 24px 14px;
}
`;

let panel = null;
let outlineBody = null;
let isOpen = false;
let observer = null;
let visibleIds = new Set();

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
}

function getHeadings() {
    const output = elements.output;
    if (!output) return [];
    return Array.from(output.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((el, i) => {
        const level = parseInt(el.tagName[1]);
        if (!el.id) el.id = `outline-h-${i}`;
        return { level, text: el.textContent.trim(), id: el.id, el };
    });
}

function setupObserver(headings) {
    if (observer) observer.disconnect();
    visibleIds.clear();

    const canvas = elements.canvas;
    if (!canvas || !headings.length) return;

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) visibleIds.add(entry.target.id);
            else visibleIds.delete(entry.target.id);
        });
        updateHighlights();
    }, { root: canvas, rootMargin: '0px 0px -60% 0px', threshold: 0.1 });

    headings.forEach(h => observer.observe(h.el));
}

function updateHighlights() {
    if (!outlineBody) return;
    outlineBody.querySelectorAll('.outline-item').forEach(item => {
        item.classList.toggle('visible', visibleIds.has(item.dataset.targetId));
    });
}

function updateOutline() {
    if (!outlineBody) return;
    const headings = getHeadings();

    if (!headings.length) {
        outlineBody.innerHTML = '<div class="outline-empty">No headings</div>';
        return;
    }

    outlineBody.innerHTML = headings.map(h => {
        const indent = (h.level - 1) * 12;
        return `<div class="outline-item" data-target-id="${h.id}" style="padding-left:${14 + indent}px">
            <span class="outline-level">H${h.level}</span>
            <span>${h.text}</span>
        </div>`;
    }).join('');

    outlineBody.querySelectorAll('.outline-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = document.getElementById(item.dataset.targetId);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    setupObserver(headings);
}

function toggle() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    const btn = document.getElementById('btn-outline');
    if (btn) btn.classList.toggle('active', isOpen);
    if (isOpen) updateOutline();
}

export function initOutline() {
    injectStyles();

    // Create toggle button
    const btn = document.createElement('button');
    btn.id = 'btn-outline';
    btn.title = 'Document Outline';
    btn.innerHTML = '<i data-lucide="git-branch" style="width:20px;height:20px"></i>';
    document.body.appendChild(btn);

    // Create panel inside preview pane
    const previewPane = elements.canvas?.parentElement;
    if (!previewPane) return;

    panel = document.createElement('div');
    panel.id = 'outline-panel';
    panel.innerHTML = `
        <div class="outline-header">
            <span>Outline</span>
            <button class="outline-close">&times;</button>
        </div>
        <div class="outline-body"></div>
    `;
    previewPane.appendChild(panel);

    outlineBody = panel.querySelector('.outline-body');
    btn.addEventListener('click', toggle);
    panel.querySelector('.outline-close').addEventListener('click', toggle);

    subscribe(() => {
        if (isOpen) setTimeout(updateOutline, 400);
    });

    if (window.lucide) window.lucide.createIcons();

    registerCommand('toggle-outline', {
        name: 'Toggle Document Outline',
        shortcut: null,
        icon: 'git-branch',
        category: 'view',
        execute: toggle
    });
}
