/**
 * HTML Export Module
 * Handles HTML file exports
 */

/**
 * Export markdown output as standalone HTML file
 */
export async function exportHTML(btn) {
    if (!btn) return;

    const originalContent = btn.innerHTML;
    showLoading(btn);

    try {
        const content = document.getElementById('markdown-output');
        if (!content) throw new Error('Content not found');

        const html = generateDocument(content.innerHTML);
        downloadFile(html, `TA-RenderX-${timestamp()}.html`, 'text/html');
    } catch (err) {
        console.error('HTML Export failed:', err);
    } finally {
        resetButton(btn, originalContent);
    }
}

function generateDocument(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TA RenderX Export</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <style>
        body {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            color: #1e293b;
        }
        pre { background: #f6f8fa; padding: 16px; border-radius: 8px; overflow-x: auto; }
        code { font-family: "SF Mono", Consolas, monospace; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
        th { background: #f8fafc; }
        blockquote { border-left: 3px solid #3b82f6; margin: 1em 0; padding: 0.5em 1em; }
    </style>
</head>
<body>
${content}
</body>
</html>`;
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function showLoading(btn) {
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> HTML...`;
    btn.disabled = true;
    if (window.lucide) window.lucide.createIcons();
}

function resetButton(btn, content) {
    btn.innerHTML = content;
    btn.disabled = false;
    if (window.lucide) window.lucide.createIcons();
}

function timestamp() {
    return new Date().toISOString().slice(0, 10);
}
