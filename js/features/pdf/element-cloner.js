/**
 * Element Cloner Module
 * Deep clones DOM elements with computed styles preserved
 */

/**
 * List of CSS properties to copy (optimized subset for print)
 */
const STYLE_PROPS = [
    'color', 'backgroundColor', 'background',
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
    'textAlign', 'textDecoration', 'lineHeight', 'letterSpacing',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'border', 'borderRadius', 'borderColor', 'borderWidth', 'borderStyle',
    'display', 'width', 'maxWidth', 'height', 'minHeight',
    'overflow', 'whiteSpace', 'wordBreak',
    'listStyleType', 'listStylePosition'
];

/**
 * Deep clone an element with computed styles
 * @param {HTMLElement} element - Source element
 * @param {boolean} copyStyles - Whether to copy computed styles
 * @returns {HTMLElement} Cloned element with inline styles
 */
export function deepCloneWithStyles(element, copyStyles = true) {
    const clone = element.cloneNode(true);

    if (copyStyles) {
        applyComputedStyles(element, clone);
    }

    return clone;
}

/**
 * Apply computed styles from source to clone (recursive)
 */
function applyComputedStyles(source, clone) {
    // Skip text nodes
    if (source.nodeType !== Node.ELEMENT_NODE) return;

    const computed = window.getComputedStyle(source);

    // Copy essential styles
    STYLE_PROPS.forEach(prop => {
        const value = computed.getPropertyValue(prop);
        if (value && value !== 'initial' && value !== 'none') {
            clone.style.setProperty(prop, value);
        }
    });

    // Recurse into children
    const sourceChildren = source.children;
    const cloneChildren = clone.children;

    for (let i = 0; i < sourceChildren.length; i++) {
        if (cloneChildren[i]) {
            applyComputedStyles(sourceChildren[i], cloneChildren[i]);
        }
    }
}

/**
 * Remove interactive elements from clone
 */
export function removeInteractiveElements(clone) {
    // Remove copy buttons
    clone.querySelectorAll('.copy-code-btn').forEach(el => el.remove());

    // Remove any other buttons
    clone.querySelectorAll('button').forEach(el => el.remove());

    // Remove inputs
    clone.querySelectorAll('input, textarea').forEach(el => el.remove());

    return clone;
}

/**
 * Ensure all images have explicit dimensions
 */
export function fixImageDimensions(clone) {
    clone.querySelectorAll('img').forEach(img => {
        if (!img.style.width) img.style.width = `${img.naturalWidth}px`;
        if (!img.style.height) img.style.height = `${img.naturalHeight}px`;
        img.style.maxWidth = '100%';
    });
    return clone;
}
