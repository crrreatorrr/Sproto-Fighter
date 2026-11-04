# Vendor

`@metaverse/hub-sdk` 0.6.0 packed from https://github.com/crrreatorrr/metaverse-hub
(`packages/hub-sdk`, branch `claude/kind-bardeen-h2fhj8`, commit `ee187cf`), the commit that
adds the `sproto-arcade` game id, the `breakwater_coin` Relic, the `arcade.boss_defeated` event
and optional cloud saves. That hub commit was not yet merged to `main` when this copy was made.
Source maps were removed.

Refresh after that hub change merges: `npm run pack:sdk` in metaverse-hub, unpack the tarball's
`package/` here, delete `*.map`, copy `packages/hub-sdk/src` into `src/`, run
`npm run build:hub-sdk` here, and update the commit above.

`src/` holds the SDK source from that same hub commit (`ee187cfb8f24a417ee075655f984b239540aa370`).
`tsconfig.build.json` is this repo's standalone copy (the hub's extends a base config that is not
vendored, and turns on source maps). `npm run build:hub-sdk` rebuilds `dist/` from `src/`; the output
matches the packed tarball apart from its `sourceMappingURL` comments. Runtime JS and declarations
are tracked so clean installs work. No changes were made to the hub checkout.
