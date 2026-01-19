/**
 * PDF Export Pipeline - Main Entry Point
 * Orchestrates all PDF generation steps
 */

/* global html2pdf */

import { buildPdfOptions, getThemeColors } from './config.js';
import { isLightMode, generateContainerStyles, generateBodyStyles } from './theme-styles.js';
import { deepCloneWithStyles, removeInteractiveElements, fixImageDimensions } from './element-cloner.js';
import { processMathElements } from './math-handler.js';
import { processDiagrams } from './diagram-handler.js';
import { processCodeBlocks } from './code-handler.js';
import { processTables } from './table-handler.js';
import { showProgress } from '../../ui/pdf-progress.js';

/**
 * Generate PDF from markdown output element
 */
export async function generatePDF(element, filename) {
    if (!element) throw new Error('No content element provided');

    const progress = showProgress();

    try {
        progress.updateStatus('Detecting theme...');
        progress.updateProgress(10);
        const isLight = isLightMode();
        const colors = getThemeColors(isLight);

        progress.updateStatus('Cloning content...');
        progress.updateProgress(20);
        let clone = deepCloneWithStyles(element, true);
        clone = removeInteractiveElements(clone);
        clone = fixImageDimensions(clone);

        progress.updateStatus('Processing math equations...');
        progress.updateProgress(35);
        clone = processMathElements(clone, isLight);

        progress.updateStatus('Processing diagrams...');
        progress.updateProgress(50);
        clone = processDiagrams(element, clone);

        progress.updateStatus('Processing code blocks...');
        progress.updateProgress(65);
        clone = processCodeBlocks(clone, isLight);

        progress.updateStatus('Processing tables...');
        progress.updateProgress(75);
        clone = processTables(clone, isLight);

        progress.updateStatus('Building PDF container...');
        progress.updateProgress(85);
        const container = createContainer(clone, isLight);
        document.body.appendChild(container);

        await sleep(300);

        progress.updateStatus('Generating PDF file...');
        progress.updateProgress(95);
        await html2pdf().set(buildPdfOptions(filename, colors.bg)).from(container).save();

        progress.updateProgress(100);
        document.body.removeChild(container);
        await sleep(300);
        progress.hide();

    } catch (err) {
        console.error('PDF Generation Error:', err);
        progress.showError(err.message || 'Failed to generate PDF');
        throw err;
    }
}

function createContainer(clone, isLight) {
    const container = document.createElement('div');
    container.id = 'pdf-export-container';
    container.style.cssText = generateContainerStyles(isLight);
    clone.classList.add('markdown-body');
    Object.assign(clone.style, generateBodyStyles(isLight));
    container.appendChild(clone);
    return container;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
