/**
 * Theme Styles Module
 * Generates complete CSS for PDF based on current theme
 */

import { PAGE, FONTS, getThemeColors } from './config.js';

/**
 * Detect if light theme is active
 */
export function isLightMode() {
    return document.body.getAttribute('data-theme') === 'light';
}

/**
 * Generate complete inline CSS for PDF container
 */
export function generateContainerStyles(isLight) {
    const c = getThemeColors(isLight);

    return `
        position: fixed;
        top: -10000px;
        left: 0;
        width: ${PAGE.WIDTH}px;
        background-color: ${c.bg};
        color: ${c.text};
        font-family: ${FONTS.BODY};
        font-size: ${FONTS.SIZE_BASE}px;
        line-height: ${FONTS.LINE_HEIGHT};
        padding: ${PAGE.MARGIN}px;
        box-sizing: border-box;
        z-index: -9999;
    `.trim().replace(/\s+/g, ' ');
}

/**
 * Generate markdown body styles
 */
export function generateBodyStyles(isLight) {
    const c = getThemeColors(isLight);

    return {
        backgroundColor: 'transparent',
        color: c.text,
        width: '100%',
        height: 'auto',
        overflow: 'visible'
    };
}

/**
 * Generate heading styles
 */
export function getHeadingStyles(isLight) {
    const c = getThemeColors(isLight);
    return {
        color: c.text,
        fontWeight: '600',
        marginTop: '1.5em',
        marginBottom: '0.5em',
        lineHeight: '1.3'
    };
}

/**
 * Generate link styles
 */
export function getLinkStyles(isLight) {
    const c = getThemeColors(isLight);
    return {
        color: c.link,
        textDecoration: 'none'
    };
}

/**
 * Generate blockquote styles
 */
export function getBlockquoteStyles(isLight) {
    const c = getThemeColors(isLight);
    return {
        borderLeft: `3px solid ${c.blockquoteBorder}`,
        margin: '1em 0',
        padding: '0.5em 1em',
        background: isLight ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)',
        borderRadius: '0 8px 8px 0',
        color: c.textMuted
    };
}
