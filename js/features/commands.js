const commands = new Map();

export function registerCommand(id, { name, shortcut, icon, category, execute }) {
    commands.set(id, { id, name, shortcut: shortcut || null, icon: icon || null, category: category || 'general', execute });
}

export function executeCommand(id) {
    const cmd = commands.get(id);
    if (!cmd) {
        console.warn(`Command not found: ${id}`);
        return false;
    }
    try {
        cmd.execute();
        return true;
    } catch (err) {
        console.error(`Command "${id}" failed:`, err);
        return false;
    }
}

export function getCommands() {
    return Array.from(commands.values());
}

export function searchCommands(query) {
    if (!query) return getCommands();
    const lower = query.toLowerCase();
    return getCommands().filter(cmd => {
        const name = cmd.name.toLowerCase();
        let qi = 0;
        for (let i = 0; i < name.length && qi < lower.length; i++) {
            if (name[i] === lower[qi]) qi++;
        }
        return qi === lower.length;
    });
}
