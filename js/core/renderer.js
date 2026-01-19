/**
 * Core Renderer Module
 * Orchestrates the markdown rendering pipeline
 */
import { parseMarkdown } from './parser.js';
import { mathHandler } from './math-handler.js';
import { postRender as postRenderDOM } from './post-render.js';
import { processEmbeds } from '../features/embeds.js';

export class Renderer {
    constructor() {
        this.mathHandler = mathHandler;
    }

    /**
     * Main render function: Markdown -> HTML
     * Pipeline: Fix Mermaid -> Protect Math -> Parse Markdown -> Restore Math -> Process Embeds
     */
    render(markdown) {
        this.mathHandler.reset();

        // 0. Pre-process: Auto-quote Mermaid labels with special characters
        let processed = this.fixMermaidLabels(markdown);

        // 1. Protect Math Blocks (LaTeX)
        processed = this.mathHandler.protectMath(processed);

        // 2. Parse Markdown
        let html = parseMarkdown(processed);

        // 3. Restore Math Blocks
        html = this.mathHandler.restoreMath(html);

        // 4. Process Embeds (YouTube, CodeSandbox, etc.)
        html = processEmbeds(html);

        return html;
    }

    /**
     * Auto-quote Mermaid labels containing problematic characters.
     * Robust handling for brackets (), {}, [], and special chars.
     */
    fixMermaidLabels(markdown) {
        return markdown.replace(/(```mermaid[\s\S]+?```)/g, (mermaidBlock) => {
            // Protect existing quoted strings first by temporarily replacing them
            const placeholders = [];
            const protectedBlock = mermaidBlock.replace(/"[^"]*"/g, (match) => {
                placeholders.push(match);
                return `__QUOTED_STRING_${placeholders.length - 1}__`;
            });

            // Regex for graph nodes: id[Label Text] or id(Label) or id{Label}
            // We want to quote the content if it has special chars
            const fixedBlock = protectedBlock.replace(/([a-zA-Z0-9_]+)(\[|\(|\{)([^\])}]+)(\]|\)|\})/g, (m, id, open, content, close) => {
                // If content is just a placeholder, ignore
                if (content.trim().startsWith('__QUOTED_STRING_')) return m;

                // Check for problematic chars: ( ) [ ] { } = ; "
                // If found, wrap in quotes
                if (/[(){}\[\]=;"']/.test(content)) {
                    // Escape internal quotes if any
                    const safeContent = content.replace(/"/g, '#quot;');
                    return `${id}${open}"${safeContent.trim()}"${close}`;
                }
                return m;
            });

            // Restore placeholders
            return fixedBlock.replace(/__QUOTED_STRING_(\d+)__/g, (_, index) => placeholders[+index]);
        });
    }

    /**
     * Post-render DOM processing (Highlight.js, Mermaid, KaTeX)
     * This runs AFTER the HTML is inserted into the document.
     */
    postRender(element) {
        postRenderDOM(element);
    }
}

export const renderer = new Renderer();
