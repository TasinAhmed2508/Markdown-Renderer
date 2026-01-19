/**
 * Feature: Chart.js Rendering
 * Renders charts from JSON code blocks (chart, chartjs)
 */

/* global Chart */

export function renderCharts(element) {
    if (typeof Chart === 'undefined') return;

    const selectors = 'pre code.language-chart, pre code.language-chartjs';
    element.querySelectorAll(selectors).forEach((block) => {
        try {
            const json = block.textContent.trim();
            const config = JSON.parse(json);

            const canvas = document.createElement('canvas');
            canvas.className = 'chart-canvas';

            // Replace pre with canvas
            const pre = block.parentElement;
            const container = document.createElement('div');
            container.className = 'chart-container';
            container.appendChild(canvas);

            pre.replaceWith(container);

            new Chart(canvas, config);
        } catch (err) {
            console.error('Chart.js error:', err);
            handleChartError(block, err);
        }
    });
}

function handleChartError(block, err) {
    block.style.border = '1px dashed #ef4444';
    block.style.color = '#ef4444';
    const msg = document.createElement('div');
    msg.className = 'text-red-500 text-xs mt-2';
    msg.textContent = `Chart Error: ${err.message}`;
    block.parentElement.appendChild(msg);
}
