import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// A tab can request its first larva or pond chunk minutes after loading the city.
// Keep the complete asset sets of the three preceding releases on Pages.
const repo = fileURLToPath(new URL('../', import.meta.url));
const dist = join(repo, 'game/dist');
const assets = join(dist, 'assets');
const inventory = 'release-assets.txt';
const git = (...args) => execFileSync('git', args, { cwd: repo, maxBuffer: 16 * 1024 * 1024 });
const lines = (data) => data.toString().trim().split('\n').filter(Boolean);
const entry = (html) => {
  const script = html.toString().match(/<script\b[^>]*\bsrc="\.\/assets\/([^"]+)"/);
  if (!script) throw new Error('Cannot identify the game entry module');
  return script[1];
};

// Record only this build's own files, so compatibility assets age out.
const manifest = join(dist, inventory);
if (!existsSync(manifest)) {
  writeFileSync(manifest, readdirSync(assets).sort().join('\n') + '\n');
}
const releases = new Set([entry(readFileSync(join(dist, 'index.html')))]);
const revisions = lines(git('log', '--first-parent', '--format=%H', '--', '_game/index.html'));
let restored = 0;
for (const rev of revisions) {
  const pages = rev + ':_game/';
  const previous = entry(git('show', pages + 'index.html'));
  if (releases.has(previous)) continue;
  releases.add(previous);
  const files = git('ls-tree', '--name-only', rev, '_game/' + inventory).length
    ? lines(git('show', pages + inventory))
    : lines(git('ls-tree', '--name-only', pages + 'assets'));
  for (const file of files) {
    if (basename(file) !== file) throw new Error('Invalid game asset name: ' + file);
    const dest = join(assets, file);
    if (!existsSync(dest)) {
      writeFileSync(dest, git('show', pages + 'assets/' + file));
      restored++;
    }
  }
  if (releases.size === 4) break;
}
console.log('Retained %d assets from %d previous game releases.', restored, releases.size - 1);
