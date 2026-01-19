import { elements } from '../ui/dom.js';
import { state } from '../core/state.js';

export function initDownloadMd() {
    elements.btnDownloadMd.addEventListener('click', () => {
        const blob = new Blob([state.markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}
