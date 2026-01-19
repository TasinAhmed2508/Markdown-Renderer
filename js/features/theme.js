import { state, setState } from '../core/state.js';
import { elements } from '../ui/dom.js';

export function initThemes() {
    // Initialize swatches
    state.themes.forEach(theme => {
        const swatch = document.createElement('div');
        swatch.className = `swatch ${state.theme === theme.id ? 'active' : ''}`;
        swatch.style.backgroundColor = theme.color;
        swatch.title = theme.id;

        swatch.addEventListener('click', () => {
            setState({ theme: theme.id });
        });

        elements.themeSwatches.appendChild(swatch);
    });

    // Initialize toggle button
    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isLight = state.theme === 'light';
            setState({ theme: isLight ? 'default' : 'light' });
        });
    }
}

export function updateThemeUI(currentTheme) {
    document.body.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Update swatches
    const swatches = elements.themeSwatches?.querySelectorAll('.swatch');
    swatches?.forEach(s => {
        s.classList.toggle('active', s.title === currentTheme);
    });

    // Update toggle button icons
    const iconLight = document.querySelector('.theme-icon-light');
    const iconDark = document.querySelector('.theme-icon-dark');
    if (iconLight && iconDark) {
        if (currentTheme === 'light') {
            iconLight.classList.remove('hidden');
            iconDark.classList.add('hidden');
        } else {
            iconLight.classList.add('hidden');
            iconDark.classList.remove('hidden');
        }
    }

    // Re-init lucide icons
    if (window.lucide) window.lucide.createIcons();
}

