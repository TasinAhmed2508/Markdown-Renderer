import { state, setState, subscribe } from './core/state.js';
import { initInput, updateOutputUI, syncInputUI } from './ui/events.js';
import { initThemes, updateThemeUI } from './features/theme.js';
import { initPadding, updatePaddingUI } from './features/padding.js';
import { initExport } from './features/export.js';
import { initShader } from './features/shader.js'; // New shader
import { initScrollSync } from './features/scroll.js';
import { initCopy } from './features/copy.js';
import { initStorage, initAutoSave } from './features/storage.js';
import { initStatusBar } from './features/statusbar.js';
import { initDownloadMd } from './features/download.js';
import { initFormat } from './features/format.js';
import { initEditorTools } from './features/editor-tools.js';
import { initSearch } from './features/search.js';
import { initTypewriter } from './features/typewriter.js';
import { initLineNumbers } from './features/linenumbers.js';
import { toggleLoader } from './ui/loader.js';
import { debounce } from './utils/helpers.js';
import { elements } from './ui/dom.js';

function init() {
    console.log('Initializing App...');
    
    try {
        // 0. Load Storage (Theme/Padding only)
        const savedState = initStorage();
        if (savedState) {
            // Restore preferences, but FORCE the default markdown demo content
            // so every new session sees the capabilities.
            setState({
                ...savedState,
                markdown: state.markdown // Reset text to default demo
            });
        } else {
            setState(state);
        }

        // Initialize components
        initShader(); // Initialize the new WebGL shader
        initInput();
        initThemes();
        initPadding();
        initExport();
        initDownloadMd();
        initFormat();
        initScrollSync();
        initCopy();
        initAutoSave();
        initStatusBar();
        initEditorTools();
        initSearch();
        initTypewriter();
        initLineNumbers();

        // Create a debounced renderer to avoid performance issues on every keystroke
        const debouncedRender = debounce((markdown) => {
            updateOutputUI(markdown);
            syncInputUI(markdown);
            toggleLoader(false); // Hide loader when done
        }, 300);

        // Subscribe to state changes
        subscribe((newState) => {
            // Instant UI updates (like padding/theme)
            updateThemeUI(newState.theme);
            updatePaddingUI(newState.padding);
            
            // Show loader if markdown text changed (heuristic)
            // Ideally we check if 'markdown' key specifically changed, but for now this is fine.
            if (elements.input && elements.input.value !== newState.markdown) {
                 // Logic mismatch: syncInputUI handles text update. 
                 // If the change came from user input, loader might flicker. 
                 // Let's just show it.
                 toggleLoader(true);
            } else if (document.activeElement === elements.input) {
                 // User is typing
                 toggleLoader(true);
            }

            // Debounced Heavy Rendering
            debouncedRender(newState.markdown);
        });

        // Initial render (immediate)
        updateOutputUI(state.markdown);
        updateThemeUI(state.theme);
        updatePaddingUI(state.padding);
        syncInputUI(state.markdown);
        
        console.log('App Initialized Successfully');
    } catch (err) {
        console.error('Critical Error during initialization:', err);
    }
}

init();