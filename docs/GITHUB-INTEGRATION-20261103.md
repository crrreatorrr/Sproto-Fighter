# GitHub integration preparation — 3 November 2026

After the completed local integration, the user explicitly requested merging everything onto GitHub main too. The verified destination is the existing public `crrreatorrr/Sproto-Fighter` repository; the active GitHub CLI identity is `crrreatorrr` with admin permission. This is a source publication, not an external game deployment.

## History reconciliation

GitHub's initial export history is separate from the full local development history. The reviewed published heads were `f1c43bac` (main), `4f3b59e` (Claude hub integration), and `bad4b352` (older twin fixes). The hub changes were already adapted and tested on the newer local game; the older twin behavior was already incorporated/superseded. Runtime files present only remotely: none. Another 140 historical remote documentation/evidence files were restored without overwriting any current file.

The final ancestry reconciliation retains the verified current implementation, both published development histories and all local history. No force push is required or intended. A temporary transfer branch allows large assets to be uploaded incrementally before main is advanced. The partial transfer branch is not a playable delivery checkpoint.

## Size and scanning

- The reviewed local history contained 66 commits and 29,152 unique blobs (7.21 GB uncompressed); 5,179 text blobs were scanned for private keys, GitHub/cloud/API tokens, JWTs, credential-bearing URLs and high-confidence secret assignments. No matches were found. This is a pattern-based scan, not proof that arbitrary private content can never be present.
- No tracked file in that history exceeded GitHub's 100 MiB object limit; the largest was about 21.4 MB.
- The current tree included approximately 7 GB of unique files, predominantly original/generated source art and QA evidence. All tracked project content is retained. Dependency caches, ignored environments and untracked working data are excluded.
- GitHub limits each push to 2 GiB. Asset-transfer commits stay below that limit; the final main push then transfers the remaining history. This follows GitHub's documented incremental-upload approach without rewriting existing branches: https://docs.github.com/en/get-started/using-git/troubleshooting-the-2-gb-push-limit

## Git metadata repair

Fetch initially failed because two existing duplicate ref files had invalid names containing spaces: `refs/heads/main 2` and `refs/heads/codex/persistent-story-unlocks 2`. Both pointed to existing commit `ba09fa6a`, already an ancestor of main. Their exact files were preserved under `.git/preserved-invalid-refs-20261103/`, and valid backup refs `codex/recovered-main-duplicate-20261103` and `codex/recovered-unlocks-duplicate-20261103` preserve the same commit. Fetch then succeeded. No commits, worktrees or user files were deleted.

## Verification

See `INTEGRATION-20261103.md` for build, automated and actual browser coverage. The main browser URL is `http://127.0.0.1:5200/`. Physical controllers and authenticated live hub rewards remain unverified; no server migration or backend deployment was performed.

All eight asset-transfer commits completed and their remote SHAs were checked. The final transfer tip is `3eb88efa9b051e4a03168887bdc5f89def10ada9`; its tree `24f759b83537022aa9d5a9acfa9343f89984757f` exactly matches the verified local source checkpoint `26eafe51`. The slow seventh transfer was stopped before its ref advanced and successfully retried through the same GitHub endpoint using HTTP/1.1. The six prior batches were preserved.

The final main checkpoint joins this transfer history with the complete local development history. No tracked source art, runtime assets or QA evidence are excluded. The final remote-main SHA and GitHub Actions result are provided in the task delivery; use `git rev-parse main` for the checked-out publication commit. Detailed scan metadata is in `PUBLIC-HISTORY-SCAN-20261103.json`.
