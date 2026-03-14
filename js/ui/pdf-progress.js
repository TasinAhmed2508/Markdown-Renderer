/**
 * PDF Progress UI Module
 * Shows export progress and handles errors
 */

let progressModal = null;

/**
 * Create and show progress modal
 * @returns {Object} Progress controller
 */
export function showProgress() {
    // Create modal
    progressModal = document.createElement('div');
    progressModal.id = 'pdf-progress-modal';
    progressModal.innerHTML = `
        <div class="pdf-progress-backdrop"></div>
        <div class="pdf-progress-content">
            <div class="pdf-progress-icon">
                <i data-lucide="file-text" class="w-8 h-8 text-indigo-400"></i>
            </div>
            <div class="pdf-progress-title">Generating PDF</div>
            <div class="pdf-progress-status">Preparing content...</div>
            <div class="pdf-progress-bar-container">
                <div class="pdf-progress-bar"></div>
            </div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = getProgressStyles();
    progressModal.appendChild(style);

    document.body.appendChild(progressModal);

    // Init Lucide icons
    if (window.lucide) window.lucide.createIcons();

    return {
        updateStatus: (text) => updateStatus(text),
        updateProgress: (percent) => updateProgress(percent),
        showError: (message) => showError(message),
        hide: () => hideProgress()
    };
}

function updateStatus(text) {
    const el = progressModal?.querySelector('.pdf-progress-status');
    if (el) el.textContent = text;
}

function updateProgress(percent) {
    const bar = progressModal?.querySelector('.pdf-progress-bar');
    if (bar) bar.style.width = `${percent}%`;
}

function showError(message) {
    const content = progressModal?.querySelector('.pdf-progress-content');
    if (!content) return;

    content.innerHTML = '';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'pdf-progress-icon error';
    iconWrap.innerHTML = '<i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i>';

    const title = document.createElement('div');
    title.className = 'pdf-progress-title error';
    title.textContent = 'Export Failed';

    const error = document.createElement('div');
    error.className = 'pdf-progress-error';
    error.textContent = message || 'PDF export failed unexpectedly.';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'pdf-progress-close';
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', hideProgress);

    content.appendChild(iconWrap);
    content.appendChild(title);
    content.appendChild(error);
    content.appendChild(closeBtn);

    if (window.lucide) window.lucide.createIcons();
}

function hideProgress() {
    if (progressModal) {
        progressModal.remove();
        progressModal = null;
    }
}

function getProgressStyles() {
    return `
        .pdf-progress-backdrop { position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9998; }
        .pdf-progress-content { position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;
            padding:32px;text-align:center;z-index:9999;min-width:300px; }
        .pdf-progress-icon { margin-bottom:16px; }
        .pdf-progress-title { font-size:18px;font-weight:600;color:#fff;margin-bottom:8px; }
        .pdf-progress-status { font-size:14px;color:#94a3b8;margin-bottom:20px; }
        .pdf-progress-bar-container { height:4px;background:rgba(255,255,255,0.1);border-radius:2px; }
        .pdf-progress-bar { height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);
            border-radius:2px;width:0;transition:width 0.3s; }
        .pdf-progress-error { font-size:13px;color:#f87171;margin-bottom:20px;max-width:280px; }
        .pdf-progress-close { background:#6366f1;color:#fff;border:none;padding:10px 24px;
            border-radius:8px;cursor:pointer;font-weight:500; }
    `;
}
