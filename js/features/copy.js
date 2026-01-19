import { elements } from '../ui/dom.js';

export function initCopy() {
    elements.btnCopy.addEventListener('click', () => {
        // 1. Get all stylesheets and inline styles
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(s => s.outerHTML)
            .join('\n');
        
        // 2. Get the Tailwind script to ensure utility classes work
        const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>';
        
        // 3. Get the actual window chrome content
        const content = elements.windowChrome.outerHTML;
        
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
            const originalText = elements.btnCopy.innerHTML;
            elements.btnCopy.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!';
            
            setTimeout(() => {
                elements.btnCopy.innerHTML = originalText;
                // Re-init icon if lucide is available
                if (window.lucide) window.lucide.createIcons();
            }, 2000);
        });
    });
}
