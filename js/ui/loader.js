export function toggleLoader(show) {
    const loader = document.getElementById('preview-loader');
    if (loader) {
        if (show) loader.classList.add('active');
        else loader.classList.remove('active');
    }
}
