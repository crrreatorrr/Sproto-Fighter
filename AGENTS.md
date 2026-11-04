# Sproto Arena

A TypeScript and Canvas 2D fighting game with no engine. The repo is named Sproto Fighter. Start with
`README.md` and `docs/README.md`: most files in `docs/` are dated reports, so use the index to find
what is current.

- The hub runs the same combat simulation for online matches. After simulation changes, refresh the
  hub's bundle as described in the README's hub notes.
- `vendor/hub-sdk` comes from `metaverse-hub`. Follow `vendor/hub-sdk/VENDOR.md` to update it.
- The repo is large. See the README and `.github/ci-checkout-paths.txt` for the narrow checkout.

## Checks

```bash
npm run check
npm run test:fast
npm run build
```

`npm run test:all` adds the three slow roster-wide audits. CI runs the full set.

## Working with other agents

Claude Code, Codex, Cursor and Grok Bot all work on this repo.

- Start each task on its own branch from the latest `main`, named `<agent>/<slug>`. Never push to
  `main`; open a pull request.
- On the owner's machine, `agent-task new Sproto-Fighter <slug> --agent <name>` creates that branch in
  its own worktree.
- Don't edit files that another active task is changing.
- Run the checks before opening a pull request, and report any you could not run.
- A different agent reviews the work: `agent-task review <path>`, or `/codex:adversarial-review` in
  Claude Code.
