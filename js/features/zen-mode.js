import { registerCommand } from './commands.js';

let active = false;

function enterZen() {
    active = true;
    document.body.classList.add('zen-mode');
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    updateButton();
}

function exitZen() {
    active = false;
    document.body.classList.remove('zen-mode');
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    updateButton();
}

function toggleZen() {
    if (active) {
        exitZen();
    } else {
        enterZen();
    }
}

function updateButton() {
    const btn = document.getElementById('btn-zen-mode');
    if (btn) {
        btn.classList.toggle('active', active);
        btn.title = active ? 'Exit Zen Mode' : 'Enter Zen Mode';
    }
}

export function initZenMode() {
    const btn = document.getElementById('btn-zen-mode');
    if (btn) btn.addEventListener('click', toggleZen);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && active) {
            exitZen();
        }
    });

    // Sync if user exits fullscreen via browser UI
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && active) {
            active = false;
            document.body.classList.remove('zen-mode');
            updateButton();
        }
    });

    registerCommand('toggle-zen-mode', {
        name: 'Toggle Zen Mode',
        shortcut: 'ctrl+shift+z',
        icon: 'maximize',
        category: 'view',
        execute: toggleZen
    });
}
