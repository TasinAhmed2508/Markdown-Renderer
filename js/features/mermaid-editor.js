import { state, setState } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const TEMPLATES = {
    flowchart: `graph TD
    A[Start] --> B{Decision}
    B -- Yes --> C[Process]
    B -- No --> D[End]
    C --> D`,
    sequence: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob
    B-->>A: Hi Alice
    A->>B: How are you?
    B-->>A: Good thanks!`,
    class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +fetch()
    }
    Animal <|-- Dog`,
    er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        int id
        string name
    }
    ORDER {
        int id
        date created
    }`,
    gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
    Task A :a1, 2024-01-01, 30d
    Task B :after a1, 20d
    section Phase 2
    Task C :2024-02-20, 25d`,
    pie: `pie title Distribution
    "Category A" : 40
    "Category B" : 30
    "Category C" : 20
    "Other" : 10`
};

const STYLES = `
#mermaid-editor-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 480px;
    height: 100vh;
    z-index: 56;
    background: rgba(13,17,23,0.95);
    backdrop-filter: blur(24px);
    border-left: 1px solid rgba(255,255,255,0.08);
    box-shadow: -8px 0 32px rgba(0,0,0,0.5);
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
    display: flex;
    flex-direction: column;
    font-family: var(--font-system);
}
#mermaid-editor-panel.open {
    transform: translateX(0);
}
.me-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.me-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #e5e7eb;
}
.me-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}
.me-close-btn {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
}
.me-close-btn:hover {
    color: #fff;
    background: rgba(255,255,255,0.08);
}
.me-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
}
.me-toolbar label {
    font-size: 11px;
    color: #6b7280;
    font-weight: 500;
}
.me-toolbar select {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    color: #e5e7eb;
    padding: 4px 8px;
    font-size: 12px;
    font-family: var(--font-system);
    outline: none;
    cursor: pointer;
}
.me-toolbar select option {
    background: #0d1117;
    color: #e5e7eb;
}
.me-code-wrap {
    flex: 0 0 40%;
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.me-code-label {
    padding: 8px 18px 4px;
    font-size: 10px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
.me-code {
    flex: 1;
    resize: none;
    background: rgba(0,0,0,0.2);
    border: none;
    outline: none;
    padding: 10px 18px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: #d1d5db;
    line-height: 1.5;
}
.me-preview-wrap {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
}
.me-preview-label {
    padding: 8px 18px 4px;
    font-size: 10px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
.me-preview {
    flex: 1;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    background: rgba(255,255,255,0.02);
}
.me-preview svg {
    max-width: 100%;
    height: auto;
}
.me-error {
    padding: 8px 18px;
    font-size: 11px;
    color: #f43f5e;
    background: rgba(244,63,94,0.08);
    min-height: 0;
    overflow: hidden;
    transition: all 0.2s;
}
.me-error:empty {
    padding: 0;
}
.me-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid rgba(255,255,255,0.06);
}
.me-footer button {
    padding: 7px 18px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}
.me-footer .me-cancel-btn {
    background: rgba(255,255,255,0.04);
    color: #9ca3af;
}
.me-footer .me-cancel-btn:hover {
    background: rgba(255,255,255,0.08);
    color: #e5e7eb;
}
.me-footer .me-apply-btn {
    background: rgba(99,102,241,0.2);
    color: #a5b4fc;
    border-color: rgba(99,102,241,0.3);
}
.me-footer .me-apply-btn:hover {
    background: rgba(99,102,241,0.3);
    color: #fff;
}
.me-edit-float-btn {
    position: absolute;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(99,102,241,0.3);
    background: rgba(13,17,23,0.9);
    backdrop-filter: blur(12px);
    color: #a5b4fc;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    z-index: 20;
    transition: all 0.15s;
    display: none;
    font-family: var(--font-system);
}
.me-edit-float-btn:hover {
    background: rgba(99,102,241,0.2);
    color: #fff;
}
`;

let panelEl = null;
let codeEl = null;
let previewEl = null;
let errorEl = null;
let selectEl = null;
let floatBtn = null;
let isOpen = false;
let debounceTimer = null;
let currentBlockRange = null;
let mermaidCounter = 0;

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
}

function findMermaidBlockAtCursor() {
    const textarea = elements.input;
    if (!textarea) return null;

    const text = textarea.value;
    const cursor = textarea.selectionStart;
    const lines = text.split('\n');

    let pos = 0;
    let blockStart = -1;
    let blockEnd = -1;
    let inMermaid = false;
    let startLine = -1;

    for (let i = 0; i < lines.length; i++) {
        const lineStart = pos;
        const lineEnd = pos + lines[i].length;

        if (/^```mermaid/i.test(lines[i].trim()) && !inMermaid) {
            inMermaid = true;
            blockStart = lineStart;
            startLine = i;
        } else if (inMermaid && lines[i].trim() === '```') {
            blockEnd = lineEnd;
            if (cursor >= blockStart && cursor <= blockEnd) {
                // Extract content between opening and closing
                const contentLines = lines.slice(startLine + 1, i);
                return {
                    start: blockStart,
                    end: blockEnd,
                    content: contentLines.join('\n'),
                    startLine: startLine,
                    endLine: i
                };
            }
            inMermaid = false;
            blockStart = -1;
        }

        pos = lineEnd + 1; // +1 for newline
    }

    return null;
}

async function renderPreview(code) {
    if (!previewEl || !code.trim()) {
        if (previewEl) previewEl.innerHTML = '<span style="color:#6b7280;font-size:12px;">Enter mermaid code...</span>';
        if (errorEl) errorEl.textContent = '';
        return;
    }

    try {
        if (!window.mermaid) {
            errorEl.textContent = 'Mermaid library not loaded';
            return;
        }

        mermaidCounter++;
        const id = `me-preview-${mermaidCounter}`;
        const { svg } = await window.mermaid.render(id, code);
        previewEl.innerHTML = svg;
        errorEl.textContent = '';
    } catch (e) {
        errorEl.textContent = e.message || 'Invalid diagram syntax';
        // Remove any broken render elements
        const broken = document.getElementById(`me-preview-${mermaidCounter}`);
        if (broken) broken.remove();
    }
}

function debouncedRender() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        renderPreview(codeEl.value);
    }, 500);
}

function openPanel(code, blockRange) {
    currentBlockRange = blockRange;
    codeEl.value = code || '';
    isOpen = true;
    panelEl.classList.add('open');
    renderPreview(code || '');
}

function closePanel() {
    isOpen = false;
    panelEl.classList.remove('open');
    currentBlockRange = null;
    errorEl.textContent = '';
}

function applyChanges() {
    const textarea = elements.input;
    if (!textarea || !currentBlockRange) { closePanel(); return; }

    const text = textarea.value;
    const newBlock = '```mermaid\n' + codeEl.value + '\n```';
    const newText = text.substring(0, currentBlockRange.start) + newBlock + text.substring(currentBlockRange.end);
    textarea.value = newText;
    setState({ markdown: newText });
    closePanel();
}

function handleTemplateChange() {
    const template = selectEl.value;
    if (template && TEMPLATES[template]) {
        codeEl.value = TEMPLATES[template];
        debouncedRender();
    }
}

function setupFloatingButton() {
    const textarea = elements.input;
    if (!textarea) return;

    floatBtn = document.createElement('button');
    floatBtn.className = 'me-edit-float-btn';
    floatBtn.textContent = '✎ Edit Diagram';
    textarea.parentElement.style.position = 'relative';
    textarea.parentElement.appendChild(floatBtn);

    let checkTimer = null;
    const checkCursor = () => {
        const block = findMermaidBlockAtCursor();
        if (block) {
            floatBtn.style.display = 'block';
            // Position near top-right of editor
            floatBtn.style.top = '8px';
            floatBtn.style.right = '8px';
            floatBtn._blockData = block;
        } else {
            floatBtn.style.display = 'none';
            floatBtn._blockData = null;
        }
    };

    textarea.addEventListener('click', checkCursor);
    textarea.addEventListener('keyup', () => {
        clearTimeout(checkTimer);
        checkTimer = setTimeout(checkCursor, 300);
    });

    floatBtn.addEventListener('click', () => {
        if (floatBtn._blockData) {
            openPanel(floatBtn._blockData.content, floatBtn._blockData);
        }
    });
}

export function initMermaidEditor() {
    injectStyles();

    panelEl = document.createElement('div');
    panelEl.id = 'mermaid-editor-panel';
    panelEl.innerHTML = `
        <div class="me-header">
            <h3>Mermaid Editor</h3>
            <div class="me-header-actions">
                <button class="me-close-btn">&times;</button>
            </div>
        </div>
        <div class="me-toolbar">
            <label>Template:</label>
            <select>
                <option value="">— Select —</option>
                <option value="flowchart">Flowchart</option>
                <option value="sequence">Sequence</option>
                <option value="class">Class Diagram</option>
                <option value="er">ER Diagram</option>
                <option value="gantt">Gantt Chart</option>
                <option value="pie">Pie Chart</option>
            </select>
        </div>
        <div class="me-code-wrap">
            <div class="me-code-label">Code</div>
            <textarea class="me-code" spellcheck="false" placeholder="Enter mermaid diagram code..."></textarea>
        </div>
        <div class="me-error"></div>
        <div class="me-preview-wrap">
            <div class="me-preview-label">Preview</div>
            <div class="me-preview"></div>
        </div>
        <div class="me-footer">
            <button class="me-cancel-btn">Cancel</button>
            <button class="me-apply-btn">Apply</button>
        </div>
    `;
    document.body.appendChild(panelEl);

    codeEl = panelEl.querySelector('.me-code');
    previewEl = panelEl.querySelector('.me-preview');
    errorEl = panelEl.querySelector('.me-error');
    selectEl = panelEl.querySelector('.me-toolbar select');

    panelEl.querySelector('.me-close-btn').addEventListener('click', closePanel);
    panelEl.querySelector('.me-cancel-btn').addEventListener('click', closePanel);
    panelEl.querySelector('.me-apply-btn').addEventListener('click', applyChanges);
    codeEl.addEventListener('input', debouncedRender);
    selectEl.addEventListener('change', handleTemplateChange);

    setupFloatingButton();

    registerCommand('open-mermaid-editor', {
        name: 'Edit Mermaid Diagram',
        shortcut: null,
        icon: 'git-merge',
        category: 'editor',
        execute: () => {
            const block = findMermaidBlockAtCursor();
            if (block) {
                openPanel(block.content, block);
            } else {
                // Open with empty / template
                const textarea = elements.input;
                if (textarea) {
                    const template = TEMPLATES.flowchart;
                    const insertion = '\n```mermaid\n' + template + '\n```\n';
                    const pos = textarea.selectionStart;
                    const text = textarea.value;
                    const newText = text.substring(0, pos) + insertion + text.substring(pos);
                    textarea.value = newText;
                    setState({ markdown: newText });

                    // Now find and open the block
                    textarea.selectionStart = pos + 1;
                    textarea.selectionEnd = pos + 1;
                    const newBlock = findMermaidBlockAtCursor();
                    if (newBlock) openPanel(newBlock.content, newBlock);
                }
            }
        }
    });
}
