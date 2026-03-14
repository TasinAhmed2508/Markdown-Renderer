const STORAGE_KEY = 'ta-renderx-split-ratio';
const MIN_PERCENT = 20;
const DEFAULT_RATIO = 50;

export function initSplitPane() {
    const appGrid = document.querySelector('.app-grid');
    if (!appGrid) return;

    // Create divider
    const divider = document.createElement('div');
    divider.className = 'split-divider';
    Object.assign(divider.style, {
        width: '6px', cursor: 'col-resize', background: 'rgba(255,255,255,0.08)',
        position: 'relative', zIndex: '20', flexShrink: '0',
        transition: 'background 0.2s'
    });
    divider.addEventListener('mouseenter', () => { divider.style.background = 'rgba(255,255,255,0.2)'; });
    divider.addEventListener('mouseleave', () => { if (!dragging) divider.style.background = 'rgba(255,255,255,0.08)'; });

    // Insert divider between editor and preview panes
    const panes = appGrid.children;
    if (panes.length >= 2) {
        appGrid.insertBefore(divider, panes[1]);
    }

    // Load saved ratio
    let ratio = DEFAULT_RATIO;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
        ratio = Math.max(MIN_PERCENT, Math.min(100 - MIN_PERCENT, parseFloat(saved)));
    }
    applyRatio(appGrid, ratio);

    // Drag logic
    let dragging = false;

    divider.addEventListener('mousedown', (e) => {
        e.preventDefault();
        dragging = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const rect = appGrid.getBoundingClientRect();
        let percent = ((e.clientX - rect.left) / rect.width) * 100;
        percent = Math.max(MIN_PERCENT, Math.min(100 - MIN_PERCENT, percent));
        ratio = percent;
        applyRatio(appGrid, ratio);
    });

    document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        divider.style.background = 'rgba(255,255,255,0.08)';
        localStorage.setItem(STORAGE_KEY, String(ratio));
    });

    // Double-click to reset
    divider.addEventListener('dblclick', () => {
        ratio = DEFAULT_RATIO;
        applyRatio(appGrid, ratio);
        localStorage.setItem(STORAGE_KEY, String(ratio));
    });
}

function applyRatio(grid, percent) {
    grid.style.gridTemplateColumns = `${percent}fr 6px ${100 - percent}fr`;
}
