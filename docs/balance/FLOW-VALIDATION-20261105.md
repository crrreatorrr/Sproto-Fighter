# Phase 2 flow checkpoint

Dash lock is 20 frames; holding dash and forward continues into a 1.35× run.
Releasing either input, including during hitstop, cancels that run intent.
Medium and launcher jump cancels require actual damage confirmation, not guard
contact. The attack buffer is eight frames. Neutral knockdown is 12 frames;
Down/Up at landing select six/24 frames, followed by six get-up frames.

Template movement now starts at 5.6, with Footwork 6.2 and Brawler 5.2.
Projectile recovery is 18–22 by template; the existing speed/commitment damage
formula is retained, so shorter commitment also reduces projectile damage.
Theo's pinned projectile expectation changes from 48 to 43 damage for this
reason. Historical art fixtures and emitter metadata remain unchanged.

All 116 integrated unit tests, typecheck and build pass. Node and installed
Chromium agree at 100 determinism checkpoints. The paired Normal/Hard report
compares the same schedule with Phase 1; mean bouts rise from 26.20/26.76 to
30.51/31.83 seconds. This measures CPU combat, not human feel or human round
length. The report also records time spent in recovery. Human playtesting,
the broad integrated audits, and three-engine CI remain required.
