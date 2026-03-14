/* global hljs, renderMathInElement, mermaid */
import { setState } from '../core/state.js';
import { elements } from './dom.js';
import { renderer } from '../core/renderer.js';

let renderSeq = 0;
let latestRenderPromise = Promise.resolve();

// Initialize mermaid (Global config)
if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
}

export function initInput() {
    const input = elements.input;
    if (!input) {
        console.warn('initInput: markdown-input element not found');
        return;
    }
    input.addEventListener('input', (e) => {
        setState({ markdown: e.target.value });
    });
}

export function updateOutputUI(markdown) {
    if (!elements.output) {
        console.warn('updateOutputUI: output element not found');
        return Promise.resolve();
    }

    const seq = ++renderSeq;
    const isCurrent = () => seq === renderSeq;

    let html;
    try {
        html = renderer.render(markdown);
    } catch (err) {
        console.error('Render error:', err);
        html = `<pre style="color:#f87171;">Render Error: ${err.message}</pre>`;
    }

    elements.output.innerHTML = html;

    latestRenderPromise = Promise.resolve(renderer.postRender(elements.output, isCurrent))
        .catch((err) => {
            if (isCurrent()) {
                console.error('Post-render error:', err);
            }
        });

    return latestRenderPromise;
}

export function getLatestRenderPromise() {
    return latestRenderPromise;
}

export function syncInputUI(markdown) {
    if (elements.input && elements.input.value !== markdown) {
        // Only update if significantly different to avoid cursor jumps
        // Actually, with debouncing and one-way flow, we need to be careful.
        // If user is typing, 'input' event updates state.
        // State update triggers 'debouncedRender'.
        // 'debouncedRender' calls 'syncInputUI'.
        // If we overwrite value while user is typing, cursor jumps to end!
        
        // Fix: Do NOT update input value if element is focused!
        if (document.activeElement !== elements.input) {
            elements.input.value = markdown;
        }
    }
}
