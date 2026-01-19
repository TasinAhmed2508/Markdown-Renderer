import { state, subscribe } from '../core/state.js';

const STORAGE_KEY = 'markdown_renderer_state_v1';

export function initStorage() {
    // 1. Load saved state
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Merge saved state with default state to ensure new keys exist
            // But we don't want to overwrite the whole state object, just the properties
            // We can't use setState here directly because we are inside init
            // Instead, we return the parsed state to be used during initialization if needed
            // Or better, we explicitly update the state object before the app starts.
            
            // However, since state is imported as an object, we can mutate it *before* main init runs fully
            // providing we do this early.
            
            // Let's create a function to get the initial state
            return parsed;
        } catch (e) {
            console.error('Failed to load local storage', e);
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
