import { spawn } from 'node:child_process';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here = fileURLToPath(new URL('.', import.meta.url));
const html = resolve(here, 'index.html');
const output = resolve(here, 'entry.png');
const chromium = '/opt/meta-chromium/chrome';

async function browserRender(executable, needsPolicy = false) {
  const profile = await mkdtemp(join(tmpdir(), 'orbital-almanac-'));
  const policyArgs = [];
  if (needsPolicy) {
    const policyPath = join(profile, 'webgl-domains');
    const policy = Buffer.from('hatch-webgl-allowed-domains-v1\nexample.com\n');
    await writeFile(policyPath, policy);
    const policyHash = createHash('sha256').update(policy).digest('hex');
    policyArgs.push(`--hatch-webgl-allowed-domains-file=${policyPath}`, `--hatch-webgl-allowed-domains-sha256=${policyHash}`);
  }
  const child = spawn(executable, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--disable-crash-reporter', '--disable-breakpad', ...policyArgs,
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: 'ignore' });
  try {
    const portFile = join(profile, 'DevToolsActivePort');
    let port;
    for (let i = 0; i < 100; i++) {
      try { port = (await readFile(portFile, 'utf8')).split('\n')[0]; break; }
      catch { await new Promise(r => setTimeout(r, 100)); }
    }
    if (!port) throw new Error('Chromium did not open its DevTools port');
    const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('file://' + html)}`, { method: 'PUT' });
    if (!response.ok) throw new Error(`DevTools could not open page (${response.status})`);
    const target = await response.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let id = 0;
    const pending = new Map();
    ws.onmessage = event => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      }
    };
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const requestId = ++id; pending.set(requestId, { resolve, reject });
      ws.send(JSON.stringify({ id: requestId, method, params }));
    });
    await call('Emulation.setDeviceMetricsOverride', { width: 1024, height: 1024, deviceScaleFactor: 1, mobile: false });
    await call('Page.enable');
    await call('Page.navigate', { url: `file://${html}` });
    await new Promise(r => setTimeout(r, 900));
    const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(output, Buffer.from(shot.data, 'base64'));
    ws.close();
  } finally {
    child.kill('SIGTERM');
    await rm(profile, { recursive: true, force: true });
  }
}

async function playwrightRender() {
  const shell = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1148/chrome-linux/headless_shell';
  await access(shell);
  await browserRender(shell);
}

try { await browserRender(chromium, true); }
catch (error) {
  console.error(`Chromium rendering failed: ${error.message}; trying Playwright headless shell.`);
  await playwrightRender();
}
const { size } = await import('node:fs/promises').then(fs => fs.stat(output));
console.log(`entry.png: ${size} bytes`);
