import { state, setState } from '../core/state.js';
import { elements } from '../ui/dom.js';

/**
 * Build the theme swatch buttons inside any container.
 * Used by the hidden navbar strip and by the settings modal.
 */
export function renderThemeSwatches(container) {
    if (!container) return;
    container.innerHTML = '';
    state.themes.forEach(theme => {
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = `swatch ${state.theme === theme.id ? 'active' : ''}`;
        swatch.style.backgroundColor = theme.color;
        swatch.title = theme.id;
        swatch.setAttribute('aria-label', `Use ${theme.id} theme`);
        swatch.addEventListener('click', () => {
            setState({ theme: theme.id });
            syncSwatches();
        });
        container.appendChild(swatch);
    });
}

function syncSwatches() {
    document.querySelectorAll('.swatch').forEach(s => {
        s.classList.toggle('active', s.title === state.theme);
    });
}

export function initThemes() {
    renderThemeSwatches(elements.themeSwatches);

    // Light <-> dark toggle button
    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isLight = state.theme === 'light';
            setState({ theme: isLight ? 'default' : 'light' });
        });
    }
}

export function updateThemeUI(currentTheme) {
    const theme = currentTheme || 'default';
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    syncSwatches();

    // Swap the sun/moon icons on the navbar toggle
    const iconLight = document.querySelector('.theme-icon-light');
    const iconDark = document.querySelector('.theme-icon-dark');
    if (iconLight && iconDark) {
        if (theme === 'light') {
            iconLight.classList.remove('hidden');
            iconDark.classList.add('hidden');
        } else {
            iconLight.classList.add('hidden');
            iconDark.classList.remove('hidden');
        }
    }

    if (window.lucide) window.lucide.createIcons();
}
