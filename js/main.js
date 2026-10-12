import { state, setState, subscribe } from './core/state.js';
import { initInput, updateOutputUI, syncInputUI, applyMermaidTheme } from './ui/events.js';
import { elements } from './ui/dom.js';
import { initThemes, updateThemeUI } from './features/theme.js';
import { initPadding, updatePaddingUI } from './features/padding.js';
import { initExport } from './features/export.js';
import { initShader } from './features/shader.js';
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
// New feature imports
import { initKeyboardShortcuts } from './features/keyboard-shortcuts.js';
import { initHistory } from './features/history.js';
import { initTabIndent } from './features/tab-indent.js';
import { initWordWrap } from './features/word-wrap.js';
import { initSpellcheck } from './features/spellcheck-toggle.js';
import { initZenMode } from './features/zen-mode.js';
import { initDragDrop } from './features/drag-drop.js';
import { initImageUpload } from './features/image-upload.js';
import { initSplitPane } from './features/split-pane.js';
import { initAccessibility } from './features/accessibility.js';
import { initTOC } from './features/toc.js';
import { initOutline } from './features/outline.js';
import { initCommandPalette } from './features/command-palette.js';
import { initTabs } from './features/tabs.js';
import { initTableEditor } from './features/table-editor.js';
import { initVersionHistory } from './features/version-history.js';
import { initMermaidEditor } from './features/mermaid-editor.js';
import { initSlides } from './features/slides.js';
import { initCustomTheme } from './features/custom-theme.js';
import { initCodeTheme } from './features/code-theme.js';
import { initFontSettings } from './features/font-settings.js';
import { initLinkPreview } from './features/link-preview.js';
import { initMobileEditor } from './features/mobile-editor.js';
import { initPlugins } from './features/plugins.js';
import { initExportFormats } from './features/export-formats.js';
import { initCollaboration } from './features/collaboration.js';

function init() {
    console.log('Initializing App...');
    
    try {
        // 0. Load Storage (Theme/Padding only)
        const savedState = initStorage();
        if (savedState) {
            setState({
                ...savedState,
                markdown: state.markdown // Reset text to default demo
            });
        } else {
            setState(state);
        }

        // Initialize components with individual error isolation
        const features = [
            ['Shader', initShader],
            ['Input', initInput],
            ['Themes', initThemes],
            ['Padding', initPadding],
            ['Export', initExport],
            ['Download', initDownloadMd],
            ['Format', initFormat],
            ['ScrollSync', initScrollSync],
            ['Copy', initCopy],
            ['AutoSave', initAutoSave],
            ['StatusBar', initStatusBar],
            ['EditorTools', initEditorTools],
            ['Search', initSearch],
            ['Typewriter', initTypewriter],
            ['LineNumbers', initLineNumbers],
            // New features
            ['KeyboardShortcuts', initKeyboardShortcuts],
            ['History', initHistory],
            ['TabIndent', initTabIndent],
            ['WordWrap', initWordWrap],
            ['Spellcheck', initSpellcheck],
            ['ZenMode', initZenMode],
            ['DragDrop', initDragDrop],
            ['ImageUpload', initImageUpload],
            ['SplitPane', initSplitPane],
            ['Accessibility', initAccessibility],
            ['TOC', initTOC],
            ['Outline', initOutline],
            ['CommandPalette', initCommandPalette],
            ['Tabs', initTabs],
            ['TableEditor', initTableEditor],
            ['VersionHistory', initVersionHistory],
            ['MermaidEditor', initMermaidEditor],
            ['Slides', initSlides],
            ['CustomTheme', initCustomTheme],
            ['CodeTheme', initCodeTheme],
            ['FontSettings', initFontSettings],
            ['LinkPreview', initLinkPreview],
            ['MobileEditor', initMobileEditor],
            ['Plugins', initPlugins],
            ['ExportFormats', initExportFormats],
            ['Collaboration', initCollaboration]
        ];

        for (const [name, initFn] of features) {
            try {
                initFn();
            } catch (err) {
                console.error(`Failed to initialize ${name}:`, err);
            }
        }

        // Capture after feature init so initTabs changes are reflected
        let lastMarkdown;
        let lastTheme = state.theme;

        const debouncedRender = debounce((markdown) => {
            Promise.resolve(updateOutputUI(markdown))
                .finally(() => {
                    syncInputUI(markdown);
                    toggleLoader(false);
                });
        }, 300);

        subscribe((newState) => {
            const themeChanged = newState.theme !== lastTheme;
            if (themeChanged) lastTheme = newState.theme;

            updateThemeUI(newState.theme);
            updatePaddingUI(newState.padding);

            const markdownChanged = newState.markdown !== lastMarkdown;

            // Diagrams are rendered per theme, so a theme switch needs a re-render.
            if (themeChanged && !markdownChanged) {
                applyMermaidTheme(newState.theme);
                Promise.resolve(updateOutputUI(newState.markdown))
                    .finally(() => toggleLoader(false));
                return;
            }

            if (!markdownChanged) return;

            lastMarkdown = newState.markdown;
            toggleLoader(true);
            debouncedRender(newState.markdown);
        });

        lastMarkdown = state.markdown;

        // Initial render
        Promise.resolve(updateOutputUI(state.markdown))
            .finally(() => toggleLoader(false));
        updateThemeUI(state.theme);
        updatePaddingUI(state.padding);
        syncInputUI(state.markdown);

        // Notify input-dependent handlers (e.g. line numbers) about initial content
        if (elements.input) elements.input.dispatchEvent(new Event('input'));
        
        console.log('App Initialized Successfully');
    } catch (err) {
        console.error('Critical Error during initialization:', err);
    }
}

init();
