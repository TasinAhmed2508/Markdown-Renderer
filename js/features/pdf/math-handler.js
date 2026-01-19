/**
 * Math Handler Module
 * Processes KaTeX math elements for PDF export
 */

import { getThemeColors } from './config.js';

/**
 * Process all math elements in the clone for PDF
 * @param {HTMLElement} clone - Cloned element
 * @param {boolean} isLight - Light theme flag
 */
export function processMathElements(clone, isLight) {
    const colors = getThemeColors(isLight);

    // Process display math blocks
    clone.querySelectorAll('.math-display').forEach(el => {
        Object.assign(el.style, {
            display: 'block',
            width: '100%',
            margin: '1.2em 0',
            textAlign: 'center',
            overflow: 'visible',
            color: colors.text
        });
    });

    // Process KaTeX display elements
    clone.querySelectorAll('.katex-display').forEach(el => {
        Object.assign(el.style, {
            margin: '0',
            padding: '0.5em 0',
            overflow: 'visible'
        });
    });

    // Process inline KaTeX
    clone.querySelectorAll('.katex').forEach(el => {
        Object.assign(el.style, {
            fontSize: '1.1em',
            color: colors.text
        });
    });

    // Ensure KaTeX HTML spans inherit color
    clone.querySelectorAll('.katex-html').forEach(el => {
        el.style.color = 'inherit';
    });

    return clone;
}
