// Override foundation initShader to avoid double-init if index.html handles it
// or keep it if index.html script fails.
// Since index.html has inline shader logic now, we can disable this or sync them.
export function initShader() {
    console.log("Shader initialized via inline script in index.html");
}