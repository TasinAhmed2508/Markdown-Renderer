import { elements } from '../ui/dom.js';

let lastLineCount = 0;

export function initLineNumbers() {
    const textarea = elements.input;
    const lineNumbers = document.getElementById('line-numbers');

    if (!textarea || !lineNumbers) return;

    const updateLineNumbers = () => {
        const lines = textarea.value.split('\n').length;
        // Only rebuild DOM when line count actually changes
        if (lines === lastLineCount) return;
        lastLineCount = lines;

        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => `<div>${i + 1}</div>`).join('');
    };

    const syncScroll = () => {
        lineNumbers.scrollTop = textarea.scrollTop;
    };

    updateLineNumbers();

    textarea.addEventListener('input', updateLineNumbers);
    textarea.addEventListener('scroll', syncScroll);

    textarea.style.whiteSpace = 'pre'; 
    textarea.style.overflowX = 'auto';
}
