/**
 * PDF Configuration Module
 * Centralized settings for PDF generation
 */

// A4 dimensions at 96 DPI
export const PAGE = {
    WIDTH: 794,      // ~210mm in pixels
    HEIGHT: 1123,    // ~297mm in pixels
    MARGIN: 48,      // Page margins
    PADDING: 32      // Content padding
};

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

/**
 * Build html2pdf options
 */
export function buildPdfOptions(filename, bgColor) {
    return {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: bgColor,
            logging: false,
            scrollY: 0,
            windowWidth: PAGE.WIDTH,
            allowTaint: true
        },
        jsPDF: {
            unit: 'px',
            format: 'a4',
            orientation: 'portrait',
            hotfixes: ['px_scaling']
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
}
