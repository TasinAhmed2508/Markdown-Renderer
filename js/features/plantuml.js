/**
 * Feature: PlantUML Rendering
 * Renders UML diagrams using PlantUML Server
 */

/* global plantumlEncoder */

export function renderPlantUML(element) {
    if (typeof plantumlEncoder === 'undefined') return;

    const selectors = 'pre code.language-uml, pre code.language-plantuml';
    element.querySelectorAll(selectors).forEach((block) => {
        const pre = block.parentElement;
        if (!pre) return;

        try {
            const code = block.textContent.trim();
            if (!code) return;

            const encoded = plantumlEncoder.encode(code);
            const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;

            const img = document.createElement('img');
            img.src = url;
            img.alt = 'PlantUML Diagram';
            img.className = 'plantuml-diagram';
            img.loading = 'lazy';

            // Show error fallback if image fails to load
            img.onerror = () => {
                console.error('PlantUML load failed for:', url);
                const errDiv = document.createElement('div');
                errDiv.style.cssText = 'border:1px dashed #ef4444;color:#ef4444;padding:12px;border-radius:6px;font-size:13px;';
                errDiv.textContent = 'PlantUML diagram failed to load';
                img.replaceWith(errDiv);
            };

            pre.replaceWith(img);
        } catch (err) {
            console.error('PlantUML encoding error:', err);
        }
    });
}
