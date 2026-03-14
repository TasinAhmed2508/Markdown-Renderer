import { elements } from '../ui/dom.js';

export function initScrollSync() {
    const input = elements.input;
    const preview = elements.previewPane;
    if (!input || !preview) return;

    let ticking = false;

    input.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollRange = input.scrollHeight - input.clientHeight;
                if (scrollRange > 0) {
                    const percentage = input.scrollTop / scrollRange;
                    const previewRange = preview.scrollHeight - preview.clientHeight;
                    preview.scrollTop = percentage * previewRange;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}