// Current campaign entry point: migration/state + actual controller/main integration.
// Split suites keep save-format tests separate from presentation orchestration.
await import('./story-expansion-smoke.mjs');
await import('./story-flow-smoke.mjs');
