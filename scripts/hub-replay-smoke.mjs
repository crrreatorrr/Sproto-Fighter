// Server replay matches the browser: the hub's Nakama runtime (goja) must
// replay match logs to exactly the winner, end frame and state checksum that
// Node (V8) computes. Needs a local hub with SPROTO_DEV_RPCS=1:
//   NAKAMA_URL=http://127.0.0.1:7350 node scripts/hub-replay-smoke.mjs
// Skipped (passes) when NAKAMA_URL is not set.
import assert from 'node:assert/strict';
import { bundle, dataUrl } from './lib/load.mjs';

const base = process.env.NAKAMA_URL;
if (!base) { console.log('SKIP: set NAKAMA_URL to check server replays against a running hub.'); process.exit(0); }
const serverKey = process.env.NAKAMA_SERVER_KEY ?? 'defaultkey';
const net = await import(dataUrl(await bundle('scripts/lib/net-entry.mjs')));
const log = await import(dataUrl(await bundle('src/net/matchLog.ts')));
const { SIM_VERSION } = await import(dataUrl(await bundle('src/net/simVersion.ts')));
const { A, createState, step, cpuInput, hashState } = net;

const auth = await fetch(`${base}/v2/account/authenticate/device?create=true`, {
  method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(serverKey + ':').toString('base64'), 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'sproto-replay-smoke-' + 'x'.repeat(16) }),
}).then(r => r.json());
assert.ok(auth.token, 'device auth: ' + JSON.stringify(auth));

async function serverReplay(matchLog) {
  const r = await fetch(`${base}/v2/rpc/sproto.dev_replay`, { method: 'POST', headers: { Authorization: 'Bearer ' + auth.token, 'Content-Type': 'application/json' }, body: JSON.stringify(JSON.stringify(matchLog)) }).then(r => r.json());
  assert.ok(r.payload, 'rpc: ' + JSON.stringify(r));
  return JSON.parse(r.payload);
}

let total = 0;
for (const [p1, p2, frames] of [['rune', 'guest11', 3600], ['vamp', 'duo', 3600], ['peterpan', 'mox', 3600], ['sproto1601', 'vela', 3600], ['bront', 'zephyr', 7200]]) {
  // Two CPUs fight, so the log is a realistic match that usually ends in a KO.
  const s = createState(p1, 'versus', p2), pairs = [];
  for (let f = 0; f < frames && s.winner === null; f++) { const pair = [cpuInput(s, 0), cpuInput(s, 1)]; pairs.push(pair); step(s, pair); }
  const matchLog = { v: 1, sim: SIM_VERSION, fighters: [p1, p2], frames: pairs.length, inputs: log.encodeInputs(pairs) };
  const local = log.replayMatch(matchLog);
  assert.equal(local.hash, hashState(s), 'local replay equals live play');
  const remote = await serverReplay(matchLog);
  assert.equal(remote.sim, SIM_VERSION, 'server embeds the same simulation');
  assert.deepEqual(remote.result, { ok: true, ...local }, `${p1} vs ${p2}: server replay equals browser`);
  console.log(`PASS: ${p1} vs ${p2}: ${pairs.length} frames, winner ${local.winner}, ${matchLog.inputs.length} B log, server ${remote.ms} ms`);
  total++;
}
const bad = await serverReplay({ v: 1, sim: 'other', fighters: ['rune', 'vela'], frames: 0, inputs: '' });
assert.deepEqual(bad.result, { ok: false, error: 'sim_mismatch' });
const forged = await serverReplay({ v: 1, sim: SIM_VERSION, fighters: ['rune', 'vela'], frames: 5, inputs: '!!!!' });
assert.deepEqual(forged.result, { ok: false, error: 'malformed_inputs' });
console.log(`${total} server replays match; bad logs rejected.`);
