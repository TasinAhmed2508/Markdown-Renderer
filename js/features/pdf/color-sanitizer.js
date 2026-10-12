/**
 * Color Sanitizer Module
 * html2canvas 1.4.x throws on CSS Color 4 functions (oklab/oklch/lab/lch/color-mix)
 * which modern Tailwind builds and color-mix() can produce in computed styles.
 * Exports only need the *rendered* appearance, so any such value is resolved to an
 * equivalent rgb()/rgba() string before the capture starts.
 */

const MODERN_COLOR = /(oklab|oklch|\blab\(|\blch\(|color-mix\(|\bcolor\(|light-dark\()/i;

let probeCtx = null;

function getProbeCtx() {
    if (probeCtx) return probeCtx;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    probeCtx = canvas.getContext('2d', { willReadFrequently: true });
    return probeCtx;
}

/**
 * Resolve a single CSS color value to rgb()/rgba() using the canvas 2D parser.
 * Returns null when the browser cannot normalise it either.
 */
function probeColor(value) {
    const ctx = getProbeCtx();
    if (!ctx) return null;
    try {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = '#000000';
        ctx.fillStyle = value;                 // invalid values leave fillStyle untouched
        const normalized = ctx.fillStyle;
        if (MODERN_COLOR.test(normalized)) return null;
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        if (a === 0) return 'transparent';
        return a === 255
            ? `rgb(${r}, ${g}, ${b})`
            : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    } catch {
        return null;
    }
}

const COLOR_PROPS = [
    'color',
    'background-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color',
    'fill',
    'stroke',
    'caret-color',
];

function replaceColorFunctions(value) {
    // Self-contained functions, e.g. oklab(0.7 0 0 / 0.5)
    return value.replace(/(oklab|oklch|lab|lch)\(([^()]*)\)/gi, (match) => probeColor(match) || 'rgb(128, 128, 128)');
}

/**
 * Walk a cloned document and replace colors html2canvas cannot parse.
 * The sweep only runs when a modern color is actually detected, so normal
 * exports keep their current speed.
 * @param {Document} doc - the cloned document handed over by html2canvas
 */
export function sanitizeModernColors(doc) {
    if (!doc || typeof doc.querySelectorAll !== 'function') return;
    const win = doc.defaultView || window;
    if (!win) return;

    // Cheap pre-check on the root elements before walking the whole tree.
    const roots = [doc.documentElement, doc.body].filter(Boolean);
    let suspicious = roots.some((el) => {
        let cs; try { cs = win.getComputedStyle(el); } catch { return false; }
        return MODERN_COLOR.test(cs.color || '') || MODERN_COLOR.test(cs.backgroundColor || '');
    });
    // Also probe a few typical Tailwind utility elements.
    if (!suspicious) {
        const sample = doc.querySelectorAll('button, .glass-pane, [class*="bg-"], [class*="text-"]');
        for (let i = 0; i < sample.length && i < 40; i++) {
            let cs; try { cs = win.getComputedStyle(sample[i]); } catch { continue; }
            if (MODERN_COLOR.test(cs.color || '') || MODERN_COLOR.test(cs.backgroundColor || '')) {
                suspicious = true;
                break;
            }
        }
    }
    if (!suspicious) return;

    doc.querySelectorAll('*').forEach((el) => {
        if (!el.style) return;
        let cs;
        try { cs = win.getComputedStyle(el); } catch { return; }

        COLOR_PROPS.forEach((prop) => {
            const value = cs.getPropertyValue(prop);
            if (!value || !MODERN_COLOR.test(value)) return;
            const resolved = probeColor(value) || replaceColorFunctions(value);
            if (resolved) el.style.setProperty(prop, resolved, 'important');
        });

        const bgImage = cs.getPropertyValue('background-image');
        if (bgImage && bgImage !== 'none' && MODERN_COLOR.test(bgImage)) {
            const resolved = replaceColorFunctions(bgImage);
            el.style.setProperty('background-image', MODERN_COLOR.test(resolved) ? 'none' : resolved, 'important');
        }

        const boxShadow = cs.getPropertyValue('box-shadow');
        if (boxShadow && boxShadow !== 'none' && MODERN_COLOR.test(boxShadow)) {
            const resolved = replaceColorFunctions(boxShadow);
            el.style.setProperty('box-shadow', MODERN_COLOR.test(resolved) ? 'none' : resolved, 'important');
        }
    });
}
