import { elements } from '../ui/dom.js';

export function initScrollSync() {
    let ticking = false;

    elements.input.addEventListener('scroll', () => {
        if (!ticking && elements.previewPane) {
            window.requestAnimationFrame(() => {
                const percentage = elements.input.scrollTop / (elements.input.scrollHeight - elements.input.clientHeight);
                elements.previewPane.scrollTop = percentage * (elements.previewPane.scrollHeight - elements.previewPane.clientHeight);
                ticking = false;
            });
            ticking = true;
        }
    });
}