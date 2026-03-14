/**
 * Link Preview Module
 * Shows hover preview cards for links in the preview pane
 */

let stylesInjected = false;
let activeCard = null;
let hideTimeout = null;

const PATTERNS = {
    github:  /^https?:\/\/(www\.)?github\.com\/([^/]+)\/([^/]+)/i,
    youtube: /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
    twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/([^/]+)\/(status\/\d+)?/i,
    npm:     /^https?:\/\/(www\.)?npmjs\.com\/package\/(@?[^/?#]+(?:\/[^/?#]+)?)/i,
};

function injectStyles() {
    if (stylesInjected) return;
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.id = 'link-preview-styles';
    style.textContent = `
.link-preview-card {
    position: fixed;
    z-index: 10000;
    min-width: 280px;
    max-width: 360px;
    background: var(--card-bg, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.45;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--text-color, #333);
}
.link-preview-card.visible {
    opacity: 1;
    transform: translateY(0);
}
.link-preview-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}
.link-preview-favicon {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    flex-shrink: 0;
}
.link-preview-type {
    font-weight: 600;
    font-size: 13px;
    color: var(--link-preview-type-color, #555);
}
.link-preview-domain {
    color: var(--text-muted, #888);
    font-size: 11px;
    margin-bottom: 4px;
    word-break: break-all;
}
.link-preview-url {
    color: var(--text-muted, #888);
    font-size: 11px;
    word-break: break-all;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.link-preview-thumbnail {
    width: 100%;
    border-radius: 4px;
    margin-bottom: 6px;
}
.link-preview-open {
    display: inline-block;
    font-size: 11px;
    color: var(--link-color, #2196F3);
    text-decoration: none;
    font-weight: 500;
}
.link-preview-open:hover {
    text-decoration: underline;
}
`;
    document.head.appendChild(style);
    stylesInjected = true;
}

/**
 * Extract domain from a URL string.
 */
function getDomain(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

/**
 * Get path portion of URL (without query/hash).
 */
function getPath(url) {
    try {
        const u = new URL(url);
        return u.pathname;
    } catch {
        return '';
    }
}

/**
 * Build preview card content based on URL type.
 */
function buildCardContent(url) {
    const domain = getDomain(url);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;

    let typeLabel = domain;
    let description = '';
    let thumbnailHtml = '';
    let iconOverride = '';

    // GitHub
    const ghMatch = url.match(PATTERNS.github);
    if (ghMatch) {
        const user = ghMatch[2];
        const repo = ghMatch[3].replace(/\.git$/, '').split(/[?#]/)[0];
        typeLabel = 'GitHub Repository';
        description = `${user}/${repo}`;
        iconOverride = '🐙';
    }

    // YouTube
    const ytMatch = url.match(PATTERNS.youtube);
    if (ytMatch) {
        const videoId = ytMatch[3];
        typeLabel = 'YouTube Video';
        thumbnailHtml = `<img class="link-preview-thumbnail" src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Video thumbnail" onerror="this.style.display='none'">`;
        iconOverride = '▶️';
    }

    // Twitter / X
    const twMatch = url.match(PATTERNS.twitter);
    if (twMatch) {
        const user = twMatch[3];
        typeLabel = 'Twitter/X Post';
        description = twMatch[4] ? `Post by @${user}` : `@${user}`;
        iconOverride = '🐦';
    }

    // npm
    const npmMatch = url.match(PATTERNS.npm);
    if (npmMatch) {
        const pkg = npmMatch[2];
        typeLabel = 'npm Package';
        description = pkg;
        iconOverride = '📦';
    }

    // Generic fallback
    if (!ghMatch && !ytMatch && !twMatch && !npmMatch) {
        const path = getPath(url);
        if (path && path !== '/') {
            description = path.length > 60 ? path.substring(0, 57) + '...' : path;
        }
    }

    const iconHtml = iconOverride
        ? `<span style="font-size:16px;line-height:1;">${iconOverride}</span>`
        : `<img class="link-preview-favicon" src="${faviconUrl}" alt="" onerror="this.style.display='none'">`;

    let html = `<div class="link-preview-header">${iconHtml}<span class="link-preview-type">${typeLabel}</span></div>`;

    if (thumbnailHtml) html += thumbnailHtml;
    if (description) html += `<div class="link-preview-domain">${escapeHtml(description)}</div>`;

    html += `<div class="link-preview-url">${escapeHtml(url)}</div>`;
    html += `<a class="link-preview-open" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">Open ↗</a>`;

    return html;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Show the preview card near the link element.
 */
function showCard(linkEl, url) {
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }

    // Reuse or create card element
    if (!activeCard) {
        activeCard = document.createElement('div');
        activeCard.className = 'link-preview-card';
        document.body.appendChild(activeCard);

        activeCard.addEventListener('mouseenter', () => {
            if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
        });
        activeCard.addEventListener('mouseleave', () => {
            hideCard();
        });
    }

    activeCard.innerHTML = buildCardContent(url);
    activeCard.classList.remove('visible');

    // Position near the link
    const rect = linkEl.getBoundingClientRect();
    const cardWidth = 320;
    let left = rect.left;
    let top = rect.bottom + 6;

    // Keep within viewport
    if (left + cardWidth > window.innerWidth) {
        left = window.innerWidth - cardWidth - 12;
    }
    if (left < 8) left = 8;

    // If card would go below viewport, show above
    if (top + 200 > window.innerHeight) {
        top = rect.top - 10;
        activeCard.style.transform = 'translateY(-100%)';
    } else {
        activeCard.style.transform = '';
    }

    activeCard.style.left = left + 'px';
    activeCard.style.top = top + 'px';

    // Trigger animation
    requestAnimationFrame(() => {
        activeCard.classList.add('visible');
    });
}

/**
 * Hide the preview card with a short delay.
 */
function hideCard() {
    hideTimeout = setTimeout(() => {
        if (activeCard) {
            activeCard.classList.remove('visible');
            setTimeout(() => {
                if (activeCard && !activeCard.classList.contains('visible')) {
                    activeCard.remove();
                    activeCard = null;
                }
            }, 180);
        }
    }, 200);
}

/**
 * Initialize link preview hover behavior on all external links
 * within the preview pane.
 */
export function initLinkPreview() {
    if (typeof document === 'undefined') return;

    injectStyles();

    // Target the preview container
    const previewPane = document.querySelector('#preview') ||
                        document.querySelector('.preview-pane') ||
                        document.querySelector('.markdown-body');

    if (!previewPane) return;

    // Use event delegation for efficiency
    previewPane.addEventListener('mouseenter', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        // Only external links (http/https)
        if (!href.startsWith('http://') && !href.startsWith('https://')) return;
        // Skip footnote and anchor links
        if (href.startsWith('#') || link.classList.contains('footnote-backref')) return;

        showCard(link, href);
    }, true);

    previewPane.addEventListener('mouseleave', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        hideCard();
    }, true);
}
