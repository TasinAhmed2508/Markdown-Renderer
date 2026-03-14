import { state, setState } from '../core/state.js';
import { elements } from '../ui/dom.js';

export function initDragDrop() {
    const textarea = elements.input;
    if (!textarea) return;

    textarea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        textarea.classList.add('drag-over');
    });

    textarea.addEventListener('dragleave', () => {
        textarea.classList.remove('drag-over');
    });

    textarea.addEventListener('drop', (e) => {
        e.preventDefault();
        textarea.classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files);
        const mdFile = files.find(f => f.name.endsWith('.md') || f.name.endsWith('.txt'));
        if (!mdFile) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            const hasContent = state.markdown && state.markdown.trim().length > 0;

            if (hasContent && !confirm(`Replace current content with "${mdFile.name}"?`)) {
                return;
            }

            textarea.value = content;
            setState({ markdown: content });

            // Set filename display if available
            const filenameEl = document.getElementById('filename-display');
            if (filenameEl) filenameEl.textContent = mdFile.name;
        };
        reader.readAsText(mdFile);
    });
}
