import { state, setState, listeners } from '../js/core/state.js';
import { debounce } from '../js/utils/helpers.js';
import { processEmbeds } from '../js/features/embeds.js';

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

    const tests = {
        'State Management': () => {
            // Test 1: Initial State
            assert.ok(state.markdown, 'State should have initial markdown');
            
            // Test 2: setState updates value
            const oldListeners = listeners.length;
            let listenerCalled = false;
            listeners.push(() => { listenerCalled = true; });
            
            setState({ theme: 'test-theme' });
            assert.equal(state.theme, 'test-theme', 'Theme should update');
            assert.ok(listenerCalled, 'Listeners should be called on update');
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
