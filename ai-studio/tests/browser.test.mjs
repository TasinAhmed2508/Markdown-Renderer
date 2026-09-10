import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

let chromium;
try { ({chromium} = await import('playwright')); }
catch { console.error('Playwright package missing. Run npm install before studio:test:e2e.'); process.exit(2); }

const port=4174;
const server=spawn(process.execPath,['ai-studio/dev-server.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try {
  await sleep(500);
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(`http://127.0.0.1:${port}`,{waitUntil:'networkidle'});
  assert.match(await page.locator('h1').innerText(),/What should we build/);
  assert.equal(await page.locator('textarea[aria-label="Task instruction"]').count(),1);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement?.tagName),'BUTTON');
  await page.getByRole('button',{name:/New task/}).click();
  assert.equal(await page.getByRole('heading',{name:'Create project'}).count(),1);
  await page.locator('[data-action="close-modal"]').click();
  const buttons=await page.getByRole('button').count(); assert.ok(buttons>=8);
  await page.getByRole('button',{name:/QA/}).click();
  assert.match(await page.locator('h1').innerText(),/Independent QA/);
  await browser.close(); console.log('browser journey passed');
} finally { server.kill('SIGTERM'); }
