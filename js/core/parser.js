/* global marked */
export function parseMarkdown(text) {
    if (typeof text !== 'string') {
        console.warn('parseMarkdown: expected string, got', typeof text);
        return String(text ?? '');
    }
    if (!text.trim()) return '';

    try {
        const m = window.marked;
        if (!m || typeof m.parse !== 'function') return text;

        return m.parse(text, { breaks: true, gfm: true });
    } catch (err) {
        console.error('Markdown parsing error:', err);
        return text;
    }
}
