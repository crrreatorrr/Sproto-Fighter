# Final integration inventory — 2 November 2026

All identified parallel project threads were idle before final integration.
Local `main` was safely fast-forwarded through preserved snapshot `366c82a2`
to verified integration `e4f45b44`. Final packaging/verification changes are a
following local commit. No remote push was performed. Historical inventory is retained in `archive/`.

| Source | Included revision |
| --- | --- |
| Shared tracked/untracked roster, UI and identity-animation work | `366c82a2` |
| Directional spit | `d3e23605` |
| Persistent progression and testing God Mode | `37777c20` |
| Hatchery/Ranch detail and fighting-lane placement | `07369627` |
| Twin menu sizing | `26418e52` |
| Independent partners including final 13-kit expansion | **`c4263cb8`**, not only `2e67fa4d` |
| Approved 24-scene pack and placement | `5c571f7c` |
| Illustrated 100-node map and story-launch wiring | `d3f583a0` |

Manual resolutions retain story locks/save identities, directional organic
spit, Yannix's beam, final partner assignments, twin preview sizing, newer
entrance/death/cast mappings and stable gait packing. No entire-side conflict
selection discarded the other work.

The shared neon-relay disk was compared to snapshot `366c82a2` again after
parallel work finished: zero modified files and zero extra nonignored files.
The progression checkout's 9,034 untracked project files match the integration
copy. Its only differing extra is the local node_modules dependency link,
which is not project content to overwrite or commit. Other finished feature
worktrees are clean. Their branches and checkouts remain preserved.

Final fixes also address paired dash clipping, narrow-map height, God Mode
restart from a result screen and excessive dev-server watching.
See [CLAUDE-HANDOFF.md](CLAUDE-HANDOFF.md) for exact evidence and limitations.

## Main checkout verified

The authoritative checkout is `/Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay`.
Its original branch tip is preserved as `codex/pre-integration-main-20261102`.
The existing login-session launchd service `com.sprotoarena.local` was restarted
and verified at **http://127.0.0.1:5173/**. Its working directory is this main
checkout. No boot/login startup file was installed. After logout/reboot, use
Play Sproto Arena.command; keep its terminal open when using that launcher.

A final launch caught an accidentally tracked integration node_modules symlink.
It became self-referential on main. The link was removed from Git, the ignore
rule now covers directories and links, and locked dependencies were restored
with npm ci. The offline cache lacked Rollup; standard registry restoration
succeeded. Build, story and selection checks were rerun successfully on main.
No game source or art was removed during this dependency repair.
