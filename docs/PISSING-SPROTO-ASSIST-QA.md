# Pissing Sproto partner update — November 2, 2026

Sproto #3152 is now named **Pissing Sproto** in the roster, selection screen and team-special banner. It is the special partner for 34 single-body folder Sprotos, including #2322. Its own partner is #2322. The exact partner list is recorded in `art/sprotos-expansion/user-requirements.json` under `pissingSprotoPartners`.

Higgsfield GPT Image 2.5 Sunburst generated 32 additional complete-body drawings: six entrance frames, 16 attack frames, six retreat frames and four celebration frames. The existing playable art and pelvic-origin ranged attack remain available. The celebration drawings also play when Pissing Sproto wins a round.

Partners enter, plant their feet, attack on the lead fighter's contact beats and retreat. A yellow pixel stream starts at the partner's covered pelvis, in the current facing direction. The helper shares the lead fighter's existing special damage schedule; drawing it adds no independent damage or health slot. Placement chooses an available side at a wall and keeps that side through the attack. Selected fighters load their actual partner's new art through the existing bounded loader. The selection hint names the special partner.

Passed: production build/TypeScript; full gameplay QA (510 per-fighter cases across 102 mechanical profiles, plus movement, reactions, throws and story checks); 204 dedicated assist/facing/wall scenarios; #2322's exactly four scheduled damage contacts; unchanged simulation state during rendering; partner lazy loading; four complete new clip lengths; 21 expansion and 12 event-clip groups; hard-alpha, dimensions, padding and asset paths (9,096 frame entries across 118 body atlases).

Browser verification used the actual combat core and match renderer with a clearly labelled three-pip QA fixture. #2322's right- and left-facing contacts were inspected, including the partner name, visible entrance/attack, pelvic stream anchor and target damage. A screenshot is saved in the current chat's outputs. The fixture is `art/pissing-assist-lab.html`; it does not change normal-game charging rules. Automated checks do not certify every artistic in-between.

Reproducible source: `art/sprotos-expansion/pissing-assist/request.json`, retained job ID/source marker, normalized frames and targeted installer. The central installer also preserves the partner links and additional clips on rebuild. No deployment, commit or push was performed.
