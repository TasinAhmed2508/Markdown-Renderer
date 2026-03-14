import { elements } from '../ui/dom.js';

let isTypewriterActive = false;

export function initTypewriter() {
    const btn = document.getElementById('btn-typewriter');
    const textarea = elements.input;

    if (!btn) return;

    btn.addEventListener('click', () => {
        isTypewriterActive = !isTypewriterActive;
        // Tailwind specific active class handling
        if (isTypewriterActive) {
            btn.classList.add('text-indigo-400', 'bg-white/10');
            btn.classList.remove('text-gray-400');
        } else {
            btn.classList.remove('text-indigo-400', 'bg-white/10');
            btn.classList.add('text-gray-400');
        }
        
        if (isTypewriterActive) centerLine();
    });

    textarea.addEventListener('input', () => {
        if (isTypewriterActive) centerLine();
    });

    textarea.addEventListener('click', () => {
        if (isTypewriterActive) centerLine();
    });

    textarea.addEventListener('keyup', () => {
        if (isTypewriterActive) centerLine();
    });
}

function centerLine() {
    const textarea = elements.input;
    if (!textarea) return;

    const style = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(style.lineHeight);
    if (!lineHeight || isNaN(lineHeight) || lineHeight <= 0) return;
    
    // Count newlines before cursor to estimate line number
    const textBeforeCursor = textarea.value.substr(0, textarea.selectionStart);
    const lineIndex = textBeforeCursor.split('\n').length - 1;
    
    // Calculate target scroll position
    const visibleHeight = textarea.clientHeight;
    const targetScroll = (lineIndex * lineHeight) - (visibleHeight / 2) + (lineHeight / 2);
    
    textarea.scrollTop = Math.max(0, targetScroll);
}