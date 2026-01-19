/* global marked */
export function parseMarkdown(text) {
    try {
        const m = window.marked;
        if (!m) return text;
        
        // Basic parse without internal highlighting to avoid version issues
        return m.parse(text, { breaks: true, gfm: true });
    } catch (err) {
        console.error('Markdown parsing error:', err);
        return text;
    }
}
