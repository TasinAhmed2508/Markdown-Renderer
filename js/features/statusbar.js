// Update Status Bar elements with icons
import { state, subscribe } from '../core/state.js';

const els = {
    words: document.getElementById('word-count'),
    readTime: document.getElementById('read-time')
};

function calculateStats(text) {
    if (!text) return { words: 0, time: 0 };
    
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    // Average reading speed: 200 wpm
    const time = Math.ceil(words / 200);

    return { words, time };
}

function updateStatusBar(text) {
    const stats = calculateStats(text);
    // Keep icons when updating text
    if (els.words) els.words.innerHTML = `<i data-lucide="type" class="w-3 h-3 text-indigo-300"></i> ${stats.words} Words`;
    if (els.readTime) els.readTime.innerHTML = `<i data-lucide="clock" class="w-3 h-3 text-teal-300"></i> ${stats.time} min`;
    
    // Refresh icons since we overwrote HTML
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
