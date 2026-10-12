import { setState } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { showToast } from '../ui/toast.js';

function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    textarea.setRangeText(text, start, textarea.selectionEnd, 'end');
    setState({ markdown: textarea.value });
}

function handleImageFile(file, textarea) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        const md = `![image](${dataUrl})`;
        insertAtCursor(textarea, md);
        showToast('Image inserted');
    };
    reader.readAsDataURL(file);
}

export function initImageUpload() {
    const textarea = elements.input;
    if (!textarea) return;

    // Paste handler
    textarea.addEventListener('paste', (e) => {
        const items = e.clipboardData && e.clipboardData.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                handleImageFile(item.getAsFile(), textarea);
                return;
            }
        }
    });

    // Drag & drop image files
    textarea.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(f => f.type.startsWith('image/'));
        if (imageFile) {
            e.preventDefault();
            handleImageFile(imageFile, textarea);
        }
    });
}
