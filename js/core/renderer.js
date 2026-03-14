/**
 * Core Renderer Module
 * Orchestrates the markdown rendering pipeline
 */
import { parseMarkdown } from './parser.js';
import { mathHandler } from './math-handler.js';
import { postRender as postRenderDOM } from './post-render.js';
import { processEmbeds } from '../features/embeds.js';
import { processFootnotes } from '../features/footnotes.js';
import { processAdmonitions } from '../features/admonitions.js';
import { processEmoji } from '../features/emoji.js';

export class Renderer {
    constructor() {
        this.mathHandler = mathHandler;
    }

    /**
     * Main render function: Markdown -> HTML
     * Pipeline: Fix Mermaid -> Protect Math -> Parse Markdown -> Restore Math -> Process Embeds
     */
    render(markdown) {
        if (typeof markdown !== 'string') return '';

        this.mathHandler.reset();

        // 0. Plugin pre-processors
        let processed = markdown;
        try {
            if (window.RenderXPlugins) {
                const preProcessors = window.RenderXPlugins.getPreProcessors();
                for (const fn of preProcessors) {
                    processed = fn(processed) || processed;
                }
            }
        } catch (err) {
            console.warn('Plugin pre-processor error:', err);
        }

        // 0b. Pre-process: Emoji shortcodes
        try {
            processed = processEmoji(processed);
        } catch (err) {
            console.warn('Emoji processing error:', err);
        }

        // 1. Pre-process: Auto-quote Mermaid labels
        try {
            processed = this.fixMermaidLabels(processed);
        } catch (err) {
            console.warn('Mermaid label fix error:', err);
        }

        // 2. Protect Math Blocks (LaTeX)
        try {
            processed = this.mathHandler.protectMath(processed);
        } catch (err) {
            console.warn('Math protection error:', err);
        }

        // 3. Parse Markdown
        let html = parseMarkdown(processed);

        // 4. Restore Math Blocks
        try {
            html = this.mathHandler.restoreMath(html);
        } catch (err) {
            console.warn('Math restore error:', err);
        }

        // 5. Process Embeds
        try {
            html = processEmbeds(html);
        } catch (err) {
            console.warn('Embed processing error:', err);
        }

        // 6. Process Footnotes
        try {
            html = processFootnotes(html);
        } catch (err) {
            console.warn('Footnotes processing error:', err);
        }

        // 7. Process Admonitions (GitHub/Obsidian callouts)
        try {
            html = processAdmonitions(html);
        } catch (err) {
            console.warn('Admonitions processing error:', err);
        }

        // 8. Plugin post-processors
        try {
            if (window.RenderXPlugins) {
                const postProcessors = window.RenderXPlugins.getPostProcessors();
                for (const fn of postProcessors) {
                    html = fn(html) || html;
                }
            }
        } catch (err) {
            console.warn('Plugin post-processor error:', err);
        }

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

            const quoteContent = (content) => {
                const trimmed = content.trim();

                if (!trimmed) return content;
                if (trimmed.startsWith('__QUOTED_STRING_')) return content;
                // Do not touch complex nested delimiter content; fail-safe no-op.
                if (/[()[\]{}]/.test(trimmed)) return content;
                // Keep plain labels as-is.
                if (!/[=;"']/.test(trimmed) && trimmed === content) return content;

                return `"${trimmed.replace(/"/g, '\\"')}"`;
            };

            let fixedBlock = protectedBlock;

            // Match only valid, delimiter-specific node patterns to avoid corruption.
            fixedBlock = fixedBlock.replace(/([a-zA-Z0-9_]+)\[([^\]\n]+)\]/g, (_, id, content) => {
                return `${id}[${quoteContent(content)}]`;
            });
            fixedBlock = fixedBlock.replace(/([a-zA-Z0-9_]+)\(([^)\n]+)\)/g, (_, id, content) => {
                return `${id}(${quoteContent(content)})`;
            });
            fixedBlock = fixedBlock.replace(/([a-zA-Z0-9_]+)\{([^}\n]+)\}/g, (_, id, content) => {
                return `${id}{${quoteContent(content)}}`;
            });

            // Restore placeholders
            return fixedBlock.replace(/__QUOTED_STRING_(\d+)__/g, (_, index) => placeholders[+index]);
        });
    }

    /**
     * Post-render DOM processing (Highlight.js, Mermaid, KaTeX)
     * This runs AFTER the HTML is inserted into the document.
     */
    postRender(element, isCurrent) {
        return postRenderDOM(element, isCurrent);
    }
}

export const renderer = new Renderer();
