// Online duel in real browsers against a running hub: two Chromium pages, each
// logged in as a different hub player, queue for a 10-Ticket wager, connect
// over WebRTC, play (the CPU drives each side via ?autoplay), and show the
// hub's verdict, then both press Rematch and play again. Checks the direct link,
// the result screens and the balances.
//   NAKAMA_URL=http://127.0.0.1:7350 HUB_DATABASE_URL=postgres://... node scripts/online-browser-smoke.mjs
// Skipped without NAKAMA_URL, HUB_DATABASE_URL or a Playwright Chromium.
// CHROME_PATH selects an installed Chromium. ONLINE_EXPECT_LINK=relay checks
// the relay path explicitly; the default still requires direct WebRTC.
// ONLINE_TEST_EXPERIMENT_FLAGS=1 verifies local rule flags stay disabled online.
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const base = process.env.NAKAMA_URL, db = process.env.HUB_DATABASE_URL;
const expectedLink = process.env.ONLINE_EXPECT_LINK ?? 'direct';
assert.ok(['direct', 'relay'].includes(expectedLink), 'ONLINE_EXPECT_LINK must be direct or relay');
if (!base || !db) { console.log('SKIP: set NAKAMA_URL and HUB_DATABASE_URL.'); process.exit(0); }
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('SKIP: playwright not installed.'); process.exit(0); }
const sql = q => execFileSync('psql', [db, '-tAc', q], { encoding: 'utf8' }).trim();

async function player() {
  const r = await fetch(`${base}/v2/account/authenticate/device?create=true`, { method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from('defaultkey:').toString('base64'), 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'sproto-browser-' + randomUUID() }) }).then(r => r.json());
  const id = JSON.parse(Buffer.from(r.token.split('.')[1], 'base64url').toString()).uid;
  sql(`INSERT INTO game.tickets_balance VALUES ('${id}','sproto-fighter',50) ON CONFLICT (user_id, game_id) DO UPDATE SET balance=50`);
  for (let i = 0; i < 3; i++) sql(`INSERT INTO game.tickets_ledger (event_id,user_id,game_id,delta,balance_after,reason,kind) VALUES (gen_random_uuid(),'${id}','sproto-fighter',0,50,'fighter_win','earn')`);
  return { id, token: r.token };
}
const balance = id => Number(sql(`SELECT balance FROM game.tickets_balance WHERE user_id='${id}' AND game_id='sproto-fighter'`));

const port = 5300 + Math.floor(Math.random() * 300);
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'ignore' });
let browser;
try {
  for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${port}/`); break; } catch { await new Promise(r => setTimeout(r, 500)); } }
  browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const players = [await player(), await player()];
  const pages = await Promise.all(players.map(async (p, i) => {
    const page = await (await browser.newContext()).newPage();
    page.errors = [];
    page.on('pageerror', e => page.errors.push(String(e)));
    await page.addInitScript(([token, id]) => sessionStorage.setItem('hub:sproto-fighter:session', JSON.stringify({ game: 'sproto-fighter', playerId: id, ranked: false, sid: id, token, effects: {}, relics: [], ticketsCapLeft: 0 })), [p.token, p.id]);
    const query = process.env.ONLINE_TEST_EXPERIMENT_FLAGS ? '?autoplay&matchDepth&training' : '?autoplay';
    await page.goto(`http://127.0.0.1:${port}/${query}`, { waitUntil: 'load' });
    await page.waitForFunction(() => !document.getElementById('start')?.hasAttribute('disabled'), null, { timeout: 60000 });
    // Different fighters, so the two CPUs don't mirror each other into a double KO.
    if (i === 1) await page.click('.portrait-choice[data-fighter="bront"]');
    await page.selectOption('#mode', 'online-wager');
    await page.click('#start-fight');
    return page;
  }));
  // Both queue; the matchmaker pairs them (it runs every 15 s or so).
  let sawDirect = false, sawRelay = false;
  const deadline = Date.now() + 150000;
  const titles = () => Promise.all(pages.map(p => p.$eval('#overlay-title', e => e.closest('#overlay').hidden ? '' : e.textContent)));
  while (Date.now() < deadline) {
    const status = await Promise.all(pages.map(p => p.$eval('#device', e => e.textContent)));
    if (status.every(s => s.startsWith('DIRECT'))) sawDirect = true;
    if (status.every(s => s.startsWith('RELAY'))) sawRelay = true;
    const t = await titles();
    const copies = await Promise.all(pages.map(p => p.$eval('#overlay-copy', e => e.textContent)));
    if (t.every(x => /You win|You lose|Double/.test(x)) && copies.every(c => !c.startsWith('Waiting'))) break;
    await new Promise(r => setTimeout(r, 500));
  }
  const final = await titles(), copies = await Promise.all(pages.map(p => p.$eval('#overlay-copy', e => e.textContent)));
  console.log('  results:', final.map((t, i) => `${t} ${copies[i]}`).join(' | '));
  assert.ok(final.every(x => /You win|You lose|Double/.test(x)), 'both pages reached a result');
  assert.ok(expectedLink === 'direct' ? sawDirect : sawRelay, `players connected over the requested ${expectedLink} transport`);
  for (const page of pages) assert.equal(await page.evaluate(() => window.neonRelay.snapshot().matchDepth), undefined, 'local experimental round rules stay disabled online');
  const balances = players.map(p => balance(p.id));
  const winner = final.findIndex(t => t.startsWith('You win'));
  if (winner >= 0) {
    assert.deepEqual(final.map(t => t.startsWith('You win')), [winner === 0, winner === 1], 'exactly one winner, and the pages agree');
    assert.equal(balances[winner], 60); assert.equal(balances[1 - winner], 40);
    assert.match(copies[winner], /\+10 Tickets/); assert.match(copies[1 - winner], /−10 Tickets/);
  } else {
    assert.deepEqual(balances, [50, 50], 'double KO refunds');
  }
  // Both press Rematch: the matchmaker pairs only these two again (tagged with the last match id).
  assert.ok((await Promise.all(pages.map(p => p.$eval('#start', e => e.textContent)))).every(x => x.startsWith('Rematch')), 'result screens offer a rematch');
  await Promise.all(pages.map(p => p.click('#start')));
  const rematchDeadline = Date.now() + 150000;
  let rematched = false;
  while (Date.now() < rematchDeadline) {
    const t = await titles();
    if (t.every(x => x === '' || /^(You win|You lose|Double)/.test(x)) && t.some(x => x === '')) rematched = true;
    if (rematched && t.every(x => /You win|You lose|Double/.test(x))) {
      const c = await Promise.all(pages.map(p => p.$eval('#overlay-copy', e => e.textContent)));
      if (c.every(x => !x.startsWith('Waiting'))) break;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  const second = await titles();
  console.log('  rematch:', second.join(' | '));
  assert.ok(rematched && second.every(x => /You win|You lose|Double/.test(x)), 'the same two players were paired again and finished the rematch');
  const after = players.map(p => balance(p.id));
  assert.equal(after[0] + after[1], 100, 'Tickets are conserved across both wagers');
  for (const p of pages) assert.deepEqual(p.errors, [], 'no page errors');
  console.log(`PASS: two browsers matched over ${expectedLink}, showed the hub-verified result, conserved Tickets, kept local round flags disabled, and played a rematch.`);
} finally {
  await browser?.close();
  server.kill();
}
