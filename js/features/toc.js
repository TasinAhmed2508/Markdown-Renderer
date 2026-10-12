import { subscribe } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const STYLES = `
#toc-panel {
    position: fixed;
    top: 4.5rem;
    right: 0;
    width: 320px;
    height: calc(100vh - 4.5rem);
    z-index: 55;
    background: rgba(13,17,23,0.92);
    backdrop-filter: blur(24px);
    border-left: 1px solid rgba(255,255,255,0.08);
    box-shadow: -8px 0 32px rgba(0,0,0,0.5);
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
    display: flex;
    flex-direction: column;
    font-family: var(--font-system);
}
#toc-panel.open {
    transform: translateX(0);
}
#toc-panel .toc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
#toc-panel .toc-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #e5e7eb;
    letter-spacing: 0.04em;
}
#toc-panel .toc-close {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
}
#toc-panel .toc-close:hover {
    color: #fff;
    background: rgba(255,255,255,0.08);
}
#toc-panel .toc-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
}
#toc-panel .toc-body ul {
    list-style: none;
    margin: 0;
    padding: 0;
}
#toc-panel .toc-body li {
    margin: 0;
}
#toc-panel .toc-body a {
    display: block;
    padding: 6px 10px;
    color: #9ca3af;
    text-decoration: none;
    font-size: 13px;
    border-radius: 6px;
    transition: all 0.15s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
#toc-panel .toc-body a:hover {
    color: #fff;
    background: rgba(99,102,241,0.12);
}
#toc-panel .toc-body a.active {
    color: #a5b4fc;
    background: rgba(99,102,241,0.15);
}
#toc-panel .toc-footer {
    padding: 12px 16px;
    border-top: 1px solid rgba(255,255,255,0.06);
}
#toc-panel .toc-copy-btn {
    width: 100%;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(99,102,241,0.1);
    color: #a5b4fc;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}
#toc-panel .toc-copy-btn:hover {
    background: rgba(99,102,241,0.2);
    border-color: rgba(99,102,241,0.3);
}
#toc-panel .toc-empty {
    color: #6b7280;
    font-size: 13px;
    text-align: center;
    padding: 32px 16px;
}
`;

let panel = null;
let tocBody = null;
let isOpen = false;

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
        const text = el.textContent.trim();
        if (!el.id) el.id = `toc-heading-${i}`;
        return { level, text, id: el.id, el };
    });
}

function buildTOCList(headings) {
    if (!headings.length) return '<div class="toc-empty">No headings found</div>';
    return '<ul>' + headings.map(h => {
        const indent = (h.level - 1) * 16;
        return `<li><a href="#${h.id}" data-toc-target="${h.id}" style="padding-left:${10 + indent}px">${h.text}</a></li>`;
    }).join('') + '</ul>';
}

function tocAsMarkdown(headings) {
    return headings.map(h => {
        const indent = '  '.repeat(h.level - 1);
        return `${indent}- ${h.text}`;
    }).join('\n');
}

function updateTOC() {
    if (!tocBody) return;
    const headings = getHeadings();
    tocBody.innerHTML = buildTOCList(headings);

    tocBody.querySelectorAll('a[data-toc-target]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(a.dataset.tocTarget);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function toggle() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    const btn = document.getElementById('btn-toc');
    if (btn) btn.classList.toggle('active', isOpen);
    if (isOpen) updateTOC();
}

function copyTOCAsMarkdown() {
    const headings = getHeadings();
    const md = tocAsMarkdown(headings);
    navigator.clipboard.writeText(md).then(() => {
        const btn = panel.querySelector('.toc-copy-btn');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = orig; }, 1500);
        }
    }).catch(() => {});
}

export function initTOC() {
    injectStyles();

    // Reuse the toolbar button (index.html already renders it)
    const btn = document.getElementById('btn-toc');
    if (!btn) return;

    // Create panel
    panel = document.createElement('div');
    panel.id = 'toc-panel';
    panel.innerHTML = `
        <div class="toc-header">
            <h3>Table of Contents</h3>
            <button class="toc-close">&times;</button>
        </div>
        <div class="toc-body"></div>
        <div class="toc-footer">
            <button class="toc-copy-btn">Copy as Markdown</button>
        </div>
    `;
    document.body.appendChild(panel);

    tocBody = panel.querySelector('.toc-body');
    btn.addEventListener('click', toggle);
    panel.querySelector('.toc-close').addEventListener('click', toggle);
    panel.querySelector('.toc-copy-btn').addEventListener('click', copyTOCAsMarkdown);

    // Auto-update when content changes
    subscribe(() => {
        if (isOpen) setTimeout(updateTOC, 400);
    });

    if (window.lucide) window.lucide.createIcons();

    registerCommand('toggle-toc', {
        name: 'Toggle Table of Contents',
        shortcut: null,
        icon: 'list',
        category: 'view',
        execute: toggle
    });
}
