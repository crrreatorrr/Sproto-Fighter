# Online multiplayer plan

Status: plan only (3 November 2026). Nothing here is implemented yet except
where marked **done**. Goal: online 1v1 that feels as good as playing on one
machine. That means rollback netcode, no visible stutter, fast matchmaking,
and results the server can trust.

## Where we start

Already in place:

- **Deterministic simulation (done).** `src/sim/` has no DOM, clock or
  randomness. `Math.sin` and `Math.hypot` were replaced with exact equivalents.
  `scripts/determinism-smoke.mjs` compares state checksums from Node and every
  installed browser engine; CI requires Chromium, Firefox and WebKit to match.
- **Symmetric players (done).** `cpuInput(s, slot)` works for either side,
  `Mode` has `'versus'`, and local two-player works with per-player keyboard
  and controller mappings.
- **Input-only state changes (done).** `main.ts` changes the game only through
  `step(state, [p1, p2])`; inputs are 12-bit masks per frame.
- **Checksum (done).** `hashState()` (FNV-1a over the state JSON).

Measured in Chromium on a production-like page (headless):

| Cost | Value | What it means |
| --- | --- | --- |
| One simulation step | 6.5 µs | An 8-frame rollback re-simulates in about 60 µs |
| Copy of the state | 8.4 µs (JSON) | Saving a snapshot every frame is negligible |
| `hashState()` | 12.7 µs | Fine every 30 frames; too costly to send every frame |
| State size | about 1.3 KB | Small enough to send as a resync |
| Whole frame (update + draw) | 0.8 ms median, 1.2 ms p95 | Far under the 16.7 ms frame budget |
| Assets for one match | about 7 MB, 385 requests | The real bottleneck when two players are waiting |

The simulation is not the performance risk. The risks are presentation
during rollback, network jitter, background tabs and asset loading.

## Architecture

```
 browser A                                   browser B
 ┌──────────────────────────────┐            ┌──────────────────────────────┐
 │ input sampler (rAF)          │            │ input sampler (rAF)          │
 │   │ local input, frame N+d   │  WebRTC    │   │                          │
 │ rollback session ────────────┼─unreliable─┼─► rollback session           │
 │   │ step() / restore()       │  datachan. │   │                          │
 │ src/sim (deterministic)      │            │ src/sim                      │
 │   │ confirmed events         │            │   │                          │
 │ renderer + audio (pure)      │            │ renderer + audio             │
 └──────────────┬───────────────┘            └──────────────┬───────────────┘
                │   matchmaking, signaling, results          │
                └──────────────► Nakama (existing hub) ◄─────┘
                                 TURN relay for strict NATs
                                 result check: replay inputs through src/sim
                                 wager escrow: hold 10 each, settle 20 to winner
```

## Phase A — Make presentation rollback-safe

Required before rollback. Without it, rewinding causes repeated sounds,
repeated notices and walk-cycle jumps.

1. **Events instead of state for presentation.** Move `notice`, `noticeLife`
   and `effects` out of `CombatState`. Have `step()` return an event list
   (`hit`, `block`, `ko`, `comboCharged`, `special`, `callout`). The
   presentation plays events only once a frame is *confirmed*: both players'
   real inputs are known. `main.ts`'s diffing of moves for Michael's callout
   becomes an event. A smaller state also means cheaper snapshots.
2. **Pure rendering.** `poseAtlas.ts` keeps per-fighter history in WeakMaps
   (`playback`: travel, landedAt, idleSince; `duos`; `assistStarts`). Move
   what animation needs into the sim state (or derive it from `frame` and the
   state), and key remaining caches by slot instead of object identity. Test:
   render frame N, roll back to N-8, re-simulate, render N again; both draws
   must match draw-call for draw-call.
3. **Snapshots.** `saveState()` / `loadState()` into a preallocated 16-slot
   ring buffer, using a typed field-by-field copy instead of JSON (target
   below 2 µs).

Done when: a scripted rollback test (predict wrong, correct 1–8 frames later)
produces the same events, sounds and draw calls as playing without rollback.

## Phase B — Rollback session (no network yet)

`src/net/rollback.ts`, independent of transport:

- Input queues per player; predict a missing remote input by repeating its
  last known input (fighting-game standard).
- When a remote input for frame F arrives and differs from the prediction:
  restore snapshot F, re-simulate to the current frame, keep going. At most
  8 frames of rollback; beyond that, pause and wait (no runaway rollback).
- **Input delay** 1–3 frames, chosen from measured round-trip time
  (`delay = clamp(round(rtt/2 / 16.7ms) - rollbackBudget, 1, 3)`); fixed
  for the match so play feels consistent.
- **Time sync.** Each side reports its frame advantage. The side running
  ahead slows by one frame every few seconds, so neither player carries all
  the rollbacks.
- **Desync detection.** Exchange `hashState()` of a confirmed frame every 30
  frames. On a mismatch, log both input histories and end the match cleanly
  with "Connection out of sync". Never let a desynced match keep running.

Testing: a fake transport in Node with configurable latency, jitter and loss
runs two sessions side by side. They must reach identical checksums for
every matchup in `determinism-scenario.mjs` at 0–200 ms latency, 0–20%
loss, and out-of-order delivery.

## Phase C — Transport and match flow

- **Peer to peer over WebRTC**, data channel `{ ordered: false,
  maxRetransmits: 0 }`. Each packet carries the last 8 unacknowledged input
  frames (2 bytes each) plus an ack and frame-advantage byte. That's about
  25 bytes at 60 Hz (~1.5 KB/s), and a lost packet costs nothing.
- **Signaling and matchmaking through Nakama**, already part of the hub stack:
  matchmaker tickets, then exchange SDP/ICE over the realtime socket.
- **TURN.** About 10–20% of player pairs cannot connect directly. Run coturn
  (or a managed TURN service) next to Nakama. If WebRTC fails, Nakama relayed
  matches over WebSocket are a last resort (higher, burstier latency).
- **Compatibility handshake.** Both sides send a build fingerprint: a hash of
  `bundledCore()` output plus the pose-atlas revision and stage list. A
  mismatch stops the match before it starts ("Update to play this opponent").
- **Match flow.** Lobby, then synced character/stage select, then versus
  screen with both clients preloading, then a countdown started on a shared
  frame number, then the fight, then the result and a rematch offer.
  Disconnects: 10-second reconnect window, then a forfeit.
- **Background tabs.** Browsers throttle `requestAnimationFrame` in hidden
  tabs. During an online match, run input exchange and the simulation clock
  from a Worker timer when hidden, or treat hiding as a pause request.
  Otherwise the other player sees the match freeze.

## Phase D — Loading so nobody waits

A match currently pulls about 385 separate pose PNGs (about 7 MB) when it
starts. Online, the slower player's download delays both.

- **Preload during select.** Start `ensurePoseAtlases` for both fighters and
  the stage when each choice is *confirmed*, not on "Start". The versus
  screen waits for both clients' "ready" message.
- **Sprite sheets per body.** Pack each body's frames into one or two sheets
  at build time and slice them with `createImageBitmap`: 385 requests become
  about 8. Lossless WebP saves about another 26% (measured on High Sproto).
  The build would then need an image step (Pillow or sharp), which
  `scripts/build-images.py` already sets up for portraits and stage previews.
- **Cache across matches.** Raise the 16-body atlas cache, and keep decoded
  bitmaps for the player's own fighter between matches.

## Phase E — Trust and rewards

- Online results are reported by **both** clients with the full input log
  (about 2 bytes × frames × 2 players; 5 minutes ≈ 36 KB).
- The server replays the log through `src/sim` (it has no DOM dependencies)
  and grants Tickets and Relics only for the replayed winner. Start
  asynchronously after the match, so server speed doesn't matter. Nakama's
  TypeScript runtime or a small Node worker can run it.
- Input logs also give replays and spectating almost for free.

## Phase F — Ticket wagers (10 Tickets per match)

Every online match is played for Tickets: each player stakes **10 Tickets**,
the winner takes the 20-Ticket pot (net +10), the loser loses their 10. The
stake is fixed; there is no wager-size choice.

**Scope.** Online matches between two hub-linked players only. CPU matches
keep today's reward (+20 for a win against the CPU, no stake). Local versus
has no wager: both players share one hub account. Practice and God Mode never
touch Tickets.

**The server holds the money; the client never moves Tickets.** The current
SDK can only earn (capped at 200 per session and 1,000 per day), spend or
sell in shops, and exchange. A wager needs new server RPCs in the hub
(the metaverse-hub repository, not this one), all idempotent by match ID:

| RPC | When | What it does |
| --- | --- | --- |
| `wager.hold` | Match formed, before the versus screen | Moves 10 Tickets from each player into an escrow record `{matchId, players, stake: 10, status: 'held'}`. If either player can't cover it, the match is cancelled and the other player's hold is returned. |
| `wager.settle` | After the server verifies the result (Phase E) | Pays the 20-Ticket pot to the replayed winner and closes the record. A transfer out of escrow, not new Tickets, so it doesn't count against the earn caps. |
| `wager.refund` | Draw, desync, unverifiable result, match never started, server-side expiry | Returns 10 to each player and closes the record. |

**Outcomes:**

| What happened | Tickets |
| --- | --- |
| A wins, both logs replay to A | A +20 from the pot (net +10), B net −10 |
| Double KO | Refund both |
| Desync detected (Phase B checksums) | Refund both |
| Logs disagree or don't replay to a result | Refund both, flag the pair for review |
| Disconnect before the first fight frame | Refund both |
| Disconnect mid-fight, no reconnect within 10 s | Disconnected player forfeits; the other player wins the pot |
| Record still `held` after 15 minutes | Server job refunds both |

**Matchmaking.** Players queue explicitly for a wagered match, so nobody stakes
Tickets by accident. Queueing needs a balance of at least 10, checked again
by `wager.hold`. Rematches carry the wager only after both players confirm
again.

**Client UI (this repo):**
- Queue button "Fight for 10 Tickets" showing the current balance.
- Versus screen: both crests with "10" under each and "20 at stake".
- Result screen: "+20 Tickets" or "−10 Tickets", and "Pending verification"
  until `wager.settle` confirms. The client shows the server's result only.
- Wager history in Settings, from the server's records.
- SDK: new `queueWagerMatch` and `wagerStatus(matchId)`, retried through the
  SDK's existing outbox like other economy calls.

**Abuse limits.** A wager moves Tickets but never creates them, so the risk is
funnelling: alt accounts losing on purpose to a main account.
- At most 5 wagered matches per pair of players per day.
- A daily cap on net Tickets won from wagers.
- New accounts can't wager until they've played a number of CPU matches.
- Flag pairs with one-sided records or very short matches.

**Ticket value (decided).** The owner confirmed on 3 November 2026 that
Tickets have no real-money value: they can't be bought with money or cashed
out. Wagering them is play-currency only, so no gambling gating is planned.
If Tickets ever become purchasable, or exchangeable for anything with cash
value, revisit this before wagers stay on.

**Tests.**
- Server: hold, settle and refund are idempotent, and a match can't be
  settled twice.
- Server: a crash between hold and settle ends in a refund by the expiry job.
- Server: an insufficient balance on one side refunds the other.
- Client: against a fake hub, the result screen shows only the
  server-confirmed amount.

**Depends on:** Phase C (matchmaking and match IDs) and Phase E (server-
verified results). **Wagers must not pay out without Phase E**: otherwise a
client could report a false win and take the pot.

## Phase G — Feel and polish

- Network quality indicator (ping, rollback frames) on the HUD; an optional
  input-delay override in Settings.
- Rematch and quick-search; region-based matchmaking.
- Ranked play only after Phase E is in place.

## Ordering and estimates

| Phase | Effort | Depends on |
| --- | --- | --- |
| A Rollback-safe presentation | Medium–large (events refactor + pose playback) | — |
| B Rollback session + fake-network tests | Medium | A |
| C WebRTC, Nakama signaling, TURN, match flow | Large (includes server work) | B |
| D Preloading, sprite sheets | Medium | can run in parallel with A–C |
| E Server-verified results | Medium | C |
| F Ticket wagers (hub RPCs, escrow, UI) | Medium (mostly hub server work) | C, E |
| G Polish | Ongoing | C |

The first playable online match needs A + B + C. D determines whether it feels
good on ordinary connections. Wagers (F) need E first.

## Risks

- **Hidden nondeterminism.** Any future `Math.random`, `Date`, transcendental
  math, or iteration over a `Map`/`Set` built in non-deterministic order inside
  `src/sim` breaks netplay. The determinism check in CI guards this; keep
  `src/sim` free of DOM and clock access.
- **Content changes.** Rebalancing a fighter changes the simulation, and with
  it the build fingerprint. Old and new clients cannot play each other, which
  is what we want.
- **Animation purity.** Phase A step 2 is the largest unknown: `poseAtlas.ts`
  is about 50 KB of animation logic built around incremental history.
