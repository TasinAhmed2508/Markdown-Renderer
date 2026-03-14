export const state = {
    markdown: '# ⚡️ TA RenderX\n\nWelcome to your new favorite markdown editor.\n\n## 1. Flowcharts (Mermaid)\n```mermaid\ngraph TD;\n    A[Start] --> B{Is it working?};\n    B -- Yes --> C[Great!];\n    B -- No --> D[Debug];\n    D --> B;\n    C --> E[Deploy];\n    style C fill:#28c840,stroke:#333,stroke-width:2px\n```\n\n## 2. Math Equations (LaTeX)\nThe energy of a particle is described by:\n$$ E = mc^2 $$\n\nMaxwell\'s equations in differential form:\n$$ \\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0} $$\n\n## 3. Code Highlighting\n```javascript\n// Welcome function\nfunction init() {\n  console.log("Hello TA RenderX");\n  return true;\n}\n```\n\n> "Simplicity is the ultimate sophistication." — Leonardo da Vinci',
    padding: 60,
    theme: 'default',
    themes: [
        { id: 'default', color: '#e5e5e5' },
        { id: 'light', color: '#ffffff' },
        { id: 'sunset', color: '#ff9a9e' },
        { id: 'ocean', color: '#a1c4fd' },
        { id: 'forest', color: '#d4fc79' },
        { id: 'dark', color: '#1e1e1e' }
    ]
};

export const listeners = [];

export function setState(newState) {
    if (!newState || typeof newState !== 'object') {
        console.warn('setState: invalid input, expected an object');
        return;
    }
    Object.assign(state, newState);
    for (let i = 0; i < listeners.length; i++) {
        try {
            listeners[i](state);
        } catch (err) {
            console.error(`State listener [${i}] error:`, err);
        }
    }
}

/**
 * Subscribe to state changes. Returns an unsubscribe function.
 */
export function subscribe(fn) {
    if (typeof fn !== 'function') {
        console.warn('subscribe: expected a function');
        return () => {};
    }
    listeners.push(fn);
    return () => {
        const idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
    };
}