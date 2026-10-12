import { state, setState, subscribe } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const DB_NAME = 'renderx_versions';
const STORE_NAME = 'snapshots';
const DB_VERSION = 1;
const MAX_SNAPSHOTS = 50;
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

const STYLES = `
#version-history-panel {
    position: fixed;
    top: 4.5rem;
    right: 0;
    width: 340px;
    height: calc(100vh - 4.5rem);
    z-index: 55;
    background: rgba(13,17,23,0.94);
    backdrop-filter: blur(24px);
    border-left: 1px solid rgba(255,255,255,0.08);
    box-shadow: -8px 0 32px rgba(0,0,0,0.5);
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
    display: flex;
    flex-direction: column;
    font-family: var(--font-system);
}
#version-history-panel.open {
    transform: translateX(0);
}
.vh-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.vh-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #e5e7eb;
}
.vh-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}
.vh-save-btn {
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid rgba(251,191,36,0.3);
    background: rgba(251,191,36,0.1);
    color: #fbbf24;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}
.vh-save-btn:hover {
    background: rgba(251,191,36,0.2);
}
.vh-close-btn {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
}
.vh-close-btn:hover {
    color: #fff;
    background: rgba(255,255,255,0.08);
}
.vh-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}
.vh-item {
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    transition: background 0.15s;
    cursor: pointer;
}
.vh-item:hover {
    background: rgba(255,255,255,0.03);
}
.vh-item-time {
    font-size: 13px;
    font-weight: 500;
    color: #e5e7eb;
    margin-bottom: 4px;
}
.vh-item-meta {
    font-size: 11px;
    color: #6b7280;
    margin-bottom: 8px;
}
.vh-item-actions {
    display: flex;
    gap: 6px;
}
.vh-item-actions button {
    padding: 3px 10px;
    border-radius: 5px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: #9ca3af;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
}
.vh-item-actions .vh-restore:hover {
    background: rgba(99,102,241,0.15);
    color: #a5b4fc;
    border-color: rgba(99,102,241,0.3);
}
.vh-item-actions .vh-delete:hover {
    background: rgba(244,63,94,0.15);
    color: #f43f5e;
    border-color: rgba(244,63,94,0.3);
}
.vh-empty {
    padding: 32px 20px;
    text-align: center;
    color: #6b7280;
    font-size: 13px;
}
.vh-preview-overlay {
    position: fixed;
    inset: 0;
    z-index: 9997;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(6px);
}
.vh-preview-overlay.open {
    display: flex;
}
.vh-preview-modal {
    width: 600px;
    max-width: 90vw;
    max-height: 70vh;
    background: rgba(13,17,23,0.96);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.vh-preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.vh-preview-header span {
    font-size: 13px;
    color: #e5e7eb;
    font-weight: 500;
}
.vh-preview-header button {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 18px;
}
.vh-preview-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px 18px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: #d1d5db;
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.6;
}
`;

let db = null;
let panel = null;
let vhBody = null;
let previewOverlay = null;
let isOpen = false;
let autoSaveTimer = null;

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
}

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
        request.onsuccess = (e) => { db = e.target.result; resolve(db); };
        request.onerror = (e) => reject(e.target.error);
    });
}

function getAllSnapshots() {
    return new Promise((resolve, reject) => {
        if (!db) { resolve([]); return; }
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
            const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(results);
        };
        request.onerror = () => reject(request.error);
    });
}

function saveSnapshot(content, label) {
    return new Promise((resolve, reject) => {
        if (!db) { reject(new Error('DB not open')); return; }
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const snapshot = {
            content,
            timestamp: Date.now(),
            label: label || 'Auto-save',
            wordCount: content.split(/\s+/).filter(Boolean).length
        };

        const request = store.add(snapshot);
        request.onsuccess = () => {
            pruneOldSnapshots().then(() => resolve());
        };
        request.onerror = () => reject(request.error);
    });
}

function deleteSnapshot(id) {
    return new Promise((resolve, reject) => {
        if (!db) { reject(new Error('DB not open')); return; }
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function pruneOldSnapshots() {
    const all = await getAllSnapshots();
    if (all.length <= MAX_SNAPSHOTS) return;
    const toDelete = all.slice(MAX_SNAPSHOTS);
    for (const snap of toDelete) {
        await deleteSnapshot(snap.id);
    }
}

function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;

    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
        ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

async function renderVersionList() {
    if (!vhBody) return;
    const snapshots = await getAllSnapshots();

    if (!snapshots.length) {
        vhBody.innerHTML = '<div class="vh-empty">No version history yet.<br>Snapshots are saved every 5 minutes.</div>';
        return;
    }

    vhBody.innerHTML = snapshots.map(s => `
        <div class="vh-item" data-id="${s.id}">
            <div class="vh-item-time">${formatTime(s.timestamp)}</div>
            <div class="vh-item-meta">${s.label} · ${s.wordCount} words</div>
            <div class="vh-item-actions">
                <button class="vh-restore" data-id="${s.id}">Restore</button>
                <button class="vh-preview-btn" data-id="${s.id}">Preview</button>
                <button class="vh-delete" data-id="${s.id}">Delete</button>
            </div>
        </div>
    `).join('');

    vhBody.querySelectorAll('.vh-restore').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const snaps = await getAllSnapshots();
            const snap = snaps.find(s => s.id === id);
            if (snap && elements.input) {
                elements.input.value = snap.content;
                setState({ markdown: snap.content });
            }
        });
    });

    vhBody.querySelectorAll('.vh-preview-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const snaps = await getAllSnapshots();
            const snap = snaps.find(s => s.id === id);
            if (snap) showPreview(snap);
        });
    });

    vhBody.querySelectorAll('.vh-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            await deleteSnapshot(id);
            renderVersionList();
        });
    });
}

function showPreview(snap) {
    const content = previewOverlay.querySelector('.vh-preview-content');
    const header = previewOverlay.querySelector('.vh-preview-header span');
    content.textContent = snap.content;
    header.textContent = `Version: ${formatTime(snap.timestamp)}`;
    previewOverlay.classList.add('open');
}

function toggle() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    const btn = document.getElementById('btn-version-history');
    if (btn) btn.classList.toggle('active', isOpen);
    if (isOpen) renderVersionList();
}

async function manualSave() {
    const content = elements.input?.value || state.markdown;
    if (content.trim()) {
        await saveSnapshot(content, 'Manual save');
        if (isOpen) renderVersionList();
        // Visual feedback
        const btn = panel.querySelector('.vh-save-btn');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'Saved!';
            setTimeout(() => { btn.textContent = orig; }, 1200);
        }
    }
}

export async function initVersionHistory() {
    injectStyles();

    await openDB();

    // Reuse the toolbar button (index.html already renders it)
    const btn = document.getElementById('btn-version-history');
    if (!btn) return;

    // Create panel
    panel = document.createElement('div');
    panel.id = 'version-history-panel';
    panel.innerHTML = `
        <div class="vh-header">
            <h3>Version History</h3>
            <div class="vh-header-actions">
                <button class="vh-save-btn">Save Now</button>
                <button class="vh-close-btn">&times;</button>
            </div>
        </div>
        <div class="vh-body"></div>
    `;
    document.body.appendChild(panel);

    // Preview overlay
    previewOverlay = document.createElement('div');
    previewOverlay.className = 'vh-preview-overlay';
    previewOverlay.innerHTML = `
        <div class="vh-preview-modal">
            <div class="vh-preview-header">
                <span>Version Preview</span>
                <button>&times;</button>
            </div>
            <div class="vh-preview-content"></div>
        </div>
    `;
    document.body.appendChild(previewOverlay);

    vhBody = panel.querySelector('.vh-body');

    btn.addEventListener('click', toggle);
    panel.querySelector('.vh-close-btn').addEventListener('click', toggle);
    panel.querySelector('.vh-save-btn').addEventListener('click', manualSave);

    previewOverlay.querySelector('.vh-preview-header button').addEventListener('click', () => {
        previewOverlay.classList.remove('open');
    });
    previewOverlay.addEventListener('click', (e) => {
        if (e.target === previewOverlay) previewOverlay.classList.remove('open');
    });

    // Auto-save every 5 minutes
    autoSaveTimer = setInterval(async () => {
        const content = elements.input?.value || state.markdown;
        if (content.trim()) {
            await saveSnapshot(content, 'Auto-save');
        }
    }, AUTO_SAVE_INTERVAL);

    if (window.lucide) window.lucide.createIcons();

    registerCommand('toggle-version-history', {
        name: 'Toggle Version History',
        shortcut: null,
        icon: 'history',
        category: 'view',
        execute: toggle
    });

    registerCommand('save-version', {
        name: 'Save Version Snapshot',
        shortcut: 'ctrl+shift+s',
        icon: 'save',
        category: 'edit',
        execute: manualSave
    });
}
