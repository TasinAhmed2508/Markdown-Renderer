import { elements } from '../ui/dom.js';
import { state } from '../core/state.js';

export function initDownloadMd() {
    const btn = elements.btnDownloadMd;
    if (!btn) return;

    btn.addEventListener('click', () => {
        const content = state.markdown;
        if (!content) {
            console.warn('Download: no markdown content to save');
            return;
        }

        let url;
        try {
            const blob = new Blob([content], { type: 'text/markdown' });
            url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'document.md';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            if (url) URL.revokeObjectURL(url);
        }
    });
}
