/**
 * Post-render Module
 * Orchestrates DOM processing after markdown is rendered
 */

/* global hljs, renderMathInElement, mermaid */

import { renderCharts } from '../features/chart.js';
import { renderPlantUML } from '../features/plantuml.js';
import { initCopyButtons } from '../features/copy-code.js';

/**
 * Apply syntax highlighting to code blocks
 */
export function highlightCode(element) {
    if (typeof hljs === 'undefined') return;

    element.querySelectorAll('pre code').forEach((block) => {
        // Skip special renderers
        if (block.classList.contains('language-mermaid') ||
            block.classList.contains('language-chart') ||
            block.classList.contains('language-chartjs') ||
            block.classList.contains('language-uml') ||
            block.classList.contains('language-plantuml')) return;

        hljs.highlightElement(block);
    });
}

/**
 * Render Mermaid diagrams
 */
export function renderMermaid(element) {
    if (typeof mermaid === 'undefined') return;

    // 1. Convert code blocks to mermaid divs
    element.querySelectorAll('pre code.language-mermaid').forEach(block => {
        const pre = block.closest('pre');
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = block.textContent;
        pre.replaceWith(div);
    });

    // 2. Select and run
    const nodes = element.querySelectorAll('.mermaid');
    const unprocessed = Array.from(nodes).filter(n => !n.getAttribute('data-processed'));

    if (unprocessed.length === 0) return;

    // Strategy: Try batch first. If fail, retry individually to isolate errors.
    mermaid.run({ nodes: unprocessed })
        .then(() => {
            // Mark all as processed
            unprocessed.forEach(n => n.setAttribute('data-processed', 'true'));
        })
        .catch(async (batchErr) => {
            console.warn('Mermaid batch render failed, retrying individually...', batchErr);

            // Retry individually
            for (const node of unprocessed) {
                try {
                    await mermaid.run({ nodes: [node] });

                    // Check if Mermaid rendered an error SVG (it doesn't throw in v10+)
                    // Error SVGs usually contain specific text or IDs
                    if (node.querySelector('svg[id*="error"]') || node.textContent.includes('Syntax error')) {
                        throw new Error('Mermaid parser failed to render diagram');
                    }

                    node.setAttribute('data-processed', 'true');
                } catch (err) {
                    // This specific node failed
                    node.innerHTML = `
                        <div class="p-4 border border-red-500/50 bg-red-900/10 text-red-400 rounded-lg text-sm font-mono my-4">
                            <div class="font-bold mb-2 flex items-center gap-2">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                Mermaid Syntax Error
                            </div>
                            <div class="opacity-80 whitespace-pre-wrap">${err.message || 'Unknown syntax error'}</div>
                        </div>
                    `;
                    // Restore original code for debugging
                    const debug = document.createElement('pre');
                    debug.className = 'text-xs text-gray-500 mt-2 p-2 bg-black/20 rounded overflow-x-auto';
                    debug.textContent = node.textContent;
                    node.appendChild(debug);
                }
            }
        });
}

/**
 * Render math equations using KaTeX
 */
export function renderMath(element) {
    if (typeof renderMathInElement === 'undefined') return;

    renderMathInElement(element, {
        delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false,
        trust: true
    });
}

/**
 * Run all post-render processing on an element
 */
export function postRender(element) {
    // 1. Highlight standard code first
    highlightCode(element);

    // 2. Render specialized diagrams/charts
    // These modules handle finding their specific blocks
    renderMermaid(element);
    renderCharts(element);
    renderPlantUML(element);
    renderMath(element);

    // 3. UI enhancements
    initCopyButtons(element);
}
