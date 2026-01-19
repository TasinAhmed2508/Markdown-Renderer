const get = (id) => document.getElementById(id);

export const elements = {
    get input() { return get('markdown-input'); },
    get output() { return get('markdown-output'); },
    get canvas() { return get('canvas'); }, // Hidden but required
    get paddingSlider() { return get('padding-slider'); }, // Hidden but required
    get themeSwatches() { return get('theme-swatches'); }, // Hidden but required
    // Export Dropdown
    get btnExportTrigger() { return get('btn-export-trigger'); },
    get exportMenu() { return get('export-menu'); },
    get btnExportPng() { return get('btn-export-png'); },
    get btnExportHtml() { return get('btn-export-html'); },
    get btnExportPdf() { return get('btn-export-pdf'); },

    get btnCopy() { return get('btn-copy'); },
    get btnDownloadMd() { return get('btn-download-md'); },
    get btnFormat() { return get('btn-format'); },
    get previewPane() { return get('canvas'); }, 
    get windowChrome() { return get('window-chrome'); }
};