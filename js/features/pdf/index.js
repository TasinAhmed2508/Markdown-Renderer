/**
 * PDF Export Pipeline - Main Entry Point
 * Orchestrates all PDF generation steps
 */

/* global html2pdf */

import { buildPdfOptions, getThemeColors } from './config.js';
import {
    generateBodyStyles,
    getHeadingStyles,
    getLinkStyles,
    getBlockquoteStyles
} from './theme-styles.js';
import { removeInteractiveElements, fixImageDimensions } from './element-cloner.js';
import { processMathElements } from './math-handler.js';
import { processCodeBlocks } from './code-handler.js';
import { processTables } from './table-handler.js';
import { showProgress } from '../../ui/pdf-progress.js';
import { getLatestRenderPromise, updateOutputUI } from '../../ui/events.js';
import { state } from '../../core/state.js';

/**
 * Generate PDF from markdown output element
 */
export async function generatePDF(element, filename) {
    if (!element) throw new Error('No content element provided');
    if (typeof html2pdf === 'undefined') throw new Error('html2pdf is not available');
    if (!hasRenderableContent(element)) throw new Error('There is no rendered content to export yet');

    const progress = showProgress();
    let cleanup = () => {};

    try {
        progress.updateStatus('Waiting for render completion...');
        progress.updateProgress(10);
        await getLatestRenderPromise();

        progress.updateStatus('Preparing fonts and images...');
        progress.updateProgress(20);
        await waitForFonts();
        await waitForImages(element);

        progress.updateStatus('Preparing print theme...');
        progress.updateProgress(30);
        // Use a print-first light palette for consistent readability in generated PDFs.
        const isLight = true;
        const colors = getThemeColors(isLight);

        progress.updateStatus('Applying print styles...');
        progress.updateProgress(55);
        cleanup = prepareElementForPdf(element, isLight, colors);

        progress.updateStatus('Generating PDF file...');
        progress.updateProgress(95);
        const options = buildPdfOptions(filename, colors.bg);

        await html2pdf().set(options).from(element).save();

        progress.updateProgress(100);
        await sleep(250);
        progress.hide();

    } catch (err) {
        console.error('PDF Generation Error:', err);
        progress.showError(err.message || 'Failed to generate PDF');
        throw err;
    } finally {
        cleanup();
        // Re-render to restore the interactive preview state after temporary PDF styling.
        await Promise.resolve(updateOutputUI(state.markdown));
    }
}

function hasRenderableContent(element) {
    if (!element) return false;
    if ((element.textContent || '').trim().length > 0) return true;

    return !!element.querySelector('img, svg, canvas, table, pre, .katex, .mermaid');
}

async function waitForFonts() {
    if (document.fonts && typeof document.fonts.ready?.then === 'function') {
        await document.fonts.ready;
    }
}

async function waitForImages(element) {
    const images = Array.from(element.querySelectorAll('img'));
    if (images.length === 0) return;

    const waits = images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();

        return new Promise((resolve) => {
            const done = () => {
                img.removeEventListener('load', done);
                img.removeEventListener('error', done);
                resolve();
            };
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            setTimeout(done, 2500);
        });
    });

    await Promise.all(waits);
}

function prepareElementForPdf(element, isLight, colors) {
    const originalClassName = element.className;
    const originalStyle = element.getAttribute('style');

    const bodyStyles = generateBodyStyles(isLight);
    element.className = 'markdown-body pdf-export-body';
    element.style.setProperty('background-color', bodyStyles.backgroundColor, 'important');
    element.style.setProperty('color', bodyStyles.color, 'important');
    element.style.setProperty('width', bodyStyles.width);
    element.style.setProperty('height', bodyStyles.height);
    element.style.setProperty('overflow', bodyStyles.overflow);
    element.style.setProperty('box-sizing', bodyStyles.boxSizing);
    element.style.setProperty('border-radius', bodyStyles.borderRadius);
    element.style.setProperty('padding', bodyStyles.padding);
    element.style.setProperty('min-height', '0');

    applyTypographyStyles(element, isLight, colors);
    applyDiagramStyles(element);
    removeInteractiveElements(element);
    fixImageDimensions(element, element);
    processMathElements(element, isLight);
    processCodeBlocks(element, isLight);
    processTables(element, isLight);

    return () => {
        element.className = originalClassName;
        if (originalStyle === null) {
            element.removeAttribute('style');
        } else {
            element.setAttribute('style', originalStyle);
        }
    };
}

function applyTypographyStyles(clone, isLight, colors) {
    const headingStyles = getHeadingStyles(isLight);
    const linkStyles = getLinkStyles(isLight);
    const blockquoteStyles = getBlockquoteStyles(isLight);

    clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
        Object.assign(el.style, headingStyles);
        el.style.breakAfter = 'avoid';
        el.style.pageBreakAfter = 'avoid';
    });

    clone.querySelectorAll('p, li').forEach((el) => {
        el.style.color = colors.text;
        el.style.lineHeight = '1.7';
    });

    clone.querySelectorAll('ul, ol').forEach((list) => {
        list.style.paddingLeft = '1.5em';
    });

    clone.querySelectorAll('a').forEach((a) => {
        Object.assign(a.style, linkStyles);
    });

    clone.querySelectorAll('blockquote').forEach((el) => {
        Object.assign(el.style, blockquoteStyles);
        el.style.breakInside = 'avoid';
        el.style.pageBreakInside = 'avoid';
    });

    clone.querySelectorAll('hr').forEach((hr) => {
        hr.style.border = '0';
        hr.style.height = '1px';
        hr.style.background = isLight ? 'rgba(30,41,59,0.18)' : 'rgba(255,255,255,0.18)';
        hr.style.margin = '1.5em 0';
    });
}

function applyDiagramStyles(clone) {
    clone.querySelectorAll('.mermaid').forEach((el) => {
        Object.assign(el.style, {
            margin: '1.1em auto',
            padding: '12px',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '8px',
            maxHeight: '420px',
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
        });

        const svg = el.querySelector('svg');
        if (svg) {
            const explicitHeight = Number(svg.getAttribute('height')) || 0;
            if (explicitHeight > 0) {
                const targetHeight = Math.min(explicitHeight, 360);
                const scale = targetHeight / explicitHeight;
                const explicitWidth = Number(svg.getAttribute('width')) || 0;
                if (explicitWidth > 0) {
                    svg.style.width = `${Math.max(220, Math.round(explicitWidth * scale))}px`;
                } else {
                    svg.style.width = '100%';
                }
                svg.style.height = `${targetHeight}px`;
            } else {
                svg.style.maxWidth = '100%';
                svg.style.height = 'auto';
            }

            svg.style.display = 'block';
            svg.style.margin = '0 auto';
        }
    });

    clone.querySelectorAll('.chart-container').forEach((container) => {
        Object.assign(container.style, {
            margin: '1.1em auto',
            padding: '0.75rem',
            maxWidth: '100%',
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
        });
    });

    clone.querySelectorAll('.plantuml-diagram').forEach((img) => {
        Object.assign(img.style, {
            display: 'block',
            maxWidth: '100%',
            margin: '1.1em auto',
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
        });
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
