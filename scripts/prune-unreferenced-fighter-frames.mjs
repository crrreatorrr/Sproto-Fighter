#!/usr/bin/env node
// Lists, and with --delete removes, fighter frame PNGs that nothing uses.
//
//   node scripts/prune-unreferenced-fighter-frames.mjs           dry run: list and count
//   node scripts/prune-unreferenced-fighter-frames.mjs --list    also print every file
//   node scripts/prune-unreferenced-fighter-frames.mjs --delete  remove them from public/
//
// A file under public/fighters/{poses,events,motion,identity,walk,assist}/ is
// kept when
// - any string in public/fighters/pose-atlas.json names it;
// - src/, scripts/ or tests/ names it, or a JSON file that they read does (for
//   example the reviewed source hashes in art/identity-actions/audit.json or
//   art/movement-followup-20261102/*/review.json, or the recorded fixtures under
//   docs/evidence/movement-followup-20261102/);
// - it sits in a folder that an authoring or repair script under art/ names
//   (such a script reads its own sources there).
// Everything else is a superseded backup, a numbered duplicate of a named frame,
// or an orphaned body the installers removed from the manifest.
//
// Before deleting it proves every body of every playable fighter (and of its
// Team Special partner) is still in the manifest with all of its frames on disk.
import { existsSync, readdirSync, readFileSync, statSync, unlinkSync, rmdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadCore, read } from './lib/load.mjs';

const root = new URL('..', import.meta.url).pathname;
const DIRS = ['poses', 'events', 'motion', 'identity', 'walk', 'assist'];
const manifest = JSON.parse(read('public/fighters/pose-atlas.json'));

const referenced = new Set();
const toPublic = url => url.startsWith('/') ? url.replace(/^\/+/, '') : 'fighters/' + url;
(function walk(value) {
  if (typeof value === 'string') { if (/\.png(\?|$)/.test(value)) referenced.add(toPublic(value.split('?')[0])); }
  else if (Array.isArray(value)) value.forEach(walk);
  else if (value && typeof value === 'object') Object.values(value).forEach(walk);
})(manifest);
const manifestFrames = new Set(referenced);

const gitGrep = (pattern, paths) => {
  try { return execFileSync('git', ['grep', '-I', '-h', '-o', '-E', pattern, '--', ...paths], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter(Boolean); }
  catch (error) { if (error.status === 1) return []; throw error; }
};
const FRAME = 'fighters/(' + DIRS.join('|') + ')/[A-Za-z0-9_./-]+\\.png';
// JSON files the checks read, by the paths written in them (globbed reads such as
// art/*/review.json are covered by naming the directories below too).
const checkedJson = new Set(gitGrep('(art|docs/evidence)/[A-Za-z0-9_./-]+\\.json', ['src', 'scripts', 'tests']));
const checkedPaths = ['src', 'scripts', 'tests', 'docs/evidence/movement-followup-20261102', 'art/movement-followup-20261102', ...[...checkedJson].filter(p => existsSync(join(root, p)))];
for (const f of gitGrep(FRAME, checkedPaths)) referenced.add(f.replace(/^.*?(fighters\/)/, '$1'));

// Folders that a script names directly, e.g. art/scale-consistency-20261102/build_repairs.py
// reading public/fighters/poses/bront/. Their files stay even when unreferenced.
const scriptText = gitGrep('fighters/(' + DIRS.join('|') + ')/[A-Za-z0-9_.-]+', ['src', 'scripts', 'tests', 'art/**/*.py', 'art/**/*.mjs', 'art/**/*.ts', 'art/**/*.js']);
const scriptFolders = new Set(scriptText.map(p => 'public/' + p.replace(/\.png$/, '').split('/').slice(0, 3).join('/')));
// A folder named only by a frame file (fighters/poses/x/00.png) still protects the folder;
// the referenced frames themselves are already in the manifest set.

const files = [];
const walkDir = dir => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, e.name); if (e.isDirectory()) walkDir(p); else files.push(relative(join(root, 'public'), p)); } };
for (const d of DIRS) if (existsSync(join(root, 'public/fighters', d))) walkDir(join(root, 'public/fighters', d));

const unreferenced = [], protectedByScript = [];
for (const f of files) {
  if (referenced.has(f)) continue;
  const folder = 'public/' + f.split('/').slice(0, 3).join('/');
  (scriptFolders.has(folder) ? protectedByScript : unreferenced).push(f);
}

// Every playable body is in the manifest with every frame on disk.
const core = await loadCore();
const bodies = new Set(core.PLAYABLE_FIGHTERS.flatMap(id => [...core.bodyAtlasIds(id), ...core.specialPartnerIds(id).flatMap(core.bodyAtlasIds)]));
const problems = [];
for (const id of bodies) if (!manifest.fighters[id]) problems.push(`body missing from manifest: ${id}`);
for (const f of manifestFrames) if (!existsSync(join(root, 'public', f))) problems.push(`manifest frame missing: ${f}`);
const removing = new Set(unreferenced);
for (const f of referenced) if (removing.has(f)) problems.push(`would remove a referenced frame: ${f}`);
if (problems.length) { console.error(problems.slice(0, 40).join('\n')); process.exit(1); }

const bytes = unreferenced.reduce((n, f) => n + statSync(join(root, 'public', f)).size, 0);
const byFolder = new Map();
for (const f of unreferenced) { const k = f.split('/').slice(0, 3).join('/'); byFolder.set(k, (byFolder.get(k) ?? 0) + 1); }
console.log(`${files.length} frame files, ${referenced.size} referenced by the manifest or a check; ${bodies.size} playable bodies all present.`);
console.log(`${unreferenced.length} unreferenced (${(bytes / 1e6).toFixed(1)} MB) in ${byFolder.size} folders; ${protectedByScript.length} more kept because a script names their folder.`);
for (const [k, n] of [...byFolder].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${k}`);

if (process.argv.includes('--list')) for (const f of unreferenced.sort()) console.log('    ' + f);
if (process.argv.includes('--delete')) {
  for (const f of unreferenced) unlinkSync(join(root, 'public', f));
  // Remove folders the deletion emptied.
  const dirs = [...new Set(unreferenced.map(f => join(root, 'public', f, '..')))].sort((a, b) => b.length - a.length);
  for (let dir of dirs) {
    while (dir.startsWith(join(root, 'public/fighters/')) && existsSync(dir) && !readdirSync(dir).length) { rmdirSync(dir); dir = join(dir, '..'); }
  }
  console.log(`deleted ${unreferenced.length} files`);
}
