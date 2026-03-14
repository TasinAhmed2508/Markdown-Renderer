import { state } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const STYLES = `
#btn-slides {
    position: fixed;
    bottom: 80px;
    right: 180px;
    z-index: 60;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(13,17,23,0.85);
    backdrop-filter: blur(16px);
    color: #f472b6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}
#btn-slides:hover {
    background: rgba(244,114,182,0.15);
    border-color: rgba(244,114,182,0.3);
    transform: scale(1.05);
}
#slide-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: #0a0a0f;
    display: none;
    flex-direction: column;
    font-family: var(--font-system);
}
#slide-overlay.open {
    display: flex;
}
.slide-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
    transition: width 0.4s cubic-bezier(0.22,1,0.36,1);
    z-index: 10;
}
.slide-content-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}
.slide-page {
    width: 100%;
    max-width: 900px;
    padding: 60px 80px;
    opacity: 0;
    transform: translateX(40px);
    transition: opacity 0.4s ease, transform 0.4s ease;
    position: absolute;
}
.slide-page.active {
    opacity: 1;
    transform: translateX(0);
    position: relative;
}
.slide-page.exit-left {
    opacity: 0;
    transform: translateX(-40px);
}
.slide-page .markdown-body {
    background: transparent !important;
    color: #e5e7eb;
    font-size: 1.3em;
    line-height: 1.7;
}
.slide-page .markdown-body h1 {
    font-size: 2.8em;
    background: linear-gradient(135deg, #a5b4fc, #c084fc, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5em;
}
.slide-page .markdown-body h2 {
    font-size: 2em;
    color: #c7d2fe;
}
.slide-page .markdown-body h3 {
    font-size: 1.5em;
    color: #a5b4fc;
}
.slide-page .markdown-body code {
    background: rgba(99,102,241,0.15);
    padding: 2px 6px;
    border-radius: 4px;
}
.slide-page .markdown-body pre {
    background: rgba(0,0,0,0.4) !important;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 20px;
}
.slide-nav-left, .slide-nav-right {
    position: absolute;
    top: 0;
    width: 15%;
    height: 100%;
    cursor: pointer;
    z-index: 5;
}
.slide-nav-left { left: 0; }
.slide-nav-right { right: 0; }
.slide-nav-left:hover { background: linear-gradient(90deg, rgba(255,255,255,0.02), transparent); }
.slide-nav-right:hover { background: linear-gradient(-90deg, rgba(255,255,255,0.02), transparent); }
.slide-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 16px 24px;
    position: relative;
    z-index: 10;
}
.slide-counter {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
}
.slide-exit-btn {
    position: absolute;
    top: 16px;
    right: 20px;
    z-index: 10;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: #9ca3af;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
    font-family: var(--font-system);
}
.slide-exit-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
}
.slide-notes-panel {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 200px;
    background: rgba(13,17,23,0.95);
    backdrop-filter: blur(16px);
    border-top: 1px solid rgba(255,255,255,0.08);
    padding: 16px 24px;
    overflow-y: auto;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    z-index: 15;
    font-size: 14px;
    color: #9ca3af;
    line-height: 1.6;
}
.slide-notes-panel.open {
    transform: translateY(0);
}
.slide-notes-label {
    font-size: 10px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
}
`;

let overlay = null;
let slides = [];
let currentSlide = 0;
let isActive = false;

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
}

function parseSlides(markdown) {
    // Split by --- (horizontal rule) on its own line
    const parts = markdown.split(/\n---\n/);
    return parts.map(part => {
        // Check for speaker notes after ???
        const notesSplit = part.split(/\n\?\?\?\n/);
        return {
            content: notesSplit[0].trim(),
            notes: notesSplit[1] ? notesSplit[1].trim() : ''
        };
    }).filter(s => s.content);
}

function renderMarkdown(text) {
    if (window.marked) {
        return window.marked.parse(text);
    }
    // Fallback: basic escape
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

function renderSlide(index) {
    if (index < 0 || index >= slides.length) return;

    const contentArea = overlay.querySelector('.slide-content-area');
    const existing = contentArea.querySelector('.slide-page.active');

    if (existing) {
        existing.classList.remove('active');
        existing.classList.add('exit-left');
        setTimeout(() => existing.remove(), 400);
    }

    const slide = slides[index];
    const page = document.createElement('div');
    page.className = 'slide-page';
    page.innerHTML = `<div class="markdown-body">${renderMarkdown(slide.content)}</div>`;
    contentArea.appendChild(page);

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => page.classList.add('active'));
    });

    currentSlide = index;

    // Update counter
    overlay.querySelector('.slide-counter').textContent = `${index + 1} / ${slides.length}`;

    // Update progress
    const progress = ((index + 1) / slides.length) * 100;
    overlay.querySelector('.slide-progress').style.width = progress + '%';

    // Update notes
    const notesPanel = overlay.querySelector('.slide-notes-panel');
    const notesContent = notesPanel.querySelector('.slide-notes-content');
    if (slide.notes) {
        notesContent.innerHTML = renderMarkdown(slide.notes);
    } else {
        notesContent.textContent = 'No speaker notes for this slide.';
    }

    // Highlight code if hljs is available
    if (window.hljs) {
        page.querySelectorAll('pre code').forEach(block => {
            window.hljs.highlightElement(block);
        });
    }
}

function goNext() {
    if (currentSlide < slides.length - 1) renderSlide(currentSlide + 1);
}

function goPrev() {
    if (currentSlide > 0) renderSlide(currentSlide - 1);
}

function startPresentation() {
    const markdown = elements.input?.value || state.markdown;
    slides = parseSlides(markdown);

    if (!slides.length) {
        slides = [{ content: markdown, notes: '' }];
    }

    currentSlide = 0;
    isActive = true;
    overlay.classList.add('open');

    // Clear any existing slides
    const contentArea = overlay.querySelector('.slide-content-area');
    contentArea.querySelectorAll('.slide-page').forEach(p => p.remove());

    renderSlide(0);
}

function exitPresentation() {
    isActive = false;
    overlay.classList.remove('open');

    // Hide notes
    overlay.querySelector('.slide-notes-panel').classList.remove('open');
}

function toggleNotes() {
    overlay.querySelector('.slide-notes-panel').classList.toggle('open');
}

function handleKeydown(e) {
    if (!isActive) return;

    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
            e.preventDefault();
            goNext();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            goPrev();
            break;
        case 'Escape':
            e.preventDefault();
            exitPresentation();
            break;
        case 'n':
        case 'N':
            e.preventDefault();
            toggleNotes();
            break;
        case 'Home':
            e.preventDefault();
            renderSlide(0);
            break;
        case 'End':
            e.preventDefault();
            renderSlide(slides.length - 1);
            break;
    }
}

export function initSlides() {
    injectStyles();

    // Create toggle button
    const btn = document.createElement('button');
    btn.id = 'btn-slides';
    btn.title = 'Presentation Mode';
    btn.innerHTML = '<i data-lucide="presentation" style="width:20px;height:20px"></i>';
    document.body.appendChild(btn);

    // Create overlay
    overlay = document.createElement('div');
    overlay.id = 'slide-overlay';
    overlay.innerHTML = `
        <div class="slide-progress" style="width:0%"></div>
        <button class="slide-exit-btn">ESC Exit</button>
        <div class="slide-content-area">
            <div class="slide-nav-left"></div>
            <div class="slide-nav-right"></div>
        </div>
        <div class="slide-footer">
            <span class="slide-counter">0 / 0</span>
        </div>
        <div class="slide-notes-panel">
            <div class="slide-notes-label">Speaker Notes</div>
            <div class="slide-notes-content">No speaker notes for this slide.</div>
        </div>
    `;
    document.body.appendChild(overlay);

    btn.addEventListener('click', startPresentation);
    overlay.querySelector('.slide-exit-btn').addEventListener('click', exitPresentation);
    overlay.querySelector('.slide-nav-left').addEventListener('click', goPrev);
    overlay.querySelector('.slide-nav-right').addEventListener('click', goNext);

    document.addEventListener('keydown', handleKeydown);

    if (window.lucide) window.lucide.createIcons();

    registerCommand('start-presentation', {
        name: 'Start Presentation',
        shortcut: 'ctrl+shift+f5',
        icon: 'presentation',
        category: 'view',
        execute: startPresentation
    });

    registerCommand('exit-presentation', {
        name: 'Exit Presentation',
        shortcut: null,
        icon: 'x',
        category: 'view',
        execute: exitPresentation
    });
}
