import { setState } from '../core/state.js';
import { elements } from '../ui/dom.js';

function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '8px 20px',
        borderRadius: '8px', fontSize: '13px', zIndex: '9999',
        transition: 'opacity 0.3s', pointerEvents: 'none'
    });
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

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
