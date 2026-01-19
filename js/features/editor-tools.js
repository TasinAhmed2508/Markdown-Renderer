import { elements } from '../ui/dom.js';
import { setState, state } from '../core/state.js';

function insertText(before, after = '') {
    const textarea = elements.input;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selection + after + text.substring(end);
    
    // Update state and textarea
    textarea.value = newText;
    setState({ markdown: newText });
    
    // Restore cursor/selection
    textarea.focus();
    const newCursorPos = start + before.length + selection.length + after.length;
    textarea.setSelectionRange(
        start + before.length, 
        selection.length ? start + before.length + selection.length : start + before.length
    );
}

export function initEditorTools() {
    const toolbar = document.getElementById('editor-toolbar');
    if (!toolbar) return;

    toolbar.addEventListener('click', (e) => {
        const btn = e.target.closest('.tool-btn');
        if (!btn || !btn.dataset.tool) return;

        const tool = btn.dataset.tool;
        
        switch(tool) {
            case 'bold': insertText('**', '**'); break;
            case 'italic': insertText('*', '*'); break;
            case 'code': insertText('`', '`'); break;
            case 'link': insertText('[', '](url)'); break;
            case 'list-ul': insertText('- '); break;
            case 'list-ol': insertText('1. '); break;
        }
    });
}
