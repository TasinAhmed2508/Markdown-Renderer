// Regex for CodeSandbox and Replit links
const RE_CODESANDBOX = /https:\/\/codesandbox\.io\/s\/[a-zA-Z0-9-]+/g;
const RE_REPLIT = /https:\/\/replit\.com\/@[\w-]+\/[\w-]+/g;

export function processEmbeds(html) {
    let newHtml = html;

    // Replace CodeSandbox links
    newHtml = newHtml.replace(RE_CODESANDBOX, (match) => {
        const embedUrl = match.replace('/s/', '/embed/');
        return `<div class="embed-container"><iframe src="${embedUrl}?fontsize=14&hidenavigation=1&theme=dark" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" title="CodeSandbox" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe></div>`;
    });

    // Replace Replit links
    newHtml = newHtml.replace(RE_REPLIT, (match) => {
        return `<div class="embed-container"><iframe src="${match}?embed=true" width="100%" height="500px" style="border:0; border-radius: 4px; overflow:hidden;" title="Replit"></iframe></div>`;
    });

    return newHtml;
}
