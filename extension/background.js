/**
 * Background Service Worker
 * Handles storing extracted markdown and injecting it into RenderX tab.
 */

const RENDERX_URL = 'https://markdown-renderer-five.vercel.app/';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'extractAndOpen') {
        handleExtractAndOpen(msg.tabId).then(sendResponse).catch(err => {
            sendResponse({ error: err.message });
        });
        return true; // async response
    }
});

async function handleExtractAndOpen(chatTabId) {
    // 1. Extract from ChatGPT tab
    const results = await chrome.scripting.executeScript({
        target: { tabId: chatTabId },
        files: ['content.js']
    });

    const data = results?.[0]?.result;
    if (!data || data.error) {
        return { error: data?.error || 'No response from ChatGPT page.' };
    }

    // 2. Store extracted text
    await chrome.storage.local.set({ extractedMarkdown: data.text });

    // 3. Check if RenderX tab is already open
    const tabs = await chrome.tabs.query({ url: RENDERX_URL + '*' });
    let renderTab;

    if (tabs.length > 0) {
        // Reuse existing tab
        renderTab = tabs[0];
        await chrome.tabs.update(renderTab.id, { active: true });
        // Inject the paste script
        await injectPaste(renderTab.id, data.text);
    } else {
        // Open new tab
        renderTab = await chrome.tabs.create({ url: RENDERX_URL });
        // Wait for the page to load, then inject
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === renderTab.id && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                injectPaste(tabId, data.text);
            }
        });
    }

    return { count: data.count, size: data.text.length };
}

async function injectPaste(tabId, markdownText) {
    await chrome.scripting.executeScript({
        target: { tabId },
        func: (text) => {
            // Mark extension as installed & hide banner
            window.__RENDERX_EXT_INSTALLED = true;
            localStorage.setItem('ext_banner_dismissed', '1');
            const banner = document.getElementById('ext-banner');
            if (banner) banner.remove();

            // Wait for the app to initialize
            const tryPaste = (attempts = 0) => {
                const input = document.getElementById('markdown-input');
                if (!input && attempts < 20) {
                    setTimeout(() => tryPaste(attempts + 1), 300);
                    return;
                }
                if (!input) return;

                input.value = text;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.focus();

                // Scroll to top of preview
                const preview = document.getElementById('markdown-output')
                    || document.querySelector('.preview');
                if (preview) preview.scrollTop = 0;
            };
            tryPaste();
        },
        args: [markdownText]
    });
}
