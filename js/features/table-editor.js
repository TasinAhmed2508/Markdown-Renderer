import { state, setState } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const STYLES = `
#table-editor-overlay {
    position: fixed;
    inset: 0;
    z-index: 9998;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
    font-family: var(--font-system);
}
#table-editor-overlay.open {
    display: flex;
}
#table-editor-overlay .te-modal {
    width: 700px;
    max-width: 90vw;
    max-height: 80vh;
    background: rgba(13,17,23,0.96);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.7);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: teSlideIn 0.2s ease-out;
}
@keyframes teSlideIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
.te-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.te-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #e5e7eb;
}
.te-header .te-close-btn {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.15s;
}
.te-header .te-close-btn:hover {
    color: #fff;
    background: rgba(255,255,255,0.08);
}
.te-toolbar {
    display: flex;
    gap: 6px;
    padding: 10px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    flex-wrap: wrap;
}
.te-toolbar button {
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #9ca3af;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
}
.te-toolbar button:hover {
    background: rgba(99,102,241,0.15);
    color: #e5e7eb;
    border-color: rgba(99,102,241,0.3);
}
.te-grid-wrap {
    flex: 1;
    overflow: auto;
    padding: 16px 20px;
}
.te-grid {
    border-collapse: collapse;
    width: 100%;
}
.te-grid td {
    border: 1px solid rgba(255,255,255,0.1);
    padding: 0;
    min-width: 80px;
}
.te-grid td div[contenteditable] {
    padding: 8px 10px;
    font-size: 13px;
    color: #e5e7eb;
    outline: none;
    min-height: 20px;
    transition: background 0.15s;
}
.te-grid td div[contenteditable]:focus {
    background: rgba(99,102,241,0.1);
}
.te-grid tr:first-child td {
    background: rgba(99,102,241,0.08);
}
.te-grid tr:first-child td div[contenteditable] {
    font-weight: 600;
    color: #a5b4fc;
}
.te-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
}
.te-footer button {
    padding: 8px 20px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}
.te-footer .te-cancel {
    background: rgba(255,255,255,0.04);
    color: #9ca3af;
}
.te-footer .te-cancel:hover {
    background: rgba(255,255,255,0.08);
    color: #e5e7eb;
}
.te-footer .te-apply {
    background: rgba(99,102,241,0.2);
    color: #a5b4fc;
    border-color: rgba(99,102,241,0.3);
}
.te-footer .te-apply:hover {
    background: rgba(99,102,241,0.3);
    color: #fff;
}
`;

let overlay = null;
let gridEl = null;
let currentTableInfo = null;

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
}

function parseHTMLTable(tableEl) {
    const rows = [];
    tableEl.querySelectorAll('tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('th, td').forEach(cell => {
            cells.push(cell.textContent.trim());
        });
        if (cells.length) rows.push(cells);
    });
    return rows;
}

function findTableInMarkdown(markdown, tableData) {
    // Find a markdown table that matches the given table data
    const lines = markdown.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('|')) {
            const tableStart = i;
            let tableEnd = i;
            while (tableEnd < lines.length && lines[tableEnd].trim().startsWith('|')) {
                tableEnd++;
            }
            // Check if header row matches
            const headerCells = lines[tableStart].split('|').filter(c => c.trim()).map(c => c.trim());
            if (tableData[0] && headerCells.length === tableData[0].length) {
                const match = headerCells.every((c, idx) => c === tableData[0][idx]);
                if (match) {
                    return { start: tableStart, end: tableEnd };
                }
            }
            // Even if no exact header match, return first table found
            return { start: tableStart, end: tableEnd };
        }
    }
    return null;
}

function gridToMarkdown() {
    if (!gridEl) return '';
    const rows = [];
    gridEl.querySelectorAll('tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('td').forEach(td => {
            cells.push(td.querySelector('div').textContent.trim() || ' ');
        });
        rows.push(cells);
    });

    if (!rows.length) return '';

    const colCount = Math.max(...rows.map(r => r.length));
    const colWidths = Array(colCount).fill(3);
    rows.forEach(r => {
        r.forEach((c, i) => { colWidths[i] = Math.max(colWidths[i], c.length); });
    });

    const pad = (s, w) => s + ' '.repeat(Math.max(0, w - s.length));

    let md = '';
    rows.forEach((row, ri) => {
        md += '| ' + row.map((c, i) => pad(c, colWidths[i])).join(' | ') + ' |\n';
        if (ri === 0) {
            md += '| ' + colWidths.map(w => '-'.repeat(w)).join(' | ') + ' |\n';
        }
    });

    return md;
}

function buildGrid(data) {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    data.forEach((row, ri) => {
        const tr = document.createElement('tr');
        row.forEach((cell, ci) => {
            const td = document.createElement('td');
            const div = document.createElement('div');
            div.contentEditable = 'true';
            div.textContent = cell;
            div.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const allCells = gridEl.querySelectorAll('td div[contenteditable]');
                    const arr = Array.from(allCells);
                    const idx = arr.indexOf(div);
                    const next = e.shiftKey ? idx - 1 : idx + 1;
                    if (next >= 0 && next < arr.length) arr[next].focus();
                }
            });
            td.appendChild(div);
            tr.appendChild(td);
        });
        gridEl.querySelector('tbody') ? gridEl.querySelector('tbody').appendChild(tr) : gridEl.appendChild(tr);
    });
}

function addRow() {
    const rows = gridEl.querySelectorAll('tr');
    const colCount = rows.length ? rows[0].querySelectorAll('td').length : 3;
    const tr = document.createElement('tr');
    for (let i = 0; i < colCount; i++) {
        const td = document.createElement('td');
        const div = document.createElement('div');
        div.contentEditable = 'true';
        div.addEventListener('keydown', handleTabKey);
        td.appendChild(div);
        tr.appendChild(td);
    }
    gridEl.appendChild(tr);
}

function addColumn() {
    gridEl.querySelectorAll('tr').forEach((tr, ri) => {
        const td = document.createElement('td');
        const div = document.createElement('div');
        div.contentEditable = 'true';
        div.textContent = ri === 0 ? 'Header' : '';
        div.addEventListener('keydown', handleTabKey);
        td.appendChild(div);
        tr.appendChild(td);
    });
}

function deleteRow() {
    const rows = gridEl.querySelectorAll('tr');
    if (rows.length > 2) rows[rows.length - 1].remove();
}

function deleteColumn() {
    const rows = gridEl.querySelectorAll('tr');
    if (!rows.length) return;
    const colCount = rows[0].querySelectorAll('td').length;
    if (colCount <= 1) return;
    rows.forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length > 1) tds[tds.length - 1].remove();
    });
}

function handleTabKey(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const allCells = gridEl.querySelectorAll('td div[contenteditable]');
        const arr = Array.from(allCells);
        const idx = arr.indexOf(e.target);
        const next = e.shiftKey ? idx - 1 : idx + 1;
        if (next >= 0 && next < arr.length) arr[next].focus();
    }
}

function openEditor(tableEl) {
    const data = parseHTMLTable(tableEl);
    if (!data.length) return;

    currentTableInfo = { originalData: data };
    buildGrid(data);
    overlay.classList.add('open');
}

function applyChanges() {
    const md = gridToMarkdown();
    const textarea = elements.input;
    if (!textarea || !md) { closeEditor(); return; }

    const markdown = textarea.value;
    const tablePos = findTableInMarkdown(markdown, currentTableInfo.originalData);

    if (tablePos) {
        const lines = markdown.split('\n');
        const before = lines.slice(0, tablePos.start).join('\n');
        const after = lines.slice(tablePos.end).join('\n');
        const newMarkdown = (before ? before + '\n' : '') + md + (after ? after : '');
        textarea.value = newMarkdown;
        setState({ markdown: newMarkdown });
    } else {
        // Append if not found
        const newMarkdown = markdown + '\n\n' + md;
        textarea.value = newMarkdown;
        setState({ markdown: newMarkdown });
    }

    closeEditor();
}

function closeEditor() {
    overlay.classList.remove('open');
    currentTableInfo = null;
}

export function initTableEditor() {
    injectStyles();

    overlay = document.createElement('div');
    overlay.id = 'table-editor-overlay';
    overlay.innerHTML = `
        <div class="te-modal">
            <div class="te-header">
                <h3>Table Editor</h3>
                <button class="te-close-btn">&times;</button>
            </div>
            <div class="te-toolbar">
                <button data-action="add-row">+ Row</button>
                <button data-action="add-col">+ Column</button>
                <button data-action="del-row">− Row</button>
                <button data-action="del-col">− Column</button>
            </div>
            <div class="te-grid-wrap">
                <table class="te-grid"></table>
            </div>
            <div class="te-footer">
                <button class="te-cancel">Cancel</button>
                <button class="te-apply">Apply</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    gridEl = overlay.querySelector('.te-grid');

    overlay.querySelector('.te-close-btn').addEventListener('click', closeEditor);
    overlay.querySelector('.te-cancel').addEventListener('click', closeEditor);
    overlay.querySelector('.te-apply').addEventListener('click', applyChanges);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeEditor(); });

    overlay.querySelector('[data-action="add-row"]').addEventListener('click', addRow);
    overlay.querySelector('[data-action="add-col"]').addEventListener('click', addColumn);
    overlay.querySelector('[data-action="del-row"]').addEventListener('click', deleteRow);
    overlay.querySelector('[data-action="del-col"]').addEventListener('click', deleteColumn);

    // Listen for clicks on tables in preview
    const output = elements.output;
    if (output) {
        output.addEventListener('click', (e) => {
            const table = e.target.closest('table');
            if (table && output.contains(table)) {
                openEditor(table);
            }
        });
    }

    registerCommand('open-table-editor', {
        name: 'Edit Table',
        shortcut: null,
        icon: 'table',
        category: 'editor',
        execute: () => {
            // Try to find first table in preview
            const table = elements.output?.querySelector('table');
            if (table) openEditor(table);
        }
    });
}
