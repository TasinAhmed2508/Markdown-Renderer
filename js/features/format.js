/* global prettier, prettierPlugins */
import { elements } from '../ui/dom.js';
import { state, setState } from '../core/state.js';

export function initFormat() {
    if (!elements.btnFormat) return;

    elements.btnFormat.addEventListener('click', async () => {
        // Use innerHTML to preserve/restore icon if present
        const originalHTML = elements.btnFormat.innerHTML;
        
        // Show loading state with icon
        elements.btnFormat.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Formatting...`;
        elements.btnFormat.disabled = true;
        if(window.lucide) window.lucide.createIcons();

        try {
            const p = window.prettier;
            const plugins = window.prettierPlugins;

            if (!p) throw new Error('Prettier lib missing');
            if (!plugins) throw new Error('Prettier plugins missing');

            const formatted = await p.format(state.markdown, {
                parser: "markdown",
                plugins: plugins,
                proseWrap: "always",
                printWidth: 80,
                tabWidth: 2,
                useTabs: false,
                singleQuote: true,
                bracketSpacing: true
            });

            setState({ markdown: formatted });
            
            // Success State
            elements.btnFormat.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-green-400"></i> Done`;
            elements.btnFormat.classList.add('text-green-400', 'bg-green-400/10');
            if(window.lucide) window.lucide.createIcons();
            
            setTimeout(() => {
                elements.btnFormat.innerHTML = originalHTML;
                elements.btnFormat.classList.remove('text-green-400', 'bg-green-400/10');
                if(window.lucide) window.lucide.createIcons();
            }, 1500);

        } catch (err) {
            console.error('Format error:', err);
            elements.btnFormat.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 text-red-400"></i> Error`;
            elements.btnFormat.title = err.message;
            if(window.lucide) window.lucide.createIcons();
            
            setTimeout(() => {
                elements.btnFormat.innerHTML = originalHTML;
                elements.btnFormat.title = '';
                if(window.lucide) window.lucide.createIcons();
            }, 2000);
        } finally {
            elements.btnFormat.disabled = false;
        }
    });
}
