/**
 * Export Formats Module
 * Additional export options: LaTeX, JSON AST, Plain Text
 */

import { state } from '../core/state.js';
import { registerCommand } from './commands.js';

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function timestamp() {
    return new Date().toISOString().slice(0, 10);
}

// --- LaTeX Export ---

function markdownToLatex(md) {
    let tex = md;

    // Headings
    tex = tex.replace(/^######\s+(.+)$/gm, '\\subparagraph{$1}');
    tex = tex.replace(/^#####\s+(.+)$/gm, '\\paragraph{$1}');
    tex = tex.replace(/^####\s+(.+)$/gm, '\\subsubsubsection{$1}');
    tex = tex.replace(/^###\s+(.+)$/gm, '\\subsubsection{$1}');
    tex = tex.replace(/^##\s+(.+)$/gm, '\\subsection{$1}');
    tex = tex.replace(/^#\s+(.+)$/gm, '\\section{$1}');

    // Bold & italic
    tex = tex.replace(/\*\*\*(.+?)\*\*\*/g, '\\textbf{\\textit{$1}}');
    tex = tex.replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}');
    tex = tex.replace(/\*(.+?)\*/g, '\\textit{$1}');

    // Inline code
    tex = tex.replace(/`([^`]+)`/g, '\\texttt{$1}');

    // Code blocks
    tex = tex.replace(/```[\w]*\n([\s\S]*?)```/g, '\\begin{verbatim}\n$1\\end{verbatim}');

    // Links
    tex = tex.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '\\href{$2}{$1}');

    // Images
    tex = tex.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '\\includegraphics{$2} % $1');

    // Blockquotes
    tex = tex.replace(/^>\s+(.+)$/gm, '\\begin{quote}\n$1\n\\end{quote}');

    // Unordered lists
    tex = tex.replace(/^[-*]\s+(.+)$/gm, '\\item $1');

    // Horizontal rules
    tex = tex.replace(/^---+$/gm, '\\hrule');

    const document = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{hyperref}
\\usepackage{graphicx}

\\begin{document}

${tex}

\\end{document}`;

    return document;
}

function exportLatex() {
    const md = state.markdown;
    if (!md) return;
    const latex = markdownToLatex(md);
    downloadFile(latex, `TA-RenderX-${timestamp()}.tex`, 'application/x-tex');
}

// --- JSON AST Export ---

function exportJsonAst() {
    const md = state.markdown;
    if (!md) return;

    try {
        const ast = window.marked ? window.marked.lexer(md) : null;
        if (!ast) {
            console.warn('marked.lexer not available');
            return;
        }
        const json = JSON.stringify(ast, null, 2);
        downloadFile(json, `TA-RenderX-AST-${timestamp()}.json`, 'application/json');
    } catch (err) {
        console.error('JSON AST export failed:', err);
    }
}

// --- Plain Text Export ---

function markdownToPlainText(md) {
    let text = md;

    // Remove code blocks
    text = text.replace(/```[\w]*\n[\s\S]*?```/g, '');

    // Remove headings markers
    text = text.replace(/^#{1,6}\s+/gm, '');

    // Remove bold/italic
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, '$1');
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');
    text = text.replace(/\*(.+?)\*/g, '$1');
    text = text.replace(/_(.+?)_/g, '$1');

    // Remove inline code
    text = text.replace(/`([^`]+)`/g, '$1');

    // Convert links to text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove images
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

    // Remove blockquote markers
    text = text.replace(/^>\s+/gm, '');

    // Remove horizontal rules
    text = text.replace(/^---+$/gm, '');

    // Remove list markers
    text = text.replace(/^[-*+]\s+/gm, '• ');
    text = text.replace(/^\d+\.\s+/gm, '');

    // Collapse multiple blank lines
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
}

function exportPlainText() {
    const md = state.markdown;
    if (!md) return;
    const text = markdownToPlainText(md);
    downloadFile(text, `TA-RenderX-${timestamp()}.txt`, 'text/plain');
}

// --- Add buttons to export menu ---

function closeExportMenu() {
    const menu = document.getElementById('export-menu');
    if (menu) menu.classList.add('opacity-0', 'invisible', 'scale-95');
}

function addExportButtons() {
    // Bind to existing buttons in HTML (preferred)
    const bindings = [
        { id: 'btn-export-latex', handler: exportLatex },
        { id: 'btn-export-json', handler: exportJsonAst },
        { id: 'btn-export-text', handler: exportPlainText }
    ];

    let allBound = true;
    for (const { id, handler } of bindings) {
        const btn = document.getElementById(id);
        if (btn) {
            // Close the dropdown like the other export actions do.
            btn.addEventListener('click', () => {
                closeExportMenu();
                handler();
            });
        } else {
            allBound = false;
        }
    }

    // If static buttons don't exist, dynamically add to export menu
    if (!allBound) {
        const menu = document.getElementById('export-menu');
        if (!menu) return;

        const fallbackButtons = [
            { id: 'btn-export-latex', icon: 'file-type', color: 'text-amber-400', label: 'LaTeX (.tex)', handler: exportLatex },
            { id: 'btn-export-json', icon: 'braces', color: 'text-cyan-400', label: 'JSON AST', handler: exportJsonAst },
            { id: 'btn-export-text', icon: 'file-minus', color: 'text-gray-400', label: 'Plain Text (.txt)', handler: exportPlainText }
        ];

        for (const { id, icon, color, label, handler } of fallbackButtons) {
            if (document.getElementById(id)) continue;
            const divider = document.createElement('div');
            divider.className = 'h-px bg-white/5 w-full';
            menu.appendChild(divider);

            const btn = document.createElement('button');
            btn.id = id;
            btn.className = 'w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors';
            btn.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 ${color}"></i><span>${label}</span>`;
            btn.addEventListener('click', handler);
            menu.appendChild(btn);
        }

        if (window.lucide) window.lucide.createIcons();
    }
}

export function initExportFormats() {
    addExportButtons();

    registerCommand('export-latex', {
        name: 'Export as LaTeX',
        icon: 'file-type',
        category: 'export',
        execute: exportLatex
    });

    registerCommand('export-json-ast', {
        name: 'Export as JSON AST',
        icon: 'braces',
        category: 'export',
        execute: exportJsonAst
    });

    registerCommand('export-plain-text', {
        name: 'Export as Plain Text',
        icon: 'file-minus',
        category: 'export',
        execute: exportPlainText
    });

    console.log('Export Formats initialized');
}
