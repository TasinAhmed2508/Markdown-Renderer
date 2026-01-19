/**
 * PNG Export Module
 * Handles PNG screenshot exports using html2canvas
 */

/* global html2canvas */

import { elements } from '../ui/dom.js';

/**
 * Export preview as PNG image
 */
export async function exportPNG() {
    const btn = elements.btnExportPng;
    if (!btn) return;

    const originalContent = btn.innerHTML;
    showLoading(btn);

    try {
        const element = elements.windowChrome;
        if (!element) throw new Error('Preview element not found');

        const clone = element.cloneNode(true);
        setupClone(clone, element);
        document.body.appendChild(clone);
        await sleep(100);

        const canvas = await html2canvas(clone, {
            backgroundColor: null,
            scale: 3,
            logging: false,
            useCORS: true,
            allowTaint: true,
            scrollY: -window.scrollY
        });

        document.body.removeChild(clone);

        const link = document.createElement('a');
        link.download = `TA-RenderX-${timestamp()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

    } catch (err) {
        console.error('PNG Export failed:', err);
        alert('Failed to export PNG.');
    } finally {
        resetButton(btn, originalContent);
    }
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
