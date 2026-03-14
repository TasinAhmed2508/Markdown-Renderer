const btnExtract = document.getElementById('btn-extract');
const statusEl = document.getElementById('status');

btnExtract.addEventListener('click', async () => {
    btnExtract.disabled = true;
    btnExtract.innerHTML = '<span class="spinner"></span> Extracting…';
    hideStatus();

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab?.url) {
            showStatus('error', '❌ Cannot access this tab.');
            resetBtn();
            return;
        }

        const isChatGPT = /chat(gpt)?\.openai\.com|chatgpt\.com/i.test(tab.url);
        if (!isChatGPT) {
            showStatus('error', '❌ Not a ChatGPT page.\nOpen a ChatGPT conversation first.');
            resetBtn();
            return;
        }

        showStatus('info', '⏳ Extracting responses…');

        // Send to background to extract + open RenderX
        const result = await chrome.runtime.sendMessage({
            action: 'extractAndOpen',
            tabId: tab.id
        });

        if (result?.error) {
            showStatus('error', '❌ ' + result.error);
            resetBtn();
            return;
        }

        const plural = result.count > 1 ? 's' : '';
        showStatus('success',
            `✅ Extracted ${result.count} response${plural} (${formatSize(result.size)})\n` +
            `Opened in RenderX — rendering now!`
        );

    } catch (err) {
        showStatus('error', '❌ ' + err.message);
    }

    resetBtn();
});

function showStatus(type, message) {
    statusEl.className = 'status show ' + type;
    statusEl.textContent = message;
}

function hideStatus() {
    statusEl.className = 'status';
    statusEl.textContent = '';
}

function resetBtn() {
    btnExtract.disabled = false;
    btnExtract.innerHTML = '🚀 Extract & Render';
}

function formatSize(charCount) {
    if (charCount < 1024) return charCount + ' chars';
    return (charCount / 1024).toFixed(1) + ' KB';
}
