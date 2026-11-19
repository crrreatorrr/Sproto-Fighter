import { createProgressStore, hubVisitStarting } from '@metaverse/hub-sdk';
import { HUB_GAME_ID } from './hub/config';
import { createStoryProgress, type SaveStorage } from './storyProgress';

/**
 * The game's story progress. It belongs to whoever plays: a hub account during a hub visit
 * (kept in this browser under the account and in its hub cloud save, so it loads on any
 * device), or this browser for play without a hub session. src/main.ts attaches the account
 * once the hub visit resolves.
 */
let browserStorage: SaveStorage | undefined;
try {
  browserStorage = globalThis.localStorage;
} catch {
  /* The UI reports session-only progress. */
}
export const storyProgress = createStoryProgress(browserStorage, undefined, undefined, createProgressStore);

if (typeof window !== 'undefined') {
  // A portal ticket or a live hub session: wait for the account before showing progress.
  if (hubVisitStarting(HUB_GAME_ID)) storyProgress.hold();
  window.addEventListener('storage', event => {
    if (storyProgress.watches(event.key)) storyProgress.sync();
  });
  window.addEventListener('focus', () => storyProgress.sync());
  window.addEventListener('pageshow', () => {
    leaving = false;
    storyProgress.sync();
  });
  // A plain flush() reads the cloud first, which cannot finish once the page is going away.
  window.addEventListener('pagehide', saveBeforeLeaving);
}

let leaving = false;
/**
 * Send unsynced account progress with a keepalive request so it outlives the page. Called before
 * the hub exit (the SDK closes the session as it navigates) and again on `pagehide`, which then
 * sends nothing more for the same exit.
 */
export function saveBeforeLeaving(): void {
  if (leaving) return;
  leaving = true;
  storyProgress.flushKeepalive();
}
