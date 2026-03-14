// Update Status Bar elements with icons
import { state, subscribe } from '../core/state.js';

let els = null;

function getElements() {
    if (!els) {
        els = {
            words: document.getElementById('word-count'),
            readTime: document.getElementById('read-time')
        };
    }
    return els;
}

function calculateStats(text) {
    if (!text || typeof text !== 'string') return { words: 0, time: 0 };

    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const time = Math.max(1, Math.ceil(words / 200));

    return { words, time };
}

function updateStatusBar(text) {
    const { words: wordsEl, readTime } = getElements();
    const stats = calculateStats(text);

    if (wordsEl) wordsEl.innerHTML = `<i data-lucide="type" class="w-3 h-3 text-indigo-300"></i> ${stats.words} Words`;
    if (readTime) readTime.innerHTML = `<i data-lucide="clock" class="w-3 h-3 text-teal-300"></i> ${stats.time} min`;

    if (window.lucide) window.lucide.createIcons();
}

export function initStatusBar() {
    // Initial update
    updateStatusBar(state.markdown);

    // Subscribe
    subscribe((newState) => {
        updateStatusBar(newState.markdown);
    });
}
