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

            // Style the container
            Object.assign(el.style, {
                display: 'block',
                margin: '1.5em auto',
                textAlign: 'center',
                overflow: 'visible'
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
            // Set explicit dimensions
            cloneCanvas.width = orig.width;
            cloneCanvas.height = orig.height;

            // Copy canvas content
            const ctx = cloneCanvas.getContext('2d');
            ctx.drawImage(orig, 0, 0);

            // Style container
            const container = cloneCanvas.closest('.chart-container');
            if (container) {
                Object.assign(container.style, {
                    margin: '1.5em auto',
                    padding: '1rem',
                    maxWidth: '100%'
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
