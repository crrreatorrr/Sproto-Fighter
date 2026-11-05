# Gameplay Phase 4: CPU and difficulty

The controller exposes skill 1–10, with published Easy/Normal/Hard/Expert anchors at
1/4/7/10. Normal is the free-fight default. Local human versus and online opponents
disable the CPU selector. Practice dummy behavior is preserved.

`cpuInput` is a pure, idempotent read. `step` advances both seats' bounded observation
queues, seeded integer generators, strategic intents and decision timing, even if
both seats are human. Input-only replays therefore reproduce the entire combat
state without calling the CPU. Rollback snapshots retain all controller state.
Directions and attack recognition use delayed observations; blocking remains held
through blockstun. Guard/low choices are sampled once per observed attack, and combo
completion once per combo, so repeated reads do not multiply the published odds.
Throw recognition has a separate three-frame tactile delay to fit Phase 3's
seven-frame tech window. Freeze does not resample an attack or catch.

The installed campaign has 247 encounters and 250 opponents. Its curve normalizes
over `STORY_ENCOUNTERS.length - 1`, smooths within each chapter, adds one skill to
gauntlets and the final fifteen encounters, and caps at ten. It changes decisions,
never health or damage. After three complete encounter losses, a separate button
offers a one-skill reduction for that retry. The normal retry remains available;
intermediate gauntlet victories do not erase encounter-loss streaks. This optional
reduction keeps normal reward eligibility. God Mode behavior is unchanged.

The six transformed boss forms introduced by PR #22 use `stepStoryBoss` and fixed
hazard patterns, not `cpuInput`. This change does not claim a calibrated difficulty
curve for those forms. Reference-bot win-rate targets need a calibrated reference
policy and measured per-encounter reports; parameter anchors alone do not establish
the requested 15–65% outcome curve. No human playtest or feel approval is claimed.

Existing smoke fixtures now swap CPU memories with seats, model the new select's
options, and supply the skill variable when extracting the actual main frame hook.
These preserve the original symmetry, controller and presentation checks.
