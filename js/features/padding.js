import { setState } from '../core/state.js';
import { elements } from '../ui/dom.js';

export function initPadding() {
    const slider = elements.paddingSlider;
    if (!slider) return;

    slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 0) {
            setState({ padding: value });
        }
    });
}

export function updatePaddingUI(padding) {
    const canvas = elements.canvas;
    if (!canvas) return;
    canvas.style.padding = `${padding}px`;
}
