import {execSync} from 'node:child_process';
import {readFileSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import type {Plugin} from 'vite';
import {defineConfig} from 'vitest/config';

const ATLAS = fileURLToPath(new URL('./public/fighters/pose-atlas.json', import.meta.url));

/**
 * public/fighters/pose-atlas.json stays the single source of truth (installers
 * and checks read and write it), but it is several MB. The game only needs the
 * bodies in the current match, so this publishes it split: an index with every
 * body id, and one small file per body, at /fighters/pose-atlas/<id>.json.
 * The dev server derives them on request; builds emit them next to the full file.
 */
function poseAtlasSplit(): Plugin {
  let cache: {mtime: number; files: Map<string, string>} | null = null;
  const split = () => {
    const mtime = statSync(ATLAS).mtimeMs;
    if (cache?.mtime === mtime) return cache.files;
    const manifest = JSON.parse(readFileSync(ATLAS, 'utf8'));
    const head = {version: manifest.version, revision: manifest.revision};
    const files = new Map<string, string>();
    // Each index entry carries the body's standing pose, so the selection menu can
    // preview a fighter from one small image before its full body is requested.
    const standing = (f: any) => typeof f === 'string' ? f : Object.fromEntries(['url', 'width', 'height', 'anchor', 'bounds'].filter(k => f[k] !== undefined).map(k => [k, f[k]]));
    const preview = (cfg: any) => ({frame: standing(cfg.frames[0]), width: cfg.width, height: cfg.height, anchor: cfg.anchor, ...(cfg.facing === undefined ? {} : {facing: cfg.facing})});
    files.set('index.json', JSON.stringify({...head, fighters: Object.fromEntries(Object.entries(manifest.fighters).map(([id, cfg]) => [id, {preview: preview(cfg)}]))}));
    for (const [id, cfg] of Object.entries(manifest.fighters)) files.set(`${id}.json`, JSON.stringify({...head, fighters: {[id]: cfg}}));
    cache = {mtime, files};
    return files;
  };
  return {
    name: 'pose-atlas-split',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = /\/fighters\/pose-atlas\/([^/?]+\.json)(?:\?|$)/.exec(req.url ?? '');
        const body = match && split().get(decodeURIComponent(match[1]));
        if (!body) return next();
        res.setHeader('Content-Type', 'application/json');
        res.end(body);
      });
    },
    generateBundle() {
      for (const [name, source] of split()) this.emitFile({type: 'asset', fileName: `fighters/pose-atlas/${name}`, source});
    },
  };
}

/** `<package version>+<short commit>` for feedback notes (src/feedback.ts): CI's GITHUB_SHA, else git, else `dev`. */
function buildId(): string {
  const version = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version as string;
  let commit = (process.env.GITHUB_SHA ?? '').slice(0, 7);
  if (!commit) {
    try {
      commit = execSync('git rev-parse --short HEAD', {cwd: fileURLToPath(new URL('.', import.meta.url)), stdio: ['ignore', 'pipe', 'ignore']}).toString().trim();
    } catch {
      commit = '';
    }
  }
  return `${version}+${commit || 'dev'}`;
}

export default defineConfig({
  base: './',
  define: {__BUILD_ID__: JSON.stringify(buildId())},
  plugins: [poseAtlasSplit()],
  test: {include: ['tests/**/*.test.ts'], environment: 'node'},
  optimizeDeps: {entries: ['index.html']},
  server: {
    // The retained art sources, QA evidence and runtime frame library contain
    // tens of thousands of files. Watch application code, not this static
    // archive. Restart Vite after adding public files so its public-file index
    // includes them; reload the page after changing existing sprite assets.
    watch: {ignored: ['**/art/**', '**/docs/**', '**/public/**']},
  },
});
