/**
 * PNG Export Module
 * Handles PNG screenshot exports using html2canvas
 */

/* global html2canvas */

import { elements } from '../ui/dom.js';
import { showToast } from '../ui/toast.js';
import { sanitizeModernColors } from './pdf/color-sanitizer.js';

/**
 * Export preview as PNG image
 */
export async function exportPNG() {
    const btn = elements.btnExportPng;
    if (!btn) return;

    const originalContent = btn.innerHTML;
    showLoading(btn);

    let clone = null;
    // A live WebGL canvas behind the capture starves html2canvas.
    window.__renderxShaderPaused = true;
    try {
        const element = elements.windowChrome;
        if (!element) throw new Error('Preview element not found');

        clone = element.cloneNode(true);
        setupClone(clone, element);
        document.body.appendChild(clone);
        await sleep(100);

        const canvas = await html2canvas(clone, {
            backgroundColor: null,
            scale: 3,
            logging: false,
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            ignoreElements: (el) => el.id === 'canvas-container',
            // App chrome is dropped from the clone: it is not part of the image and
            // its modern color()/oklab values crash html2canvas.
            onclone: (doc) => {
                stripCloneChrome(doc);
            },
        });

        const link = document.createElement('a');
        link.download = `TA-RenderX-${timestamp()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

    } catch (err) {
        console.error('PNG Export failed:', err);
        showToast(`PNG export failed: ${err.message}`, 'error');
    } finally {
        window.__renderxShaderPaused = false;
        if (clone && clone.parentNode) {
            clone.parentNode.removeChild(clone);
        }
        resetButton(btn, originalContent);
    }
}

const CLONE_STRIP_SELECTORS = [
    '#canvas-container',
    '#ext-banner',
    '#toc-panel',
    '#outline-panel',
    '#version-history-panel',
    '#command-palette',
    '#custom-theme-modal',
    '#slide-overlay',
    '#mobile-format-toolbar',
    '.mobile-pane-toggle',
    '.me-edit-float-btn',
];

function stripCloneChrome(doc) {
    CLONE_STRIP_SELECTORS.forEach((sel) => {
        doc.querySelectorAll(sel).forEach((el) => el.remove());
    });
    sanitizeModernColors(doc);
    // Neutralise colors html2canvas cannot parse (Tailwind v4 oklab/oklch).
    doc.querySelectorAll('#navbar, #editor-toolbar, footer').forEach((el) => {
        el.style.background = '#000000';
        el.style.backgroundImage = 'none';
    });
    try { doc.defaultView.__renderxPdfExport = true; } catch { /* ignore */ }
}

function setupClone(clone, original) {
    clone.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: ${original.offsetWidth}px;
        height: auto; min-height: ${original.scrollHeight}px;
        z-index: -9999; overflow: visible;
    `.replace(/\s+/g, ' ');
}

function showLoading(btn) {
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> PNG...`;
    btn.disabled = true;
    if (window.lucide) window.lucide.createIcons();
}

function resetButton(btn, content) {
    btn.innerHTML = content;
    btn.disabled = false;
    if (window.lucide) window.lucide.createIcons();
}

function timestamp() {
    return new Date().toISOString().slice(0, 10);
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}
