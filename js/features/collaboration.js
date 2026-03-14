/**
 * Collaboration Module
 * Share documents via URL with base64-encoded content
 */

import { state, setState } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

function encodeContent(text) {
    try {
        return btoa(unescape(encodeURIComponent(text)));
    } catch {
        return btoa(text);
    }
}

function decodeContent(encoded) {
    try {
        return decodeURIComponent(escape(atob(encoded)));
    } catch {
        try { return atob(encoded); } catch { return null; }
    }
}

function generateShareURL() {
    const md = state.markdown;
    if (!md) return window.location.href;
    const encoded = encodeContent(md);
    return `${window.location.origin}${window.location.pathname}#shared=${encoded}`;
}

function showShareModal() {
    // Remove existing modal
    const existing = document.getElementById('share-modal');
    if (existing) existing.remove();

    const shareURL = generateShareURL();

    const modal = document.createElement('div');
    modal.id = 'share-modal';
    modal.className = 'share-modal-overlay';
    modal.innerHTML = `
        <div class="share-modal-content">
            <div class="share-modal-header">
                <h3>Share Document</h3>
                <button id="share-modal-close" title="Close">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="share-modal-body">
                <p>Share your markdown document via URL. The content is encoded directly in the link — no server required.</p>
                <div class="share-url-container">
                    <input type="text" id="share-url-input" value="${shareURL}" readonly />
                    <button id="btn-copy-share-url" title="Copy Link">
                        <i data-lucide="copy" class="w-4 h-4"></i> Copy Link
                    </button>
                </div>
                <p class="share-modal-note">Note: Very large documents may exceed URL length limits in some browsers.</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons();

    // Close modal
    document.getElementById('share-modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Copy URL
    document.getElementById('btn-copy-share-url').addEventListener('click', () => {
        const input = document.getElementById('share-url-input');
        navigator.clipboard.writeText(input.value).then(() => {
            const btn = document.getElementById('btn-copy-share-url');
            btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!';
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => {
                btn.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i> Copy Link';
                if (window.lucide) window.lucide.createIcons();
            }, 2000);
        }).catch(() => {
            input.select();
            document.execCommand('copy');
        });
    });
}

function loadSharedContent() {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#shared=')) return;

    const encoded = hash.substring('#shared='.length);
    const content = decodeContent(encoded);
    if (content) {
        setState({ markdown: content });
        if (elements.input) elements.input.value = content;
        // Clean the URL hash
        history.replaceState(null, '', window.location.pathname);
        console.log('Loaded shared document from URL');
    }
}

function createShareButton() {
    const toolbar = document.getElementById('app-toolbar');
    if (!toolbar) return;

    const btn = document.createElement('button');
    btn.id = 'btn-share';
    btn.className = 'relative hidden md:inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-medium text-white transition-transform active:scale-95 group';
    btn.innerHTML = `
        <div class="absolute inset-0 bg-emerald-600 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
        <div class="relative bg-emerald-500/20 border border-emerald-400/30 rounded-full px-6 py-2 flex items-center gap-2 backdrop-blur-md">
            <i data-lucide="share-2" class="w-4 h-4"></i> Share
        </div>
    `;
    btn.addEventListener('click', showShareModal);

    // Insert before the last child (Save button)
    const saveBtn = document.getElementById('btn-download-md');
    if (saveBtn) {
        toolbar.insertBefore(btn, saveBtn);
    } else {
        toolbar.appendChild(btn);
    }

    if (window.lucide) window.lucide.createIcons();
}

function injectShareStyles() {
    const style = document.createElement('style');
    style.id = 'collaboration-styles';
    style.textContent = `
        .share-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
        }
        .share-modal-content {
            background: #0d1117;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            width: 90%;
            max-width: 520px;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
            overflow: hidden;
        }
        .share-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .share-modal-header h3 {
            color: white;
            font-size: 16px;
            font-weight: 600;
            margin: 0;
        }
        .share-modal-header button {
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
            border-radius: 6px;
        }
        .share-modal-header button:hover { color: white; background: rgba(255,255,255,0.1); }
        .share-modal-body {
            padding: 20px;
        }
        .share-modal-body p {
            color: #9ca3af;
            font-size: 14px;
            line-height: 1.5;
            margin: 0 0 16px;
        }
        .share-url-container {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
        }
        .share-url-container input {
            flex: 1;
            padding: 10px 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #e5e7eb;
            font-size: 13px;
            font-family: monospace;
            outline: none;
        }
        .share-url-container input:focus { border-color: rgba(99, 102, 241, 0.5); }
        .share-url-container button {
            padding: 10px 16px;
            background: rgba(99, 102, 241, 0.8);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
            transition: background 0.2s;
        }
        .share-url-container button:hover { background: rgba(99, 102, 241, 1); }
        .share-modal-note {
            color: #6b7280 !important;
            font-size: 12px !important;
            margin-bottom: 0 !important;
        }
    `;
    document.head.appendChild(style);
}

export function initCollaboration() {
    injectShareStyles();
    createShareButton();
    loadSharedContent();

    registerCommand('share-document', {
        name: 'Share Document',
        icon: 'share-2',
        category: 'collaboration',
        execute: showShareModal
    });

    console.log('Collaboration initialized');
}
