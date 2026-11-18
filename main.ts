import { mkdir, copyFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = new URL('./entry.png', import.meta.url);
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const destination = resolve(outputDir, 'entry.png');

await mkdir(outputDir, { recursive: true });
const sourceSize = (await stat(source)).size;
await copyFile(source, destination);
const copiedSize = (await stat(destination)).size;
if (copiedSize !== sourceSize) {
  throw new Error(`Copied size (${copiedSize}) does not match source size (${sourceSize})`);
}
console.log(`Copied entry.png (${copiedSize} bytes) to ${destination}`);
