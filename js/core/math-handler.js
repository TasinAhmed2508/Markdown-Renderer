/**
 * Math Handler Module
 * Protects and restores LaTeX math blocks during markdown parsing
 */

export class MathHandler {
    constructor() {
        this.mathBlocks = [];
    }

    reset() {
        this.mathBlocks = [];
    }

    /**
     * Extracts LaTeX blocks and replaces them with placeholders.
     * Supports (in order of priority):
     * - $$ ... $$ (Display - multiline)
     * - \[ ... \] (Display - LaTeX style)
     * - [ ... ] on own lines (Display - bare bracket ChatGPT style)
     * - \( ... \) (Inline - LaTeX style)
     * - $ ... $ (Inline - common/ChatGPT style)
     */
    protectMath(text) {
        const replace = (regex, type) => {
            return text.replace(regex, (match) => {
                const id = this.mathBlocks.length;
                this.mathBlocks.push({
                    id,
                    content: match,
                    type
                });
                return `<!--MATHBLOCK${id}PLACEHOLDER-->`;
            });
        };

        // Order is critical: Multi-line/complex delimiters first!
        // 1. Display Math $$...$$ (can be multiline)
        text = replace(/\$\$([\s\S]+?)\$\$/g, 'display');

        // 2. Display Math \[...\]
        text = replace(/\\\[([\s\S]+?)\\\]/g, 'display');

        // 3. Display Math [ ... ] (bare brackets - ChatGPT format)
        // IMPROVED: Supports indented blocks (list items, etc.)
        // Matches: optional indent + [ + optional whitespace + newline + content + newline + optional indent + ]
        text = text.replace(/^[ \t]*\[[ \t]*\n([\s\S]+?)\n[ \t]*\][ \t]*$/gm, (match, content) => {
            // Only convert if content looks like LaTeX (contains backslash commands)
            if (!/\\[a-zA-Z]/.test(content)) return match;
            const id = this.mathBlocks.length;
            this.mathBlocks.push({ id, content: `\\[${content.trim()}\\]`, type: 'display' });
            return `\n<!--MATHBLOCK${id}PLACEHOLDER-->\n`;
        });

        // 4. Inline Math \(...\)
        text = replace(/\\\(([\s\S]+?)\\\)/g, 'inline');

        // 5. Inline Math $...$ (single line, no newlines inside)
        // Careful: avoid matching price like "$5" or "$10"
        text = replace(/\$([^\$\n]+?[^\d\s])\$/g, 'inline');

        return text;
    }

    /**
     * Restores the protected math blocks into the HTML.
     * Display math is wrapped in a block-level div for proper layout.
     */
    restoreMath(html) {
        this.mathBlocks.forEach(block => {
            const safeContent = block.content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

            const placeholder = `<!--MATHBLOCK${block.id}PLACEHOLDER-->`;

            if (block.type === 'display') {
                // Wrap display math in a block-level div for proper layout
                const wrapped = `<div class="math-display" style="display:block;width:100%;margin:1em 0;text-align:center;">${safeContent}</div>`;
                html = html.replace(placeholder, wrapped);
            } else {
                html = html.replace(placeholder, safeContent);
            }
        });
        return html;
    }
}

export const mathHandler = new MathHandler();
