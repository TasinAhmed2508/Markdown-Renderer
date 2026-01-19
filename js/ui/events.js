/* global hljs, renderMathInElement, mermaid */
import { setState } from '../core/state.js';
import { elements } from './dom.js';
import { renderer } from '../core/renderer.js';

// Initialize mermaid (Global config)
if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
}

export function initInput() {
    elements.input.addEventListener('input', (e) => {
        setState({ markdown: e.target.value });
    });
}

export function updateOutputUI(markdown) {
    // 1. Render HTML (String manipulation phase)
    // This handles Math protection, Markdown parsing, and Embeds
    const html = renderer.render(markdown);
    
    // 2. Update DOM
    elements.output.innerHTML = html;
    
    // 3. Post-Process DOM (Code highlight, Math rendering, Diagrams)
    renderer.postRender(elements.output);
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