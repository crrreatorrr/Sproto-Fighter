import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Online play needs every browser to compute the same game, and art changes
 * (sprite sheets, trimming, new fighter frames) must never be able to change it.
 * So the sim, the netcode and core.ts may only import each other: never a
 * rendering, art-loading or UI module.
 */
const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const allowed = (file: string) => {
  const rel = relative(src, file);
  return rel === 'core.ts' || rel.startsWith('sim/') || rel.startsWith('net/');
};
const roots = [join(src, 'core.ts'), ...['sim', 'net'].flatMap(dir => readdirSync(join(src, dir)).filter(f => f.endsWith('.ts')).map(f => join(src, dir, f)))];

function resolve(from: string, spec: string): string {
  const base = join(dirname(from), spec);
  for (const candidate of [base, base + '.ts', join(base, 'index.ts')]) if (existsSync(candidate) && candidate.match(/\.(ts|json)$/)) return candidate;
  throw new Error(`${relative(src, from)}: cannot resolve ${spec}`);
}

describe('sim and netcode isolation', () => {
  it('reach only sim, net and core modules through relative imports', () => {
    const seen = new Set<string>(), queue = [...roots], violations: string[] = [];
    while (queue.length) {
      const file = queue.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      if (!file.endsWith('.ts')) continue;
      for (const [, spec] of readFileSync(file, 'utf8').matchAll(/(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
        const target = resolve(file, spec);
        if (!allowed(target)) violations.push(`${relative(src, file)} imports ${relative(src, target)}`);
        else queue.push(target);
      }
    }
    expect(violations).toEqual([]);
    expect(seen.size).toBeGreaterThan(10);
  });
});
