/**
 * Footnotes Module
 * Parses [^N] references and [^N]: definitions into proper footnote markup
 */

/**
 * Process footnote references and definitions in rendered HTML.
 * References become superscript links; definitions become an ordered list at the bottom.
 * @param {string} html - The rendered HTML string
 * @returns {string} HTML with footnotes processed
 */
export function processFootnotes(html) {
    if (!html) return html;

    const definitionRegex = /\[\^(\d+)\]:\s*([\s\S]*?)(?=\n\[\^\d+\]:|$)/g;
    const referenceRegex = /\[\^(\d+)\]/g;

    // 1. Extract footnote definitions
    const definitions = new Map();
    let cleaned = html;

    // Collect definitions — they may appear inside <p> tags after marked parses them
    const defPatternHtml = /<p>\[\^(\d+)\]:\s*([\s\S]*?)<\/p>/g;
    let match;

    while ((match = defPatternHtml.exec(cleaned)) !== null) {
        const id = match[1];
        const text = match[2].trim();
        definitions.set(id, text);
    }

    // Also try raw-style definitions (in case they survive parsing outside <p>)
    const defPatternRaw = /\[\^(\d+)\]:\s*(.+)/g;
    let rawCleaned = cleaned;
    while ((match = defPatternRaw.exec(rawCleaned)) !== null) {
        const id = match[1];
        if (!definitions.has(id)) {
            definitions.set(id, match[2].trim());
        }
    }

    if (definitions.size === 0) return html;

    // 2. Remove definition blocks from the HTML
    cleaned = cleaned.replace(/<p>\[\^(\d+)\]:\s*[\s\S]*?<\/p>/g, '');
    cleaned = cleaned.replace(/\[\^(\d+)\]:\s*.+/g, '');

    // 3. Replace references with superscript links (skip already-processed anchors and code)
    cleaned = cleaned.replace(/(<code[\s\S]*?<\/code>|<a[\s\S]*?<\/a>)|(\[\^(\d+)\])/g,
        (fullMatch, codeOrLink, ref, id) => {
            if (codeOrLink) return codeOrLink;
            if (id && definitions.has(id)) {
                return `<sup class="footnote-ref"><a href="#fn-${id}" id="fnref-${id}">${id}</a></sup>`;
            }
            return fullMatch;
        }
    );

    // 4. Build footnotes section
    const sortedIds = Array.from(definitions.keys()).sort((a, b) => Number(a) - Number(b));
    let footnotesHtml = '<section class="footnotes"><hr><ol>';

    for (const id of sortedIds) {
        const text = definitions.get(id);
        footnotesHtml += `<li id="fn-${id}"><p>${text} <a href="#fnref-${id}" class="footnote-backref" title="Back to reference">↩</a></p></li>`;
    }

    footnotesHtml += '</ol></section>';

    // 5. Append footnotes section
    cleaned = cleaned.trimEnd() + '\n' + footnotesHtml;

    return cleaned;
}
