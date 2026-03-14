/**
 * Post-render Module
 * Orchestrates DOM processing after markdown is rendered
 */

/* global hljs, renderMathInElement, mermaid */

import { renderCharts } from '../features/chart.js';
import { renderPlantUML } from '../features/plantuml.js';
import { initCopyButtons } from '../features/copy-code.js';
import { renderCSVTables } from '../features/csv-table.js';

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
function buildMermaidErrorNode(message, source) {
    const wrapper = document.createElement('div');
    wrapper.className = 'mermaid-error-msg';

    const title = document.createElement('div');
    title.style.fontWeight = '700';
    title.style.marginBottom = '6px';
    title.textContent = 'Mermaid Syntax Error';
    wrapper.appendChild(title);

    const detail = document.createElement('div');
    detail.style.opacity = '0.9';
    detail.style.whiteSpace = 'pre-wrap';
    detail.textContent = message || 'Unknown syntax error';
    wrapper.appendChild(detail);

    const debug = document.createElement('pre');
    debug.style.marginTop = '8px';
    debug.style.padding = '8px';
    debug.style.borderRadius = '6px';
    debug.style.background = 'rgba(0,0,0,0.35)';
    debug.style.color = '#cbd5e1';
    debug.style.fontSize = '12px';
    debug.style.overflowX = 'auto';
    debug.textContent = source || '';
    wrapper.appendChild(debug);

    return wrapper;
}

export async function renderMermaid(element, isCurrent = () => true) {
    if (typeof mermaid === 'undefined') return;

    // 1. Convert code blocks to mermaid divs
    element.querySelectorAll('pre code.language-mermaid').forEach(block => {
        const pre = block.closest('pre');
        const div = document.createElement('div');
        div.className = 'mermaid';
        const source = block.textContent || '';
        div.textContent = source;
        div.dataset.source = source;
        pre.replaceWith(div);
    });

    // 2. Select and run
    const nodes = element.querySelectorAll('.mermaid');
    const unprocessed = Array.from(nodes).filter(n => !n.getAttribute('data-processed'));

    if (unprocessed.length === 0) return;

    const hasMermaidError = (node) => {
        if (!node) return false;
        return !!node.querySelector('svg[id*="error"]') ||
            /syntax error/i.test(node.textContent || '');
    };

    const renderSingle = async (node) => {
        if (!node || !node.isConnected || !isCurrent()) return;

        const source = node.dataset.source || node.textContent || '';

        try {
            await mermaid.run({ nodes: [node] });

            if (!node.isConnected || !isCurrent()) return;
            if (hasMermaidError(node)) {
                throw new Error('Mermaid parser failed to render diagram');
            }

            node.setAttribute('data-processed', 'true');
        } catch (err) {
            if (!node.isConnected || !isCurrent()) return;
            node.replaceChildren(buildMermaidErrorNode(err.message || 'Unknown syntax error', source));
            node.setAttribute('data-processed', 'error');
        }
    };

    // Strategy: Try batch first. If fail, retry individually to isolate errors.
    try {
        await mermaid.run({ nodes: unprocessed });

        if (!isCurrent()) return;

        for (const node of unprocessed) {
            if (!node.isConnected) continue;
            if (hasMermaidError(node)) {
                await renderSingle(node);
            } else {
                node.setAttribute('data-processed', 'true');
            }
        }
    } catch (batchErr) {
        console.warn('Mermaid batch render failed, retrying individually...', batchErr);

        for (const node of unprocessed) {
            if (!isCurrent()) return;
            await renderSingle(node);
        }
    }
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
export async function postRender(element, isCurrent = () => true) {
    // 1. Highlight standard code first
    highlightCode(element);

    // 2. Render specialized diagrams/charts
    // These modules handle finding their specific blocks
    await renderMermaid(element, isCurrent);
    if (!isCurrent()) return;

    renderCharts(element);
    if (!isCurrent()) return;

    renderPlantUML(element);
    renderMath(element);

    // 2b. Render CSV/TSV tables
    try { renderCSVTables(element); } catch (err) { console.warn('CSV render error:', err); }

    // 3. UI enhancements
    initCopyButtons(element);
}
