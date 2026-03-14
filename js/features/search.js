/**
 * Search Feature Module
 * Find and replace functionality for the editor
 */
import { elements } from '../ui/dom.js';
import { setState } from '../core/state.js';
import { injectSearchBar } from '../ui/search-bar.js';

export function initSearch() {
    let bar = document.getElementById('find-replace-bar');
    if (!bar) {
        injectSearchBar();
        bar = document.getElementById('find-replace-bar');
    }

    const toggleBtn = document.getElementById('btn-find-toggle');
    const closeBtn = document.getElementById('btn-find-close');
    const findInput = document.getElementById('find-input');
    const replaceInput = document.getElementById('replace-input');
    const nextBtn = document.getElementById('btn-find-next');
    const replaceBtn = document.getElementById('btn-replace');
    const allBtn = document.getElementById('btn-replace-all');
    const textarea = elements.input;

    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        bar.classList.toggle('hidden');
        if (!bar.classList.contains('hidden')) findInput.focus();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => bar.classList.add('hidden'));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => findNext(findInput, textarea));
    }

    if (replaceBtn) {
        replaceBtn.addEventListener('click', () => {
            replaceOne(findInput, replaceInput, textarea, nextBtn);
        });
    }

    if (allBtn) {
        allBtn.addEventListener('click', () => {
            replaceAll(findInput, replaceInput, textarea);
        });
    }
}

function findNext(findInput, textarea) {
    const query = findInput.value;
    if (!query) return;

    const text = textarea.value;
    const start = textarea.selectionEnd;
    let index = text.indexOf(query, start);

    if (index === -1) {
        index = text.indexOf(query, 0);
    }

    if (index !== -1) {
        textarea.focus();
        textarea.setSelectionRange(index, index + query.length);
    } else {
        // Non-blocking visual feedback instead of alert()
        findInput.style.outline = '2px solid #f44336';
        findInput.placeholder = 'Not found';
        setTimeout(() => {
            findInput.style.outline = '';
            findInput.placeholder = 'Find...';
        }, 1500);
    }
}

function replaceOne(findInput, replaceInput, textarea, nextBtn) {
    const query = findInput.value;
    const replacement = replaceInput.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    if (selected === query) {
        textarea.setRangeText(replacement);
        setState({ markdown: textarea.value });
        nextBtn.click();
    } else {
        nextBtn.click();
    }
}

function replaceAll(findInput, replaceInput, textarea) {
    const query = findInput.value;
    const replacement = replaceInput.value;
    if (!query) return;
    if (query === replacement) return;

    const newText = textarea.value.replaceAll(query, replacement);
    if (newText === textarea.value) return;

    textarea.value = newText;
    setState({ markdown: newText });
}