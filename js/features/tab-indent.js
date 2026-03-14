import { setState } from '../core/state.js';
import { elements } from '../ui/dom.js';

const INDENT = '    '; // 4 spaces

function updateState(textarea) {
    setState({ markdown: textarea.value });
}

export function initTabIndent() {
    const textarea = elements.input;
    if (!textarea) return;

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            handleTab(textarea, e.shiftKey);
        } else if (e.key === 'Enter') {
            handleEnter(textarea, e);
        }
    });
}

function handleTab(textarea, isShift) {
    const { selectionStart, selectionEnd, value } = textarea;
    const hasSelection = selectionStart !== selectionEnd;

    if (!hasSelection && !isShift) {
        // Insert 4 spaces at cursor
        textarea.setRangeText(INDENT, selectionStart, selectionEnd, 'end');
        updateState(textarea);
        return;
    }

    // Multi-line indent/outdent
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEnd = value.indexOf('\n', selectionEnd);
    const end = lineEnd === -1 ? value.length : lineEnd;
    const block = value.substring(lineStart, end);
    const lines = block.split('\n');

    let newLines;
    let delta = 0;
    let firstLineDelta = 0;

    if (isShift) {
        newLines = lines.map((line, i) => {
            if (line.startsWith(INDENT)) {
                const removed = line.substring(INDENT.length);
                const d = -INDENT.length;
                if (i === 0) firstLineDelta = d;
                delta += d;
                return removed;
            } else if (line.startsWith('\t')) {
                const removed = line.substring(1);
                const d = -1;
                if (i === 0) firstLineDelta = d;
                delta += d;
                return removed;
            }
            // Remove as many leading spaces as possible (up to 4)
            const match = line.match(/^( {1,4})/);
            if (match) {
                const d = -match[1].length;
                if (i === 0) firstLineDelta = d;
                delta += d;
                return line.substring(match[1].length);
            }
            return line;
        });
    } else {
        newLines = lines.map((line, i) => {
            if (i === 0) firstLineDelta = INDENT.length;
            delta += INDENT.length;
            return INDENT + line;
        });
    }

    const newBlock = newLines.join('\n');
    textarea.setRangeText(newBlock, lineStart, end);

    // Restore selection
    const newStart = Math.max(lineStart, selectionStart + firstLineDelta);
    const newEnd = selectionEnd + delta;
    textarea.setSelectionRange(newStart, newEnd);
    updateState(textarea);
}

function handleEnter(textarea, e) {
    const { selectionStart, value } = textarea;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const currentLine = value.substring(lineStart, selectionStart);
    const match = currentLine.match(/^(\s+)/);
    if (match) {
        e.preventDefault();
        const indent = match[1];
        textarea.setRangeText('\n' + indent, selectionStart, textarea.selectionEnd, 'end');
        updateState(textarea);
    }
}
