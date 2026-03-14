import { state, setState, subscribe } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const STORAGE_KEY = 'renderx_tabs';
const MAX_TABS = 10;

const STYLES = `
#tabs-bar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px 8px;
    background: rgba(0,0,0,0.3);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    overflow-x: auto;
    flex-shrink: 0;
    font-family: var(--font-system);
    scrollbar-width: none;
}
#tabs-bar::-webkit-scrollbar { display: none; }
.tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    color: #9ca3af;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
    border: 1px solid transparent;
    min-width: 0;
    max-width: 160px;
    position: relative;
    user-select: none;
}
.tab-item:hover {
    color: #e5e7eb;
    background: rgba(255,255,255,0.05);
}
.tab-item.active {
    color: #fff;
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.3);
}
.tab-item .tab-name {
    overflow: hidden;
    text-overflow: ellipsis;
}
.tab-item .tab-name[contenteditable="true"] {
    outline: none;
    background: rgba(255,255,255,0.08);
    border-radius: 3px;
    padding: 0 4px;
    min-width: 40px;
}
.tab-item .tab-close {
    opacity: 0;
    font-size: 14px;
    line-height: 1;
    padding: 0 2px;
    border-radius: 3px;
    transition: all 0.15s;
    flex-shrink: 0;
}
.tab-item:hover .tab-close,
.tab-item.active .tab-close {
    opacity: 0.6;
}
.tab-item .tab-close:hover {
    opacity: 1;
    background: rgba(244,63,94,0.2);
    color: #f43f5e;
}
.tab-item .tab-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(99,102,241,0.6);
    flex-shrink: 0;
    display: none;
}
.tab-item.active .tab-dot {
    display: block;
}
#tab-add-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    transition: all 0.15s;
}
#tab-add-btn:hover {
    color: #e5e7eb;
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.15);
}
`;

let tabs = [];
let activeTabId = null;
let tabBarEl = null;

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
}

function generateId() {
    return 'tab-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

function saveTabs() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTabId }));
    } catch (e) { /* ignore */ }
}

function loadTabs() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            if (Array.isArray(data.tabs) && data.tabs.length) {
                tabs = data.tabs;
                activeTabId = data.activeTabId || tabs[0].id;
                return true;
            }
        }
    } catch (e) { /* ignore */ }
    return false;
}

function getActiveTab() {
    return tabs.find(t => t.id === activeTabId);
}

function switchTo(id) {
    // Save current content
    const current = getActiveTab();
    if (current && elements.input) {
        current.content = elements.input.value;
    }

    activeTabId = id;
    const tab = getActiveTab();
    if (tab && elements.input) {
        elements.input.value = tab.content;
        setState({ markdown: tab.content });
    }

    saveTabs();
    renderTabs();
}

function createTab(name, content) {
    if (tabs.length >= MAX_TABS) return null;
    const tab = { id: generateId(), name: name || `Untitled ${tabs.length + 1}`, content: content || '' };
    tabs.push(tab);
    saveTabs();
    return tab;
}

function closeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx === -1) return;

    tabs.splice(idx, 1);

    if (!tabs.length) {
        const t = createTab('Untitled 1', '');
        activeTabId = t.id;
    } else if (activeTabId === id) {
        activeTabId = tabs[Math.min(idx, tabs.length - 1)].id;
    }

    const tab = getActiveTab();
    if (tab && elements.input) {
        elements.input.value = tab.content;
        setState({ markdown: tab.content });
    }

    saveTabs();
    renderTabs();
}

function renameTab(id, newName) {
    const tab = tabs.find(t => t.id === id);
    if (tab) {
        tab.name = newName || tab.name;
        saveTabs();
    }
}

function renderTabs() {
    if (!tabBarEl) return;
    const fragment = document.createDocumentFragment();

    tabs.forEach(tab => {
        const el = document.createElement('div');
        el.className = 'tab-item' + (tab.id === activeTabId ? ' active' : '');
        el.innerHTML = `<span class="tab-dot"></span><span class="tab-name">${tab.name}</span><span class="tab-close">&times;</span>`;

        el.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) switchTo(tab.id);
        });

        el.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tab.id);
        });

        // Double-click to rename
        const nameEl = el.querySelector('.tab-name');
        nameEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            nameEl.contentEditable = 'true';
            nameEl.focus();
            const range = document.createRange();
            range.selectNodeContents(nameEl);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        });

        const finishRename = () => {
            nameEl.contentEditable = 'false';
            const newName = nameEl.textContent.trim();
            if (newName) renameTab(tab.id, newName);
            else nameEl.textContent = tab.name;
        };

        nameEl.addEventListener('blur', finishRename);
        nameEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
            if (e.key === 'Escape') { nameEl.textContent = tab.name; nameEl.blur(); }
        });

        fragment.appendChild(el);
    });

    // Add button
    const addBtn = document.createElement('button');
    addBtn.id = 'tab-add-btn';
    addBtn.textContent = '+';
    addBtn.title = 'New Tab';
    addBtn.addEventListener('click', newTab);
    fragment.appendChild(addBtn);

    tabBarEl.innerHTML = '';
    tabBarEl.appendChild(fragment);
}

function newTab() {
    if (tabs.length >= MAX_TABS) return;
    // Save current first
    const current = getActiveTab();
    if (current && elements.input) current.content = elements.input.value;

    const tab = createTab();
    activeTabId = tab.id;
    if (elements.input) {
        elements.input.value = '';
        setState({ markdown: '' });
    }
    renderTabs();
}

function closeCurrentTab() {
    if (activeTabId) closeTab(activeTabId);
}

function nextTab() {
    const idx = tabs.findIndex(t => t.id === activeTabId);
    if (idx !== -1 && tabs.length > 1) {
        switchTo(tabs[(idx + 1) % tabs.length].id);
    }
}

function prevTab() {
    const idx = tabs.findIndex(t => t.id === activeTabId);
    if (idx !== -1 && tabs.length > 1) {
        switchTo(tabs[(idx - 1 + tabs.length) % tabs.length].id);
    }
}

export function initTabs() {
    injectStyles();

    // Find editor pane
    const editorPane = elements.input?.closest('.glass-pane');
    if (!editorPane) return;

    tabBarEl = document.createElement('div');
    tabBarEl.id = 'tabs-bar';
    editorPane.insertBefore(tabBarEl, editorPane.firstChild);

    // Load or create default tab
    if (!loadTabs()) {
        const defaultContent = state.markdown || '';
        const tab = createTab('Welcome', defaultContent);
        activeTabId = tab.id;
    }

    // Sync editor with active tab
    const tab = getActiveTab();
    if (tab && elements.input) {
        elements.input.value = tab.content;
        setState({ markdown: tab.content });
    }

    renderTabs();

    // Keep tab content in sync on edits
    let syncing = false;
    subscribe((s) => {
        if (syncing) return;
        const current = getActiveTab();
        if (current && current.content !== s.markdown) {
            current.content = s.markdown;
            saveTabs();
        }
    });

    registerCommand('new-tab', {
        name: 'New Tab',
        shortcut: 'ctrl+shift+t',
        icon: 'plus',
        category: 'tabs',
        execute: newTab
    });

    registerCommand('close-tab', {
        name: 'Close Tab',
        shortcut: null,
        icon: 'x',
        category: 'tabs',
        execute: closeCurrentTab
    });

    registerCommand('next-tab', {
        name: 'Next Tab',
        shortcut: 'ctrl+shift+]',
        icon: 'arrow-right',
        category: 'tabs',
        execute: nextTab
    });

    registerCommand('prev-tab', {
        name: 'Previous Tab',
        shortcut: 'ctrl+shift+[',
        icon: 'arrow-left',
        category: 'tabs',
        execute: prevTab
    });
}
