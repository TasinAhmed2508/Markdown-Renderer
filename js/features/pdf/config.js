/**
 * PDF Configuration Module
 * Centralized settings for PDF generation
 */

import { sanitizeModernColors } from './color-sanitizer.js';

// A4 dimensions at 96 DPI
export const PAGE = {
    WIDTH: 794,      // ~210mm in pixels
    HEIGHT: 1123,    // ~297mm in pixels
    MARGIN: 48,      // Page margins
    PADDING: 32      // Content padding
};

// Width the document is frozen to while exporting, so the exported page always
// matches A4 proportions instead of inheriting the (arbitrary) screen width.
export const PRINT_WIDTH = PAGE.WIDTH - PAGE.MARGIN * 2;

// Width of the cloned document viewport. The app is a two-column grid, so the
// preview column needs roughly half of this - keeping it fixed also prevents
// the small-screen media queries from kicking in mid-export.
export const CLONE_WINDOW_WIDTH = Math.round(PRINT_WIDTH * 2 + PAGE.MARGIN * 6);

// Typography settings
export const FONTS = {
    BODY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    MONO: '"SF Mono", "Fira Code", Consolas, "Liberation Mono", Menlo, monospace',
    SIZE_BASE: 14,
    SIZE_CODE: 13,
    LINE_HEIGHT: 1.7
};

// Dark theme colors
export const DARK_THEME = {
    bg: '#0d1117',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    codeBg: '#161b22',
    codeBorder: '#30363d',
    tableBorder: '#30363d',
    tableHeader: '#161b22',
    link: '#58a6ff',
    blockquoteBorder: '#3b82f6'
};

// Light theme colors
export const LIGHT_THEME = {
    bg: '#ffffff',
    text: '#1e293b',
    textMuted: '#64748b',
    codeBg: '#f6f8fa',
    codeBorder: '#e2e8f0',
    tableBorder: '#e2e8f0',
    tableHeader: '#f8fafc',
    link: '#2563eb',
    blockquoteBorder: '#3b82f6'
};

/**
 * Get theme colors based on current mode
 */
export function getThemeColors(isLight) {
    return isLight ? LIGHT_THEME : DARK_THEME;
}

// Chrome that must never end up in the capture (or slow it down).
const CLONE_STRIP_SELECTORS = [
    '#canvas-container',      // live WebGL shader - the main capture slowdown
    '#navbar',
    '#ext-banner',
    '#tabs-bar',
    '#pdf-progress-modal',
    '#toc-panel',
    '#outline-panel',
    '#version-history-panel',
    '#command-palette',
    '#custom-theme-modal',
    '#slide-overlay',
    '#mobile-format-toolbar',
    '.mobile-pane-toggle',
    '.me-edit-float-btn'
];

/**
 * Clean up the document html2pdf clones before it is rasterised.
 */
export function stripCloneChrome(doc) {
    CLONE_STRIP_SELECTORS.forEach((sel) => {
        doc.querySelectorAll(sel).forEach((el) => el.remove());
    });

    // Colors html2canvas cannot parse (oklab/oklch/color-mix).
    sanitizeModernColors(doc);

    // Stop the inline shader bootstrap inside the cloned document.
    try { doc.defaultView.__renderxPdfExport = true; } catch { /* ignore */ }

    if (doc.body) {
        doc.body.style.background = '#ffffff';
        doc.body.style.overflow = 'visible';
    }
    const grid = doc.querySelector('.app-grid');
    if (grid) {
        grid.style.cssText += ';display:block!important;height:auto!important;padding:0!important;max-width:none!important;';
    }
    const panes = doc.querySelectorAll('.glass-pane');
    panes.forEach((pane) => {
        pane.style.cssText += ';background:transparent!important;border:none!important;box-shadow:none!important;';
    });
}

/**
 * Build html2pdf options
 */
export function buildPdfOptions(filename, bgColor, onClone) {
    return {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: bgColor,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: CLONE_WINDOW_WIDTH,
            allowTaint: false,
            ignoreElements: (el) => el.id === 'canvas-container' || el.id === 'pdf-progress-modal',
            onclone: (doc) => {
                stripCloneChrome(doc);
                if (typeof onClone === 'function') onClone(doc);
            }
        },
        jsPDF: {
            unit: 'px',
            format: 'a4',
            orientation: 'portrait',
            hotfixes: ['px_scaling']
        },
        pagebreak: {
            mode: ['css'],
            avoid: ['pre', 'table', '.mermaid', '.chart-container', '.katex-display', 'blockquote', 'img']
        }
    };
}
