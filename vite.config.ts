import {execSync} from 'node:child_process';
import {existsSync, readFileSync, readdirSync, rmSync, statSync} from 'node:fs';
import {isAbsolute, join} from 'node:path';
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

/**
 * Files under public/ that checks and authoring scripts read but the game never
 * requests. They stay in the repository; this keeps Vite's public-folder copy
 * from shipping them in dist/. Paths are relative to public/; a trailing `*.ext`
 * matches every file with that extension directly in the folder.
 * scripts/dist-content-check.mjs proves the build still has every runtime file.
 */
export const DIST_EXCLUDE = [
  // Superseded campaign maps; src/campaignMap.ts loads only campaign-map-250.webp.
  // campaign-map-smoke keeps the originals in the repository.
  'story/campaign-map.webp',
  'story/campaign-map-expanded.webp',
  // Shipped but never played (src/combatSfx.ts), and the clip inventory tests read.
  'audio/sfx/combat/ko_02.mp3',
  'audio/sfx/combat/manifest.csv',
  // Loop metadata read by tests/audio-events.test.ts; the player has its own constants.
  'audio/music/*.json',
  // Source hashes and approval lists read by the image and stage checks.
  'portraits/manifest.json',
  'stages/previews/manifest.json',
  'stages/nov04/manifest.json',
  'stages/variations-v2/manifest.json',
];

function distExclude(patterns: readonly string[]): Plugin {
  let outDir = 'dist';
  return {
    name: 'dist-exclude',
    apply: 'build',
    configResolved(config) { outDir = config.build.outDir; },
    closeBundle() {
      const root = fileURLToPath(new URL('.', import.meta.url));
      const out = isAbsolute(outDir) ? outDir : join(root, outDir);
      for (const pattern of patterns) {
        const wild = /^(.*)\/\*(\.[\w]+)$/.exec(pattern);
        const targets = wild
          ? (existsSync(join(out, wild[1])) ? readdirSync(join(out, wild[1])).filter(f => f.endsWith(wild[2])).map(f => join(wild[1], f)) : [])
          : [pattern];
        for (const target of targets) rmSync(join(out, target), {force: true});
      }
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
  plugins: [poseAtlasSplit(), distExclude(DIST_EXCLUDE)],
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
