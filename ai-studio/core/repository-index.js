function hash(text) {
  let h = 2166136261;
  for (let i=0;i<text.length;i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8,'0');
}

export function indexFiles(files = []) {
  return files.map(file => {
    const text = file.content || '';
    const imports = [...text.matchAll(/(?:import .*? from |require\()['"]([^'"]+)/g)].map(m => m[1]);
    const symbols = [...text.matchAll(/\b(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)].map(m => m[1]);
    return {path:file.path, hash:hash(text), bytes:text.length, imports:[...new Set(imports)], symbols:[...new Set(symbols)]};
  });
}

export function detectFramework(paths = []) {
  const joined = paths.join(' ').toLowerCase();
  if (joined.includes('vite.config')) return 'Vite';
  if (joined.includes('next.config')) return 'Next.js';
  if (joined.includes('tauri.conf')) return 'Tauri';
  if (joined.includes('package.json')) return 'JavaScript/Node';
  return 'Unknown';
}

export function freshness(previous = [], current = []) {
  const old = new Map(previous.map(x => [x.path, x.hash]));
  const changed = current.filter(x => old.get(x.path) !== x.hash).map(x => x.path);
  const removed = previous.filter(x => !current.some(y => y.path===x.path)).map(x => x.path);
  return {fresh:changed.length===0 && removed.length===0, changed, removed};
}
