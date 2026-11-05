#!/usr/bin/env node
// Optional --core-entry points at another checkout for capability testing before integration.
import assert from 'node:assert/strict';
import { loadBalanceCore } from './lib/balance-core.mjs';
import { playMatch, matchSeeds, summarize } from './lib/balance-runner.mjs';
import { parseOptions } from './balance-tournament.mjs';

const at=process.argv.indexOf('--core-entry');
const core=await loadBalanceCore(at<0?{}:{entry:process.argv[at+1]});
assert.equal(parseOptions(['--match-depth']).maxFrames,10800,'optional mode defaults to whole-match cap');
assert.equal(parseOptions(['--match-depth','--max-frames','50']).maxFrames,50,'explicit cap is preserved');
if(typeof core.enableMatchDepth!=='function') {
  assert.throws(()=>playMatch(core,['rivet','vela'],{matchDepth:true}),/optional match rules/);
  console.log('PASS: unsupported optional match rules fail closed; full capability test requires a match-depth core.');
} else {
  const initialSeeds=matchSeeds(20261105,['rivet','vela'],['cpu','cpu'],0);
  const options={matchDepth:true,skill:4,initialSeeds};
  const match=playMatch(core,['rivet','vela'],options);
  assert.equal(match.matchDepth.complete,true,'benchmark continues after intermediate round winners');
  assert.ok(match.rounds.filter(r=>r.complete).length>=2,'best-of-three includes multiple rounds');
  assert.ok(match.matchDepth.wins.some(w=>w===2),'final match winner earns two rounds');
  assert.ok(match.rawWinner!==null,'decisive match result is recorded separately');
  assert.equal(match.rounds.reduce((n,r)=>n+r.frames,0),match.frames,'round durations account for every combat frame');
  const repeated=playMatch(core,['rivet','vela'],options);
  assert.equal(repeated.finalHash,match.finalHash,'multi-round initial seeds reproduce complete state');
  assert.equal(repeated.inputHash,match.inputHash,'multi-round input stream reproduces');
  const capped=playMatch(core,['rivet','vela'],{...options,maxFrames:10});
  assert.equal(capped.rawWinner,null);assert.equal(capped.rawOutcome,'timeout');
  assert.equal(capped.matchDepth.complete,false);assert.equal(capped.rounds.length,1);
  assert.equal(capped.rounds[0].complete,false);assert.equal(capped.rounds[0].outcome,'frame-cap');
  const between=playMatch(core,['rivet','vela'],{...options,maxFrames:match.rounds[0].frames});
  assert.equal(between.rawWinner,null,'an intermediate round winner never becomes a completed match winner at cap');
  assert.equal(between.rawOutcome,'timeout');assert.equal(between.resolution,'round-score');
  const neutral={...core,cpuInput:()=>0};
  const drawn=playMatch(neutral,['rivet','vela'],{...options,maxFrames:7201});
  assert.equal(drawn.matchDepth.complete,false,'drawn timer rounds do not decide a best-of-three match');
  assert.deepEqual(drawn.rounds.map(r=>r.outcome),['timer','timer','frame-cap']);
  assert.equal(drawn.rawWinner,null);assert.equal(drawn.rawOutcome,'timeout');
  const summary=summarize(core,[match,capped]);
  assert.equal(summary.rounds.completed,match.rounds.filter(r=>r.complete).length);
  assert.equal(summary.rounds.partial,1);assert.equal(summary.rawDraws,1);
  console.log(`PASS: optional benchmark records ${match.rounds.length} rounds across ${match.frames} combat frames, completes the match, separates drawn timer rounds from whole-match caps, and reproduces input/state hashes.`);
}
