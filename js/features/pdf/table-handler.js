/**
 * Table Handler Module
 * Processes tables for PDF export
 */

import { getThemeColors } from './config.js';

/**
 * Process all tables for PDF
 * @param {HTMLElement} clone - Cloned element
 * @param {boolean} isLight - Light theme flag
 */
export function processTables(clone, isLight) {
    const colors = getThemeColors(isLight);

    // Style tables
    clone.querySelectorAll('table').forEach(table => {
        Object.assign(table.style, {
            width: '100%',
            borderCollapse: 'collapse',
            margin: '1.5em 0',
            border: `1px solid ${colors.tableBorder}`,
            borderRadius: '8px',
            overflow: 'hidden'
        });
    });

    // Style header row
    clone.querySelectorAll('thead').forEach(thead => {
        Object.assign(thead.style, {
            backgroundColor: colors.tableHeader
        });
    });

    // Style header cells
    clone.querySelectorAll('th').forEach(th => {
        Object.assign(th.style, {
            padding: '12px 16px',
            textAlign: 'left',
            fontWeight: '600',
            color: colors.text,
            borderBottom: `1px solid ${colors.tableBorder}`,
            fontSize: '0.85em',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        });
    });

    // Style data cells
    clone.querySelectorAll('td').forEach(td => {
        Object.assign(td.style, {
            padding: '10px 16px',
            color: colors.text,
            borderBottom: `1px solid ${colors.tableBorder}`
        });
    });

    // Zebra striping
    clone.querySelectorAll('tbody tr').forEach((tr, i) => {
        if (i % 2 === 1) {
            tr.style.backgroundColor = isLight
                ? 'rgba(0, 0, 0, 0.02)'
                : 'rgba(255, 255, 255, 0.02)';
        }
    });

    return clone;
}
