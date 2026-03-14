import { state, setState, subscribe } from '../core/state.js';
import { elements } from '../ui/dom.js';
import { registerCommand } from './commands.js';

const MAX_HISTORY = 100;
let stack = [];
let pointer = -1;
let ignoreNextChange = false;
let debounceTimer = null;

function pushSnapshot(markdown) {
    // Discard any redo entries ahead of pointer
    stack = stack.slice(0, pointer + 1);
    stack.push(markdown);
    if (stack.length > MAX_HISTORY) {
        stack.shift();
    }
    pointer = stack.length - 1;
}

export function undo() {
    if (pointer <= 0) return;
    pointer--;
    applySnapshot(stack[pointer]);
}

export function redo() {
    if (pointer >= stack.length - 1) return;
    pointer++;
    applySnapshot(stack[pointer]);
}

function applySnapshot(markdown) {
    ignoreNextChange = true;
    const textarea = elements.input;
    if (textarea) textarea.value = markdown;
    setState({ markdown });
}

export function initHistory() {
    // Seed initial state
    pushSnapshot(state.markdown);

    subscribe((newState) => {
        if (ignoreNextChange) {
            ignoreNextChange = false;
            return;
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (newState.markdown !== stack[pointer]) {
                pushSnapshot(newState.markdown);
            }
        }, 500);
    });

    registerCommand('undo', {
        name: 'Undo',
        shortcut: 'ctrl+z',
        icon: 'undo-2',
        category: 'edit',
        execute: undo
    });

    registerCommand('redo', {
        name: 'Redo',
        shortcut: 'ctrl+y',
        icon: 'redo-2',
        category: 'edit',
        execute: redo
    });
}
