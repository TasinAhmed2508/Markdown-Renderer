import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const root = new URL('.', import.meta.url).pathname;
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.md':'text/markdown'};
createServer(async (req,res)=>{
  try {
    const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = normalize(join(root, pathname === '/' ? 'index.html' : pathname));
    if (!file.startsWith(normalize(root))) throw new Error('forbidden');
    if ((await stat(file)).isDirectory()) file = join(file,'index.html');
    const data = await readFile(file); res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream'}); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port,'127.0.0.1',()=>console.log(`AI Coding Studio: http://127.0.0.1:${port}`));
