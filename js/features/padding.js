import { setState } from '../core/state.js';
import { elements } from '../ui/dom.js';

export function initPadding() {
    elements.paddingSlider.addEventListener('input', (e) => {
        setState({ padding: parseInt(e.target.value, 10) });
    });
}

export function updatePaddingUI(padding) {
    elements.canvas.style.padding = `${padding}px`;
}
