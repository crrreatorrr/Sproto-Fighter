# Vendor

`@metaverse/hub-sdk` packed from https://github.com/crrreatorrr/metaverse-hub
(`packages/hub-sdk`, branch `claude/sweet-newton-l4tjnh`, commit `b065668`), the commit that
adds the `sproto-fighter` game id, the `tidebreaker_belt` Relic and the
`fighter.story_level_complete` event. Source maps were removed.

Refresh after that hub change merges: `npm run pack:sdk` in metaverse-hub, unpack the tarball's
`package/` here, delete `*.map`, and update the commit above.

Integration repair: the published game branch did not track `dist/`. Source files are now preserved from exact hub commit `b06566855f9901e9e5af312e39ace65b734542bb`, compiled with `npm run build:hub-sdk`, with runtime JS and declarations tracked for clean installs. No changes were made to the hub checkout.
