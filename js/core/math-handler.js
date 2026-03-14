/**
 * Math Handler Module
 * Protects and restores LaTeX math blocks during markdown parsing
 */

export class MathHandler {
    constructor() {
        this.mathBlocks = [];
        this.codeBlocks = [];
    }

    reset() {
        this.mathBlocks = [];
        this.codeBlocks = [];
    }

    /**
     * Temporarily protect fenced and inline code from math regex transforms.
     */
    protectCode(text) {
        const replaceCode = (regex) => {
            text = text.replace(regex, (match) => {
                const id = this.codeBlocks.length;
                this.codeBlocks.push(match);
                return `<!--CODEBLOCK${id}PLACEHOLDER-->`;
            });
        };

        // Fenced code blocks (```...```)
        replaceCode(/```[\s\S]*?```/g);
        // Inline code (`...`) on the same line
        replaceCode(/`[^`\n]+`/g);

        return text;
    }

    restoreCode(text) {
        return text.replace(/<!--CODEBLOCK(\d+)PLACEHOLDER-->/g, (_, index) => {
            return this.codeBlocks[Number(index)] ?? '';
        });
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

        // Protect code before any math regex runs
        text = this.protectCode(text);

        // Order is critical: Multi-line/complex delimiters first!
        // 1. Display Math $$...$$ (can be multiline)
        text = replace(/\$\$([\s\S]+?)\$\$/g, 'display');

        // 2. Display Math \[...\]
        text = replace(/\\\[([\s\S]+?)\\\]/g, 'display');

        // 3. Display Math [ ... ] (bare brackets - ChatGPT format)
        // IMPROVED: Supports indented blocks (list items, etc.)
        // Matches: optional indent + [ + optional whitespace + newline + content + newline + optional indent + ]
        text = text.replace(/^[ \t]*\[[ \t]*\n([\s\S]+?)\n[ \t]*\][ \t]*$/gm, (match, content) => {
            // Only convert if content looks like math (LaTeX commands, operators, etc.)
            const hasCmds = /\\[a-zA-Z]/.test(content);
            const hasMathOps = /[_^=]/.test(content);
            const hasDigits = /\d/.test(content);
            // Short variable expressions: letter combos with math punctuation (e.g. -t,dt)
            const hasMathExpr = /^[\s\-+*/=,;()\w\\{}^_.]+$/.test(content.trim()) && /[a-zA-Z]/.test(content) && /[-+*/,=]/.test(content);
            if (!hasCmds && !hasMathOps && !hasDigits && !hasMathExpr) return match;
            const id = this.mathBlocks.length;
            this.mathBlocks.push({ id, content: `\\[${content.trim()}\\]`, type: 'display' });
            return `\n<!--MATHBLOCK${id}PLACEHOLDER-->\n`;
        });

        // 4. Inline Math \(...\)
        text = replace(/\\\(([\s\S]+?)\\\)/g, 'inline');

        // 4b. Bare-paren inline math (ChatGPT format)
        // Matches (...) containing LaTeX commands or math variables like C_1
        text = text.replace(/\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, (match, content) => {
            const trimmed = content.trim();
            if (!trimmed) return match;
            if (/MATHBLOCK|CODEBLOCK/.test(trimmed)) return match;
            const hasCmd = /\\[a-zA-Z]{2,}/.test(trimmed);
            const isMathVar = /^[A-Za-z][_^]\{?[A-Za-z0-9,]+\}?$/.test(trimmed);
            // Expressions with ^ or _ alongside letters (e.g. -yx^2,dy)
            const hasMathNotation = /[_^]/.test(trimmed) && /[a-zA-Z]/.test(trimmed) && !/\s{2,}/.test(trimmed);
            if (!hasCmd && !isMathVar && !hasMathNotation) return match;
            const id = this.mathBlocks.length;
            this.mathBlocks.push({ id, content: `\\(${trimmed}\\)`, type: 'inline' });
            return `<!--MATHBLOCK${id}PLACEHOLDER-->`;
        });

        // 5. Inline Math $...$ (single line, no newlines inside)
        // Keep valid math like $x_1$, but ignore obvious currency-like tokens.
        text = text.replace(/(^|[^\\])\$([^\n$]+?)\$/gm, (match, prefix, content) => {
            const trimmed = content.trim();

            if (!trimmed) return match;
            // Skip clear currency-like values ($5, $12.99)
            if (/^\d+(?:[.,]\d+)?$/.test(trimmed)) return match;
            // Only treat as math if it contains math-ish syntax
            if (!/[\\a-zA-Z_^{}()[\]=+\-*/]/.test(trimmed)) return match;

            const id = this.mathBlocks.length;
            this.mathBlocks.push({
                id,
                content: `$${content}$`,
                type: 'inline'
            });

            return `${prefix}<!--MATHBLOCK${id}PLACEHOLDER-->`;
        });

        // Restore code blocks before markdown parsing
        text = this.restoreCode(text);

        return text;
    }

    /**
     * Restores the protected math blocks into the HTML.
     * Display math is wrapped in a block-level div for proper layout.
     */
    restoreMath(html) {
        for (let i = 0; i < this.mathBlocks.length; i++) {
            const block = this.mathBlocks[i];
            const safeContent = block.content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

            const placeholder = `<!--MATHBLOCK${block.id}PLACEHOLDER-->`;

            if (html.indexOf(placeholder) === -1) continue;

            if (block.type === 'display') {
                const wrapped = `<div class="math-display" style="display:block;width:100%;margin:1em 0;text-align:center;">${safeContent}</div>`;
                html = html.replace(placeholder, wrapped);
            } else {
                html = html.replace(placeholder, safeContent);
            }
        }
        return html;
    }
}

export const mathHandler = new MathHandler();
