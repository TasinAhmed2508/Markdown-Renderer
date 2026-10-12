/**
 * Export Module - Main Entry Point
 * Orchestrates all export functionality (PNG, PDF, HTML)
 */

import { elements } from '../ui/dom.js';
import { getLatestRenderPromise } from '../ui/events.js';
import { showToast } from '../ui/toast.js';
import { generatePDF } from './pdf/index.js';
import { exportPNG } from './export-png.js';
import { exportHTML } from './export-html.js';

/**
 * Initialize all export button handlers
 */
export function initExport() {
    // Dropdown toggle
    initDropdownToggle();

    // PNG Export
    if (elements.btnExportPng) {
        elements.btnExportPng.addEventListener('click', () => {
            closeExportMenu();
            exportPNG();
        });
    }

    // PDF Export
    if (elements.btnExportPdf) {
        elements.btnExportPdf.addEventListener('click', handlePDFExport);
    }

    // HTML Export
    if (elements.btnExportHtml) {
        elements.btnExportHtml.addEventListener('click', () => {
            closeExportMenu();
            exportHTML(elements.btnExportHtml);
        });
    }
}

/**
 * Initialize export dropdown toggle
 */
function initDropdownToggle() {
    const trigger = elements.btnExportTrigger;
    const menu = elements.exportMenu;

    if (!trigger || !menu) return;

    // Toggle on click
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('opacity-0');
        menu.classList.toggle('invisible');
        menu.classList.toggle('scale-95');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.add('opacity-0', 'invisible', 'scale-95');
        }
    });
}

/**
 * Handle PDF export with error handling
 */
async function handlePDFExport() {
    try {
        const content = document.getElementById('markdown-output');
        if (!content) throw new Error('No content to export');

        closeExportMenu();
        await getLatestRenderPromise();
        await generatePDF(content, `TA-RenderX-${timestamp()}.pdf`);
    } catch (err) {
        console.error('PDF Export failed:', err);
        // generatePDF already reports inside its progress modal, but a failure
        // before the modal (or after it closed) must not stay silent.
        if (!document.getElementById('pdf-progress-modal')) {
            showToast(`PDF export failed: ${err.message}`, 'error');
        }
    }
}

function closeExportMenu() {
    const menu = elements.exportMenu;
    if (!menu) return;
    menu.classList.add('opacity-0', 'invisible', 'scale-95');
}

function timestamp() {
    return new Date().toISOString().slice(0, 10);
}
