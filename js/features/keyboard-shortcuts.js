import { getCommands } from './commands.js';

function parseShortcut(shortcut) {
    const parts = shortcut.toLowerCase().split('+').map(s => s.trim());
    return {
        ctrl: parts.includes('ctrl') || parts.includes('cmd'),
        shift: parts.includes('shift'),
        alt: parts.includes('alt'),
        key: parts.find(p => !['ctrl', 'cmd', 'shift', 'alt'].includes(p)) || ''
    };
}

function matchesShortcut(e, parsed) {
    const ctrlOrMeta = e.ctrlKey || e.metaKey;
    if (parsed.ctrl !== ctrlOrMeta) return false;
    if (parsed.shift !== e.shiftKey) return false;
    if (parsed.alt !== e.altKey) return false;
    return e.key.toLowerCase() === parsed.key;
}

export function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const commands = getCommands();
        for (const cmd of commands) {
            if (!cmd.shortcut) continue;
            const parsed = parseShortcut(cmd.shortcut);
            if (matchesShortcut(e, parsed)) {
                e.preventDefault();
                e.stopPropagation();
                try {
                    cmd.execute();
                } catch (err) {
                    console.error(`Shortcut command "${cmd.id}" failed:`, err);
                }
                return;
            }
        }
    });
}
