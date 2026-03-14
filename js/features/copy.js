import { elements } from '../ui/dom.js';

export function initCopy() {
    const btn = elements.btnCopy;
    if (!btn) return;

    btn.addEventListener('click', () => {
        const windowChrome = elements.windowChrome;
        if (!windowChrome) {
            console.warn('Copy: window chrome element not found');
            return;
        }

        // 1. Get all stylesheets and inline styles
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(s => s.outerHTML)
            .join('\n');
        
        // 2. Get the Tailwind script to ensure utility classes work
        const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>';
        
        // 3. Get the actual window chrome content
        const content = windowChrome.outerHTML;
        
        // 4. Wrap everything in a container with a dark background for context
        const fullHtml = `<!-- AnoAI RenderX Export -->
<div class="renderx-container" style="background: #000; padding: 40px; display: flex; justify-content: center; min-height: 100vh; font-family: sans-serif;">
    ${tailwindScript}
    ${styles}
    <style>
        /* Ensure the export looks correct regardless of host styles */
        .renderx-container { all: initial; display: flex; justify-content: center; background: #000; padding: 40px; min-height: 100vh; font-family: sans-serif; }
        .markdown-body { background: transparent !important; }
    </style>
    ${content}
</div>`;

        navigator.clipboard.writeText(fullHtml).then(() => {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                if (window.lucide) window.lucide.createIcons();
            }, 2000);
        }).catch((err) => {
            console.error('Clipboard write failed:', err);
        });
    });
}
