/**
 * PDF Export Pipeline - Main Entry Point
 * Orchestrates all PDF generation steps
 */

/* global html2pdf */

import { buildPdfOptions, getThemeColors, PRINT_WIDTH, PAGE } from './config.js';
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
import { withPrintDiagrams } from './mermaid-print.js';
import { withLightCodeTheme } from './code-theme-print.js';
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
    const t0 = performance.now();
    const marks = [];
    const mark = (label) => marks.push(`${label}=${Math.round(performance.now() - t0)}ms`);

    try {
        // Freeze the app viewport for the duration of the capture: the inline
        // shader must neither run inside the cloned document nor keep burning the
        // main thread that html2canvas needs.
        window.__renderxPdfExport = true;
        window.__renderxShaderPaused = true;

        progress.updateStatus('Waiting for render completion...');
        progress.updateProgress(15);
        await getLatestRenderPromise();
        mark('render');

        progress.updateStatus('Preparing fonts and images...');
        progress.updateProgress(30);
        await waitForFonts();
        await waitForImages(element);
        mark('assets');

        progress.updateStatus('Building print layout...');
        progress.updateProgress(50);
        // Consistent A4 output regardless of the current window size.
        const isLight = true;
        const colors = getThemeColors(isLight);
        cleanup = prepareElementForPdf(element, isLight, colors);

        progress.updateStatus('Adapting diagrams for print...');
        progress.updateProgress(65);

        const options = buildPdfOptions(filename, colors.bg);

        await withPrintDiagrams(element, () => withLightCodeTheme(async () => {
            progress.updateStatus('Generating PDF file...');
            progress.updateProgress(85);
            await html2pdf().set(options).from(element).save();
            mark('capture');
        }));
        mark('diagrams');

        progress.updateProgress(100);
        await sleep(250);
        progress.hide();
        console.info(`[RenderX] PDF export finished in ${Math.round(performance.now() - t0)}ms (${marks.join(', ')})`);
    } catch (err) {
        console.error('PDF Generation Error:', err);
        progress.showError(err.message || 'Failed to generate PDF');
        throw err;
    } finally {
        cleanup();
        window.__renderxPdfExport = false;
        window.__renderxShaderPaused = false;
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
    if (!document.fonts || typeof document.fonts.ready?.then !== 'function') return;
    // Never let an unreachable webfont CDN stall the export.
    await Promise.race([document.fonts.ready, sleep(1500)]);
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
            setTimeout(done, 1500);
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
    element.style.setProperty('width', `${PRINT_WIDTH}px`, 'important');
    element.style.setProperty('max-width', `${PRINT_WIDTH}px`, 'important');
    element.style.setProperty('margin', `0 auto`, 'important');
    element.style.setProperty('height', 'auto', 'important');
    element.style.setProperty('overflow', 'visible');
    element.style.setProperty('box-sizing', 'border-box');
    element.style.setProperty('border-radius', '0');
    element.style.setProperty('padding', `${PAGE.PADDING}px`);
    element.style.setProperty('min-height', '0');

    applyTypographyStyles(element, isLight, colors);
    applyDiagramStyles(element, isLight);
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

    // Inline emphasis inherits the app theme's near-white --text-primary, which
    // disappears on the white export background - pin it to the body colour.
    clone.querySelectorAll('strong, b, em, i, del, s, dt, dd, figcaption, summary, sup, sub')
        .forEach((el) => {
            if (el.closest('pre')) return; // syntax highlighting keeps its own colours
            el.style.color = colors.text;
        });

    // Table cells render on the white page too.
    clone.querySelectorAll('td, th').forEach((el) => {
        if (el.closest('pre')) return;
        el.style.color = el.tagName === 'TH' ? '#334155' : colors.text;
    });

    clone.querySelectorAll('ul, ol').forEach((list) => {
        list.style.paddingLeft = '1.6em';
        list.style.listStylePosition = 'outside';
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

    // Inline code sits on a dark chip in the app theme
    clone.querySelectorAll('code').forEach((code) => {
        if (code.closest('pre')) return;
        code.style.background = isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.1)';
        code.style.color = colors.text;
    });
}

function applyDiagramStyles(clone, isLight) {
    // Diagrams are re-rendered with the light mermaid theme for the capture, so
    // they only need a neutral frame here (never a forced width/height, which
    // would squash the diagram out of proportion).
    clone.querySelectorAll('.mermaid').forEach((el) => {
        Object.assign(el.style, {
            margin: '1.2em auto',
            padding: '12px',
            background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(148,163,184,0.25)'}`,
            borderRadius: '8px',
            boxShadow: 'none',
            overflow: 'visible',
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
        });

        const svg = el.querySelector('svg');
        if (svg) {
            svg.removeAttribute('height');
            svg.style.width = '100%';
            svg.style.maxWidth = '100%';
            svg.style.height = 'auto';
            svg.style.display = 'block';
            svg.style.margin = '0 auto';
        }
    });

    clone.querySelectorAll('.mermaid-error-msg').forEach((el) => {
        Object.assign(el.style, {
            background: isLight ? '#fef2f2' : 'rgba(239,68,68,0.12)',
            border: '1px dashed #ef4444',
            borderRadius: '8px',
            padding: '12px 16px',
            color: isLight ? '#991b1b' : '#fecaca'
        });
    });

    clone.querySelectorAll('.chart-container').forEach((container) => {
        Object.assign(container.style, {
            margin: '1.1em auto',
            padding: '0.75rem',
            background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
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
