/**
 * Admonitions Module
 * Converts GitHub/Obsidian-style callout blockquotes into styled callout blocks
 */

const ADMONITION_TYPES = {
    NOTE:      { icon: 'ℹ️',  color: '#2196F3', bg: 'rgba(33,150,243,0.08)',  title: 'Note' },
    TIP:       { icon: '💡',  color: '#4CAF50', bg: 'rgba(76,175,80,0.08)',   title: 'Tip' },
    WARNING:   { icon: '⚠️',  color: '#FF9800', bg: 'rgba(255,152,0,0.08)',   title: 'Warning' },
    CAUTION:   { icon: '🔴',  color: '#F44336', bg: 'rgba(244,67,54,0.08)',   title: 'Caution' },
    IMPORTANT: { icon: '❗',  color: '#9C27B0', bg: 'rgba(156,39,176,0.08)',  title: 'Important' },
};

let stylesInjected = false;

function injectStyles() {
    if (stylesInjected) return;
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.id = 'admonition-styles';
    style.textContent = `
.admonition {
    border-left: 4px solid var(--adm-color, #2196F3);
    background: var(--adm-bg, rgba(33,150,243,0.08));
    border-radius: 4px;
    padding: 12px 16px;
    margin: 16px 0;
    overflow: hidden;
}
.admonition-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 0.95em;
    margin-bottom: 8px;
    color: var(--adm-color, #2196F3);
}
.admonition-icon {
    font-size: 1.15em;
    line-height: 1;
    flex-shrink: 0;
}
.admonition-body {
    font-size: 0.93em;
    line-height: 1.6;
}
.admonition-body > p:first-child { margin-top: 0; }
.admonition-body > p:last-child  { margin-bottom: 0; }
`;
    document.head.appendChild(style);
    stylesInjected = true;
}

/**
 * Process admonitions in rendered HTML.
 * Detects blockquotes starting with [!TYPE] and converts them to styled callout divs.
 * @param {string} html - Rendered HTML string
 * @returns {string} HTML with admonitions processed
 */
export function processAdmonitions(html) {
    if (!html) return html;

    injectStyles();

    // Match blockquotes whose first line contains [!TYPE]
    // marked renders blockquotes as <blockquote>\n<p>[!NOTE]...
    const blockquoteRegex = /<blockquote>\s*<p>\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]\s*<br\s*\/?>\s*([\s\S]*?)<\/p>([\s\S]*?)<\/blockquote>/gi;

    let result = html.replace(blockquoteRegex, (_, type, firstContent, rest) => {
        const key = type.toUpperCase();
        const config = ADMONITION_TYPES[key];
        if (!config) return _;

        const body = (firstContent + rest).trim();

        return `<div class="admonition" style="--adm-color:${config.color};--adm-bg:${config.bg}">` +
            `<div class="admonition-header">` +
                `<span class="admonition-icon">${config.icon}</span>` +
                `<span>${config.title}</span>` +
            `</div>` +
            `<div class="admonition-body">${body}</div>` +
        `</div>`;
    });

    // Also handle the variant where [!TYPE] is followed by a newline (rendered as </p>\n<p>)
    const blockquoteRegex2 = /<blockquote>\s*<p>\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]<\/p>\s*([\s\S]*?)<\/blockquote>/gi;

    result = result.replace(blockquoteRegex2, (_, type, content) => {
        const key = type.toUpperCase();
        const config = ADMONITION_TYPES[key];
        if (!config) return _;

        const body = content.trim();

        return `<div class="admonition" style="--adm-color:${config.color};--adm-bg:${config.bg}">` +
            `<div class="admonition-header">` +
                `<span class="admonition-icon">${config.icon}</span>` +
                `<span>${config.title}</span>` +
            `</div>` +
            `<div class="admonition-body">${body}</div>` +
        `</div>`;
    });

    // Handle inline variant: [!TYPE] followed by text on same line (no <br>)
    const blockquoteRegex3 = /<blockquote>\s*<p>\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]\s+([\s\S]*?)<\/p>([\s\S]*?)<\/blockquote>/gi;

    result = result.replace(blockquoteRegex3, (_, type, firstContent, rest) => {
        const key = type.toUpperCase();
        const config = ADMONITION_TYPES[key];
        if (!config) return _;

        const body = ('<p>' + firstContent + '</p>' + rest).trim();

        return `<div class="admonition" style="--adm-color:${config.color};--adm-bg:${config.bg}">` +
            `<div class="admonition-header">` +
                `<span class="admonition-icon">${config.icon}</span>` +
                `<span>${config.title}</span>` +
            `</div>` +
            `<div class="admonition-body">${body}</div>` +
        `</div>`;
    });

    return result;
}
