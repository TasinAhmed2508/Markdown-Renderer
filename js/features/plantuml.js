/**
 * Feature: PlantUML Rendering
 * Renders UML diagrams using PlantUML Server
 */

/* global plantumlEncoder */

export function renderPlantUML(element) {
    if (typeof plantumlEncoder === 'undefined') return;

    const selectors = 'pre code.language-uml, pre code.language-plantuml';
    element.querySelectorAll(selectors).forEach((block) => {
        try {
            const code = block.textContent.trim();
            const encoded = plantumlEncoder.encode(code);
            const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;

            const img = document.createElement('img');
            img.src = url;
            img.alt = 'PlantUML Diagram';
            img.className = 'plantuml-diagram';
            img.loading = 'lazy';

            // Handle load errors
            img.onerror = () => {
                console.error('PlantUML load failed');
                img.replaceWith(block.parentElement);
            };

            const pre = block.parentElement;
            pre.replaceWith(img);
        } catch (err) {
            console.error('PlantUML encoding error:', err);
        }
    });
}
