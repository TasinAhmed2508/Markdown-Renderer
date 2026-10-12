/**
 * Code Theme Print Module
 * The app can be set to a dark syntax theme (github-dark by default) while a PDF
 * is printed on white paper, which makes highlighted code hard to read. During an
 * export the highlight.js stylesheet is swapped to a light theme and re-applied.
 */

const LIGHT_HLJS_THEME = 'github.min.css';

function getHljsLink() {
    return document.querySelector('link[href*="highlight.js"][href*="styles"]');
}

function rehighlight(root) {
    if (!window.hljs) return;
    const scope = root || document;
    scope.querySelectorAll('pre code').forEach((block) => {
        if (block.closest('.mermaid') || block.classList.contains('language-mermaid')) return;
        block.removeAttribute('data-highlighted');
        try { window.hljs.highlightElement(block); } catch { /* ignore */ }
    });
}

function swapTheme(link, href) {
    return new Promise((resolve) => {
        let settled = false;
        const done = () => {
            if (settled) return;
            settled = true;
            // Give the browser a frame to apply the new stylesheet.
            requestAnimationFrame(() => requestAnimationFrame(resolve));
        };
        link.addEventListener('load', done, { once: true });
        link.addEventListener('error', done, { once: true });
        link.href = href;
        setTimeout(done, 700);
    });
}

/**
 * Run `task` with a light syntax-highlighting theme applied, then restore.
 * @param {Function} task
 */
export async function withLightCodeTheme(task) {
    const link = getHljsLink();
    const original = link ? link.getAttribute('href') : null;
    if (!link || !original || original.endsWith(LIGHT_HLJS_THEME)) return task();

    const lightHref = original.replace(/[^/]+\.min\.css$/, LIGHT_HLJS_THEME);
    if (!lightHref || lightHref === original) return task();

    await swapTheme(link, lightHref);
    rehighlight();

    try {
        return await task();
    } finally {
        await swapTheme(link, original);
        rehighlight();
    }
}
