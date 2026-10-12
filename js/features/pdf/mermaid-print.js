/**
 * Mermaid Print Module
 * The preview renders diagrams with the dark mermaid theme, which turns into an
 * unreadable dark block in a printed/PDF page. For the duration of a PDF export
 * every diagram is re-rendered with the light "neutral" theme and rasterised to
 * a PNG, because html2canvas drops the internals of inline <svg> elements
 * (node labels are HTML inside <foreignObject>, which it cannot capture).
 */

function appMermaidConfig() {
    const light = document.body?.getAttribute('data-theme') === 'light';
    return { startOnLoad: false, theme: light ? 'default' : 'dark', securityLevel: 'loose' };
}
const PRINT_MERMAID_CONFIG = { startOnLoad: false, theme: 'neutral', securityLevel: 'loose' };

// Supersampling factor for rasterised diagrams.
const RASTER_SCALE = 3;
const PNG_EXPORT_STYLE = 'display:block;width:100%;height:auto;max-width:100%;';

let counter = 0;

function svgSize(svg) {
    const box = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    if (box.length === 4 && box[2] > 0 && box[3] > 0) return { w: box[2], h: box[3] };

    const width = parseFloat(svg.getAttribute('width')) || svg.getBoundingClientRect().width || 800;
    const height = parseFloat(svg.getAttribute('height')) || svg.getBoundingClientRect().height || 400;
    return { w: width, h: height };
}

/**
 * Render the given SVG markup to a PNG data URL.
 */
function svgToPngDataUrl(svgMarkup, width, height) {
    return new Promise((resolve) => {
        const xml = svgMarkup.includes('xmlns=')
            ? svgMarkup
            : svgMarkup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');

        const img = new Image();
        img.decoding = 'sync';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(width * RASTER_SCALE));
                canvas.height = Math.max(1, Math.round(height * RASTER_SCALE));
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/png'));
            } catch (err) {
                console.warn('Diagram rasterisation failed:', err);
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    });
}

/**
 * Run `task` with every mermaid diagram inside `element` re-rendered for print.
 * Always restores the original (preview) diagrams afterwards.
 * @param {HTMLElement} element
 * @param {Function} task
 */
export async function withPrintDiagrams(element, task) {
    const mermaid = window.mermaid;
    if (!mermaid || typeof mermaid.render !== 'function') return task();

    const nodes = Array.from(element.querySelectorAll('.mermaid'));
    const restorers = [];

    try {
        mermaid.initialize(PRINT_MERMAID_CONFIG);

        for (const node of nodes) {
            const source = node.dataset.source || node.textContent || '';
            if (!source.trim()) continue;

            const original = node.innerHTML;
            try {
                counter += 1;
                const { svg } = await mermaid.render(`renderx-print-${counter}`, source);
                node.innerHTML = svg;

                const svgEl = node.querySelector('svg');
                if (!svgEl) continue;

                const { w, h } = svgSize(svgEl);
                const png = await svgToPngDataUrl(svgEl.outerHTML, w, h);
                if (png) {
                    node.innerHTML = `<img src="${png}" alt="Diagram" style="${PNG_EXPORT_STYLE}">`;
                } else {
                    svgEl.setAttribute('width', String(w));
                    svgEl.setAttribute('height', String(h));
                    svgEl.style.cssText = PNG_EXPORT_STYLE;
                }

                restorers.push(() => { node.innerHTML = original; });
            } catch (err) {
                // Keep the preview diagram; the container is styled for print anyway.
                console.warn('Print diagram render failed, keeping preview version:', err);
            }
        }

        return await task();
    } finally {
        restorers.forEach((restore) => {
            try { restore(); } catch { /* ignore */ }
        });
        try { mermaid.initialize(appMermaidConfig()); } catch { /* ignore */ }
    }
}
