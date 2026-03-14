import { state, setState, listeners } from '../js/core/state.js';
import { debounce } from '../js/utils/helpers.js';
import { processEmbeds } from '../js/features/embeds.js';
import { MathHandler } from '../js/core/math-handler.js';
import { Renderer } from '../js/core/renderer.js';

const assert = {
    equal: (actual, expected, msg) => {
        if (actual !== expected) throw new Error(`${msg} | Expected: ${expected}, Got: ${actual}`);
    },
    ok: (value, msg) => {
        if (!value) throw new Error(`${msg} | Expected truthy`);
    }
};

const results = document.getElementById('results');
let passed = 0;
let failed = 0;

function log(msg, type) {
    const div = document.createElement('div');
    div.className = type;
    div.textContent = `${type.toUpperCase()}: ${msg}`;
    results.appendChild(div);
}

export async function runTests() {
    results.innerHTML = '';
    passed = 0;
    failed = 0;

    const tests = {
        'State Management': () => {
            // Test 1: Initial State
            assert.ok(state.markdown, 'State should have initial markdown');
            
            // Test 2: setState updates value
            const baseListenerCount = listeners.length;
            const previousTheme = state.theme;
            let listenerCalled = false;
            listeners.push(() => { listenerCalled = true; });
            
            setState({ theme: 'test-theme' });
            assert.equal(state.theme, 'test-theme', 'Theme should update');
            assert.ok(listenerCalled, 'Listeners should be called on update');

            // Cleanup side effects for deterministic reruns
            listeners.splice(baseListenerCount);
            setState({ theme: previousTheme });
        },
        'Utils: Debounce': async () => {
            return new Promise((resolve, reject) => {
                let count = 0;
                const fn = debounce(() => { count++; }, 50);
                
                fn();
                fn();
                fn();
                
                assert.equal(count, 0, 'Debounced function should not run immediately');
                
                setTimeout(() => {
                    try {
                        assert.equal(count, 1, 'Debounced function should run exactly once');
                        resolve();
                    } catch (e) { reject(e); }
                }, 100);
            });
        },
        'Feature: Embeds': () => {
            const sandbox = 'https://codesandbox.io/s/test-id';
            const html = processEmbeds(sandbox);
            assert.ok(html.includes('<iframe'), 'Should convert CodeSandbox link to iframe');
            assert.ok(html.includes('embed/test-id'), 'Should use embed URL');
        },
        'Feature: Embeds (anchor HTML)': () => {
            const html = '<p><a href="https://codesandbox.io/s/test-id">https://codesandbox.io/s/test-id</a></p>';
            const output = processEmbeds(html);
            assert.ok(output.includes('<iframe'), 'Should replace anchor with iframe embed');
            assert.ok(!output.includes('<a href="<div'), 'Should not corrupt anchor href HTML');
        },
        'Core: Math Handler keeps $x_1$ math': () => {
            const mh = new MathHandler();
            const source = 'Inline math: $x_1$ and price: $12.99';
            const protectedText = mh.protectMath(source);

            assert.ok(protectedText.includes('<!--MATHBLOCK0PLACEHOLDER-->'), 'Should protect valid inline math');
            assert.ok(protectedText.includes('$12.99'), 'Should not treat pure currency as math');

            const restored = mh.restoreMath(`<p>${protectedText}</p>`);
            assert.ok(restored.includes('$x_1$'), 'Should restore inline math content');
        },
        'Core: Math Handler ignores code fence math-like text': () => {
            const mh = new MathHandler();
            const source = `\`\`\`js
const p = "$x+y$";
\`\`\`

$x+y$`;
            const protectedText = mh.protectMath(source);

            const placeholders = (protectedText.match(/MATHBLOCK/g) || []).length;
            assert.equal(placeholders, 1, 'Only non-code inline math should be protected');
            assert.ok(protectedText.includes('const p = \"$x+y$\";'), 'Code fence content should stay untouched');
        },
        'Core: Mermaid label fixer is conservative': () => {
            const r = new Renderer();
            const source = `\`\`\`mermaid
graph TD;
A[foo{bar}]-->B;
C((x+y))-->D;
\`\`\``;
            const fixed = r.fixMermaidLabels(source);

            assert.ok(fixed.includes('A[foo{bar}]'), 'Should not corrupt nested bracket labels');
            assert.ok(fixed.includes('C((x+y))'), 'Should not corrupt double-circle labels');
        }
    };

    for (const [name, test] of Object.entries(tests)) {
        try {
            await test();
            passed++;
            log(name, 'pass');
        } catch (err) {
            failed++;
            log(`${name} - ${err.message}`, 'fail');
            console.error(err);
        }
    }

    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.textContent = `Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`;
    results.appendChild(summary);
}
