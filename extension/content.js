/**
 * ChatGPT Extractor — Content Script
 * Extracts all assistant responses from the ChatGPT page DOM,
 * converts HTML → Markdown with LaTeX math preserved.
 *
 * Injected on-demand via chrome.scripting.executeScript()
 * Returns: { count: number, text: string, error: string|null }
 */
(() => {
    'use strict';

    try {
        const messageEls = findAssistantMessages();

        if (!messageEls.length) {
            return {
                error: 'No ChatGPT responses found. Make sure you\'re on an open conversation.',
                count: 0, text: ''
            };
        }

        const parts = [];
        for (const el of messageEls) {
            const md = elementToMarkdown(el);
            if (md.trim()) parts.push(md.trim());
        }

        if (!parts.length) {
            return {
                error: 'Found message elements but could not extract content.',
                count: 0, text: ''
            };
        }

        const fullText = parts.join('\n\n---\n\n');
        return { count: parts.length, text: fullText, error: null };

    } catch (e) {
        return { error: 'Extraction failed: ' + e.message, count: 0, text: '' };
    }

    // ═══════════════════════════════════════════════════════
    //  Find assistant messages (multiple selector strategies)
    // ═══════════════════════════════════════════════════════

    function findAssistantMessages() {
        // Strategy 1: data-message-author-role (most reliable, 2024-2026)
        let msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
        if (msgs.length) {
            return Array.from(msgs).map(m =>
                m.querySelector('.markdown, .prose, .whitespace-pre-wrap') || m
            ).filter(Boolean);
        }

        // Strategy 2: conversation-turn test IDs
        const turns = document.querySelectorAll('[data-testid^="conversation-turn-"]');
        if (turns.length) {
            const assistantEls = [];
            for (const turn of turns) {
                if (turn.querySelector('[data-message-author-role="user"]')) continue;
                const md = turn.querySelector('.markdown, .prose');
                if (md) assistantEls.push(md);
            }
            if (assistantEls.length) return assistantEls;
        }

        // Strategy 3: agent-turn class
        msgs = document.querySelectorAll('.agent-turn .markdown, .agent-turn .prose');
        if (msgs.length) return Array.from(msgs);

        // Strategy 4: broad fallback — any .markdown.prose not inside user messages
        msgs = document.querySelectorAll('.markdown.prose, .markdown');
        if (msgs.length) return Array.from(msgs);

        return [];
    }

    // ═══════════════════════════════════════════════════════
    //  Convert a message element to Markdown
    // ═══════════════════════════════════════════════════════

    function elementToMarkdown(el) {
        const clone = el.cloneNode(true);

        // Remove UI chrome (copy buttons, toolbars, etc.)
        clone.querySelectorAll(
            'button, [class*="copy"], [class*="toolbar"], [class*="actions"], .sr-only'
        ).forEach(n => n.remove());

        // Remove "thinking" toggle details (keep summary visible)
        clone.querySelectorAll('details.thinking, [class*="thinking"]').forEach(n => {
            // Keep thinking content if it's expanded, otherwise skip
            if (!n.hasAttribute('open')) n.remove();
        });

        // Convert math elements back to TeX source BEFORE walking the tree
        preprocessMath(clone);

        // Walk DOM → Markdown
        return nodeToMarkdown(clone, 0).replace(/\n{3,}/g, '\n\n').trim();
    }

    // ═══════════════════════════════════════════════════════
    //  Pre-process: replace rendered math with TeX source
    // ═══════════════════════════════════════════════════════

    function preprocessMath(container) {
        // --- KaTeX display math ---
        container.querySelectorAll('.katex-display').forEach(display => {
            const tex = extractTex(display);
            if (tex) display.replaceWith(doc_text('\n\n$$\n' + tex + '\n$$\n\n'));
        });

        // --- KaTeX inline math (remaining after display removal) ---
        container.querySelectorAll('.katex').forEach(inline => {
            const tex = extractTex(inline);
            if (tex) inline.replaceWith(doc_text('$' + tex + '$'));
        });

        // --- MathJax v3 (mjx-container) ---
        container.querySelectorAll('mjx-container').forEach(mjx => {
            const isDisplay = mjx.getAttribute('display') === 'true'
                || mjx.classList.contains('MathJax_Display');
            let tex = mjx.getAttribute('data-latex')
                || mjx.getAttribute('data-formula')
                || '';
            if (!tex) {
                const prev = mjx.previousElementSibling;
                if (prev?.tagName === 'SCRIPT' && prev.type?.includes('math/tex')) {
                    tex = prev.textContent;
                    prev.remove();
                }
            }
            if (tex) {
                mjx.replaceWith(doc_text(
                    isDisplay ? '\n\n$$\n' + tex.trim() + '\n$$\n\n' : '$' + tex.trim() + '$'
                ));
            }
        });

        // --- MathJax v2 ---
        container.querySelectorAll('.MathJax, .MathJax_Preview').forEach(el => {
            const script = el.nextElementSibling;
            if (script?.tagName === 'SCRIPT' && script.type?.includes('math/tex')) {
                const isDisplay = script.type.includes('display');
                const tex = script.textContent.trim();
                el.replaceWith(doc_text(
                    isDisplay ? '\n\n$$\n' + tex + '\n$$\n\n' : '$' + tex + '$'
                ));
                script.remove();
            } else {
                el.remove();
            }
        });
    }

    function extractTex(katexEl) {
        const ann = katexEl.querySelector('annotation[encoding="application/x-tex"]');
        return ann ? ann.textContent.trim() : null;
    }

    function doc_text(str) {
        return document.createTextNode(str);
    }

    // ═══════════════════════════════════════════════════════
    //  Recursive DOM → Markdown converter
    // ═══════════════════════════════════════════════════════

    function nodeToMarkdown(node, listDepth) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return '';

        const tag = node.tagName.toLowerCase();

        // Skip hidden / KaTeX internals
        if (node.style?.display === 'none' || node.hidden) return '';
        if (node.classList?.contains('katex-html')) return '';
        if (node.classList?.contains('katex-mathml')) return '';

        const children = () =>
            Array.from(node.childNodes).map(c => nodeToMarkdown(c, listDepth)).join('');

        switch (tag) {
            // --- Block elements ---
            case 'p':          return children() + '\n\n';
            case 'br':         return '\n';
            case 'hr':         return '\n---\n\n';
            case 'h1':         return '# '      + children().trim() + '\n\n';
            case 'h2':         return '## '     + children().trim() + '\n\n';
            case 'h3':         return '### '    + children().trim() + '\n\n';
            case 'h4':         return '#### '   + children().trim() + '\n\n';
            case 'h5':         return '##### '  + children().trim() + '\n\n';
            case 'h6':         return '###### ' + children().trim() + '\n\n';

            // --- Inline formatting ---
            case 'strong': case 'b':   return '**' + children() + '**';
            case 'em':     case 'i':   return '*'  + children() + '*';
            case 'del':    case 's':   return '~~' + children() + '~~';
            case 'mark':               return '==' + children() + '==';
            case 'sup':                return '^(' + children() + ')';
            case 'sub':                return '~(' + children() + ')';

            // --- Code ---
            case 'code': {
                if (node.closest('pre')) return node.textContent;
                return '`' + node.textContent + '`';
            }
            case 'pre': {
                const codeEl = node.querySelector('code');
                const lang = codeEl?.className?.match(/language-(\S+)/)?.[1] || '';
                const code = (codeEl || node).textContent;
                return '\n```' + lang + '\n' + code.trimEnd() + '\n```\n\n';
            }

            // --- Lists ---
            case 'ul': {
                const indent = '  '.repeat(listDepth);
                const items = Array.from(node.children)
                    .filter(c => c.tagName?.toLowerCase() === 'li')
                    .map(li => indent + '- ' + nodeToMarkdown(li, listDepth + 1).trim());
                return '\n' + items.join('\n') + '\n\n';
            }
            case 'ol': {
                const indent = '  '.repeat(listDepth);
                let idx = parseInt(node.getAttribute('start') || '1', 10);
                const items = Array.from(node.children)
                    .filter(c => c.tagName?.toLowerCase() === 'li')
                    .map(li => indent + (idx++) + '. ' + nodeToMarkdown(li, listDepth + 1).trim());
                return '\n' + items.join('\n') + '\n\n';
            }
            case 'li': return children();

            // --- Blockquote ---
            case 'blockquote': {
                const inner = children().trim();
                return '\n' + inner.split('\n').map(l => '> ' + l).join('\n') + '\n\n';
            }

            // --- Links & images ---
            case 'a': {
                const href = node.getAttribute('href') || '';
                const text = children().trim();
                if (!text) return href;
                return '[' + text + '](' + href + ')';
            }
            case 'img': {
                const alt = node.getAttribute('alt') || '';
                const src = node.getAttribute('src') || '';
                return '![' + alt + '](' + src + ')';
            }

            // --- Tables ---
            case 'table': return '\n' + convertTable(node) + '\n\n';
            case 'thead': case 'tbody': case 'tfoot':
            case 'tr': case 'th': case 'td':
                // Handled by convertTable; if reached here, just return children
                return children();

            // --- Pass-through containers ---
            case 'div': case 'span': case 'section': case 'article':
            case 'main': case 'aside': case 'nav': case 'figure':
            case 'figcaption': case 'details': case 'summary':
                return children();

            default:
                return children();
        }
    }

    // ═══════════════════════════════════════════════════════
    //  Table → Markdown
    // ═══════════════════════════════════════════════════════

    function convertTable(table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        if (!rows.length) return '';

        const result = [];
        rows.forEach((row, ri) => {
            const cells = Array.from(row.querySelectorAll('th, td'));
            const texts = cells.map(c =>
                nodeToMarkdown(c, 0).trim().replace(/\|/g, '\\|').replace(/\n/g, ' ')
            );
            result.push('| ' + texts.join(' | ') + ' |');

            // Header separator after first row
            if (ri === 0) {
                const aligns = cells.map(c => {
                    const a = c.style?.textAlign || '';
                    if (a === 'center') return ':---:';
                    if (a === 'right')  return '---:';
                    return '---';
                });
                result.push('| ' + aligns.join(' | ') + ' |');
            }
        });

        return result.join('\n');
    }
})();
