/**
 * Search Bar UI Module
 * Handles injection of the find/replace bar into the DOM
 */

/**
 * Injects the search bar HTML into the editor pane
 */
export function injectSearchBar() {
    const editorPane = document.querySelector('.glass-pane.group\\/editor');
    if (!editorPane) {
        console.warn('Editor pane for search injection not found');
        return;
    }

    const toolbar = document.getElementById('editor-toolbar');
    if (!toolbar) return;

    const searchHTML = `
        <div id="find-replace-bar" class="hidden flex items-center gap-2 p-2 border-b border-white/5 bg-black/30 backdrop-blur-xl transition-all">
            <input type="text" id="find-input" placeholder="Find..." class="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-indigo-500 outline-none w-32">
            <input type="text" id="replace-input" placeholder="Replace..." class="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-indigo-500 outline-none w-32">
            <button id="btn-find-next" class="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Next"><i class="fas fa-arrow-down text-xs"></i></button>
            <button id="btn-replace" class="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white text-xs px-2" title="Replace">Rep</button>
            <button id="btn-replace-all" class="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white text-xs px-2" title="All">All</button>
            <div class="flex-1"></div>
            <button id="btn-find-close" class="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400" title="Close"><i class="fas fa-times text-xs"></i></button>
        </div>
    `;

    toolbar.insertAdjacentHTML('afterend', searchHTML);
}
