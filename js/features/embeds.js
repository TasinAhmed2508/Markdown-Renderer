const RE_CODESANDBOX = /^https:\/\/codesandbox\.io\/s\/([a-zA-Z0-9-]+)\/?$/i;
const RE_REPLIT = /^https:\/\/replit\.com\/@[\w-]+\/[\w-]+\/?$/i;

function getEmbedMarkup(url) {
    const sandboxMatch = url.match(RE_CODESANDBOX);
    if (sandboxMatch) {
        const embedUrl = `https://codesandbox.io/embed/${sandboxMatch[1]}`;
        return `<div class="embed-container"><iframe src="${embedUrl}?fontsize=14&hidenavigation=1&theme=dark" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" title="CodeSandbox" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe></div>`;
    }
    if (RE_REPLIT.test(url)) {
        return `<div class="embed-container"><iframe src="${url}?embed=true" width="100%" height="500px" style="border:0; border-radius: 4px; overflow:hidden;" title="Replit"></iframe></div>`;
    }
    return '';
}

function createEmbedNode(url) {
    const markup = getEmbedMarkup(url);
    if (!markup) return null;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = markup;
    return wrapper.firstElementChild;
}

function replaceEmbedAnchor(anchor) {
    const href = (anchor.getAttribute('href') || '').trim();
    const embedNode = createEmbedNode(href);
    if (!embedNode) return;

    const parent = anchor.parentElement;
    const onlyAnchorInParagraph = parent &&
        parent.tagName === 'P' &&
        parent.children.length === 1 &&
        parent.textContent.trim() === anchor.textContent.trim();

    if (onlyAnchorInParagraph) parent.replaceWith(embedNode);
    else anchor.replaceWith(embedNode);
}

function replaceTextNode(node) {
    const value = (node.nodeValue || '').trim();
    if (!value) return;
    const parent = node.parentElement;
    if (!parent) return;
    if (['A', 'CODE', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) return;

    const embedNode = createEmbedNode(value);
    if (!embedNode) return;

    if (parent.tagName === 'P' && parent.childNodes.length === 1) parent.replaceWith(embedNode);
    else node.replaceWith(embedNode);
}

export function processEmbeds(html) {
    if (!html) return html;

    // Lightweight fallback for non-DOM environments.
    if (typeof document === 'undefined') {
        const trimmed = html.trim();
        return getEmbedMarkup(trimmed) || html;
    }

    const container = document.createElement('div');
    container.innerHTML = html;

    container.querySelectorAll('a[href]').forEach(replaceEmbedAnchor);

    const textNodes = [];
    if (typeof NodeFilter !== 'undefined') {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        let current = walker.nextNode();
        while (current) {
            textNodes.push(current);
            current = walker.nextNode();
        }
    }
    textNodes.forEach(replaceTextNode);

    return container.innerHTML;
}
