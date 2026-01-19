/**
 * Code Handler Module
 * Processes code blocks for PDF export
 */

import { FONTS, getThemeColors } from './config.js';

/**
 * Process all code blocks for PDF
 * @param {HTMLElement} clone - Cloned element
 * @param {boolean} isLight - Light theme flag
 */
export function processCodeBlocks(clone, isLight) {
    const colors = getThemeColors(isLight);

    // Style pre elements (code block containers)
    clone.querySelectorAll('pre').forEach(pre => {
        Object.assign(pre.style, {
            backgroundColor: colors.codeBg,
            border: `1px solid ${colors.codeBorder}`,
            borderRadius: '8px',
            padding: '16px',
            margin: '1em 0',
            overflow: 'auto',
            fontSize: `${FONTS.SIZE_CODE}px`,
            lineHeight: '1.5'
        });
    });

    // Style code elements
    clone.querySelectorAll('code').forEach(code => {
        const isInPre = code.closest('pre');

        Object.assign(code.style, {
            fontFamily: FONTS.MONO,
            fontSize: isInPre ? 'inherit' : '0.9em',
            backgroundColor: isInPre ? 'transparent' : colors.codeBg,
            padding: isInPre ? '0' : '2px 6px',
            borderRadius: isInPre ? '0' : '4px',
            color: colors.text
        });
    });

    // Remove copy buttons (handled by element-cloner too)
    clone.querySelectorAll('.copy-code-btn').forEach(btn => btn.remove());

    // Style code block wrappers
    clone.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
        Object.assign(wrapper.style, {
            position: 'relative',
            margin: '1em 0'
        });
    });

    return clone;
}
