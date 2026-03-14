/**
 * Plugin System Module
 * Basic plugin/extension API for RenderX
 */

import { registerCommand } from './commands.js';

const plugins = new Map();
const preProcessors = [];
const postProcessors = [];

/**
 * Register a plugin with { name, version, init, hooks }
 */
function register(pluginDef) {
    if (!pluginDef || !pluginDef.name) {
        console.warn('Plugin registration requires a name');
        return false;
    }
    if (plugins.has(pluginDef.name)) {
        console.warn(`Plugin "${pluginDef.name}" is already registered`);
        return false;
    }

    plugins.set(pluginDef.name, {
        name: pluginDef.name,
        version: pluginDef.version || '1.0.0',
        hooks: pluginDef.hooks || {},
        enabled: true
    });

    // Register hook-based processors
    if (pluginDef.hooks) {
        if (typeof pluginDef.hooks.preProcess === 'function') {
            preProcessors.push(pluginDef.hooks.preProcess);
        }
        if (typeof pluginDef.hooks.postProcess === 'function') {
            postProcessors.push(pluginDef.hooks.postProcess);
        }
    }

    // Run plugin init
    if (typeof pluginDef.init === 'function') {
        try {
            pluginDef.init();
        } catch (err) {
            console.error(`Plugin "${pluginDef.name}" init failed:`, err);
        }
    }

    console.log(`Plugin registered: ${pluginDef.name} v${pluginDef.version || '1.0.0'}`);
    return true;
}

/**
 * Add a pre-processor function to run before markdown parsing
 */
function addPreProcessor(fn) {
    if (typeof fn === 'function') preProcessors.push(fn);
}

/**
 * Add a post-processor function to run after HTML generation
 */
function addPostProcessor(fn) {
    if (typeof fn === 'function') postProcessors.push(fn);
}

/**
 * Add a custom toolbar button
 */
function addToolbarButton({ icon, title, onClick }) {
    const toolbar = document.getElementById('editor-toolbar');
    if (!toolbar) return;

    const btn = document.createElement('button');
    btn.className = 'p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors';
    btn.title = title || '';
    btn.innerHTML = icon || '?';
    btn.addEventListener('click', onClick);
    toolbar.appendChild(btn);
}

/**
 * Register a command via the plugin API
 */
function addCommand(id, def) {
    registerCommand(id, def);
}

/**
 * Get all registered pre-processors
 */
export function getPreProcessors() {
    return [...preProcessors];
}

/**
 * Get all registered post-processors
 */
export function getPostProcessors() {
    return [...postProcessors];
}

/**
 * Get list of registered plugins
 */
export function getPlugins() {
    return Array.from(plugins.values());
}

// Public API object
const pluginAPI = {
    register,
    addPreProcessor,
    addPostProcessor,
    addToolbarButton,
    addCommand,
    getPlugins() { return Array.from(plugins.values()); },
    getPreProcessors,
    getPostProcessors
};

export function initPlugins() {
    // Expose global API
    window.RenderXPlugins = pluginAPI;

    registerCommand('list-plugins', {
        name: 'List Plugins',
        icon: 'puzzle',
        category: 'plugins',
        execute() {
            const list = getPlugins();
            if (list.length === 0) {
                console.log('No plugins registered');
            } else {
                console.table(list.map(p => ({ name: p.name, version: p.version, enabled: p.enabled })));
            }
        }
    });

    console.log('Plugin system initialized');
}

export { pluginAPI };
