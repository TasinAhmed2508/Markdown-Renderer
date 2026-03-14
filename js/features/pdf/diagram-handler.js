/**
 * Diagram Handler Module
 * Processes Mermaid, Chart.js, and PlantUML diagrams for PDF
 */

/**
 * Process all diagram elements for PDF export
 * @param {HTMLElement} sourceEl - Original element (for canvas data)
 * @param {HTMLElement} clone - Cloned element
 */
export function processDiagrams(sourceEl, clone) {
    processMermaidSVGs(clone);
    processCanvasElements(sourceEl, clone);
    processPlantUMLImages(clone);
    return clone;
}

/**
 * Process Mermaid SVG diagrams
 */
function processMermaidSVGs(clone) {
    clone.querySelectorAll('.mermaid').forEach(el => {
        const svg = el.querySelector('svg');
        if (svg) {
            // Ensure SVG has explicit dimensions
            const rect = svg.getBoundingClientRect();
            if (!svg.getAttribute('width')) {
                svg.setAttribute('width', rect.width || 400);
            }
            if (!svg.getAttribute('height')) {
                svg.setAttribute('height', rect.height || 300);
            }

            // Keep diagram proportions while making print layout compact
            svg.style.maxWidth = '100%';
            svg.style.height = 'auto';

            // Style the container
            Object.assign(el.style, {
                display: 'block',
                margin: '1.1em auto',
                textAlign: 'center',
                overflow: 'visible',
                padding: '12px',
                background: 'transparent',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '8px',
                breakInside: 'avoid',
                pageBreakInside: 'avoid'
            });
        }
    });
}

/**
 * Copy canvas content (Chart.js)
 */
function processCanvasElements(sourceEl, clone) {
    const origCanvases = sourceEl.querySelectorAll('canvas');
    const cloneCanvases = clone.querySelectorAll('canvas');

    origCanvases.forEach((orig, i) => {
        const cloneCanvas = cloneCanvases[i];
        if (!cloneCanvas) return;

        try {
            const rect = orig.getBoundingClientRect();
            const width = orig.width || Math.round(rect.width);
            const height = orig.height || Math.round(rect.height);

            // Set explicit dimensions
            if (width > 0) cloneCanvas.width = width;
            if (height > 0) cloneCanvas.height = height;
            if (width > 0) cloneCanvas.style.width = `${width}px`;
            if (height > 0) cloneCanvas.style.height = `${height}px`;

            // Copy canvas content
            const ctx = cloneCanvas.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, cloneCanvas.width, cloneCanvas.height);
            ctx.drawImage(orig, 0, 0);

            // Style container
            const container = cloneCanvas.closest('.chart-container');
            if (container) {
                Object.assign(container.style, {
                    margin: '1.1em auto',
                    padding: '0.75rem',
                    maxWidth: '100%',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                });
            }
        } catch (e) {
            console.warn('Canvas copy failed:', e);
        }
    });
}

/**
 * Process PlantUML images
 */
function processPlantUMLImages(clone) {
    clone.querySelectorAll('.plantuml-diagram').forEach(img => {
        Object.assign(img.style, {
            display: 'block',
            maxWidth: '100%',
            margin: '1.5em auto',
            background: 'white',
            borderRadius: '0.5rem'
        });
    });
}
