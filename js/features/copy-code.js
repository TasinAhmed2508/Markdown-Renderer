/**
 * Feature: Copy Code Button
 * Adds a copy button to all code blocks
 */

export function initCopyButtons(element) {
    element.querySelectorAll('pre').forEach((pre) => {
        // Prevent double injection
        if (pre.parentNode.classList.contains('code-block-wrapper')) return;

        // Container wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'relative group code-block-wrapper';

        // Wrap pre
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        // Create button
        const btn = document.createElement('button');
        btn.className = 'copy-code-btn';
        btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        btn.title = 'Copy Code';

        // Add event listener
        btn.addEventListener('click', async () => {
            const code = pre.querySelector('code')?.innerText || pre.innerText;
            try {
                await navigator.clipboard.writeText(code);
                btn.innerHTML = '<i class="fa-solid fa-check" style="color: #4ade80;"></i>';
                setTimeout(() => btn.innerHTML = '<i class="fa-regular fa-copy"></i>', 2000);
            } catch (err) {
                console.error('Copy failed:', err);
                btn.innerHTML = '<i class="fa-solid fa-times" style="color: #ef4444;"></i>';
            }
        });

        wrapper.appendChild(btn);
    });
}
