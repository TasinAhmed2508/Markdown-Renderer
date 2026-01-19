import { elements } from '../ui/dom.js';

export function initLineNumbers() {
    const textarea = elements.input;
    const lineNumbers = document.getElementById('line-numbers');

    if (!textarea || !lineNumbers) return;

    const updateLineNumbers = () => {
        const lines = textarea.value.split('\n').length;
        // Optimization: only update if line count changed significantly or lazily?
        // Actually, for <10k lines, innerHTML replacement is fast enough.
        // We use Array.from to generate spans
        lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => `<div>${i + 1}</div>`).join('');
    };

    const syncScroll = () => {
        lineNumbers.scrollTop = textarea.scrollTop;
    };

    // Initial render
    updateLineNumbers();

    // Event listeners
    textarea.addEventListener('input', updateLineNumbers);
    textarea.addEventListener('scroll', syncScroll);
    
    // Also update on window resize in case of wrapping (if word wrap is on, lines might mismatch)
    // Note: The current implementation assumes NO WORD WRAP for perfect 1:1 mapping, 
    // or we need more complex logic (checking clientHeight of each line).
    // For now, we assume standard behavior. Markdown usually likes no-wrap or simple wrap.
    // If Prettier format sets proseWrap: "always", hard breaks are inserted, so line count remains accurate 1:1.
    // However, soft-wrapping by CSS (white-space: pre-wrap) breaks this visual sync.
    // To ensure 1:1 sync, we should force 'white-space: pre;' on textarea or use complex JS.
    // Let's force pre for now to guarantee alignment.
    textarea.style.whiteSpace = 'pre'; 
    textarea.style.overflowX = 'auto';
}
