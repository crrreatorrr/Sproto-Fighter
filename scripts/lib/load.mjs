// Shared loaders for the standalone checks in scripts/.
// The game source is TypeScript with no build step for tests, so each check
// transpiles the modules it needs and imports them from data: URLs.
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const root = new URL('../../', import.meta.url);

/** Read a repository file (path relative to the repository root). */
export const read = (path, encoding = 'utf8') => readFileSync(new URL(path, root), encoding);

/** Transpile one TypeScript source file to an ES module string. */
export const compile = path => ts.transpileModule(read(path), {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;

export const dataUrl = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');

let coreUrl, eventsUrl;
/** src/core.ts as a module. Repeated calls in one process share the same instance. */
export async function loadCore() {
  coreUrl ??= dataUrl(compile('src/core.ts'));
  return import(coreUrl);
}

/**
 * src/poseAtlas.ts wired to the shared core, with fetch and Image replaced by
 * readers of public/ so atlases load in Node. Returns { core, poses, manifest }.
 */
export async function loadPoses() {
  const core = await loadCore();
  eventsUrl ??= dataUrl(compile('src/animationEvents.ts'));
  const poses = await import(dataUrl(compile('src/poseAtlas.ts')
    .replace("from './core'", `from '${coreUrl}'`)
    .replace("from './animationEvents'", `from '${eventsUrl}'`)));
  const manifest = JSON.parse(read('public/fighters/pose-atlas.json'));
  globalThis.fetch = async () => ({ ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => structuredClone(manifest) });
  globalThis.Image = class {
    set src(value) {
      // PNG width/height live at fixed offsets in the IHDR chunk.
      const bytes = readFileSync(new URL('public' + value.split('?')[0], root));
      this.naturalWidth = bytes.readUInt32BE(16);
      this.naturalHeight = bytes.readUInt32BE(20);
      queueMicrotask(() => this.onload());
    }
  };
  return { core, poses, manifest };
}
