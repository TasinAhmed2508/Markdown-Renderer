import { state, subscribe } from '../core/state.js';

const STORAGE_KEY = 'markdown_renderer_state_v1';

export function initStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (!parsed || typeof parsed !== 'object') {
                console.warn('Invalid stored state format, ignoring');
                return null;
            }
            // Only restore known keys to prevent prototype pollution or stale data
            const sanitized = {};
            if (typeof parsed.markdown === 'string') sanitized.markdown = parsed.markdown;
            if (typeof parsed.theme === 'string') sanitized.theme = parsed.theme;
            if (typeof parsed.padding === 'number' && parsed.padding >= 0) sanitized.padding = parsed.padding;

            return Object.keys(sanitized).length > 0 ? sanitized : null;
        } catch (e) {
            console.error('Failed to load local storage:', e);
        }
    }
    return null;
}

export function initAutoSave() {
    // 2. Subscribe to changes and save
    subscribe((newState) => {
        const stateToSave = {
            markdown: newState.markdown,
            theme: newState.theme,
            padding: newState.padding
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    });
}
