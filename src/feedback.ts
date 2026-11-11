/**
 * In-game feedback (N twice). The window, the screenshot and the transport live in the vendored
 * hub SDK (`installFeedback`, see metaverse-hub docs/feedback.md); this file is the game's adapter:
 * what "right now" means in a fight, the game's look, and the hub session to send through.
 * Nothing here touches the combat simulation.
 */
import {
  feedbackTransportFromSdk, installFeedback,
  type FeedbackContext, type FeedbackHandle, type FeedbackTheme, type FeedbackTransport, type HubSdk,
} from '@metaverse/hub-sdk';
import { crashGuard } from './crash';

declare const __BUILD_ID__: string | undefined;
/** `<package version>+<short commit>`, set by vite.config.ts; `dev` when built some other way. */
export const BUILD_ID: string = typeof __BUILD_ID__ === 'string' && __BUILD_ID__ ? __BUILD_ID__ : 'dev';

/** One fighter as the feedback note records it. */
export interface FeedbackFighter {
  character: string;
  partner?: string;
  x: number;
  y: number;
  health: number;
  /** Team Special pips (0–3). */
  meter: number;
  combo: number;
  bestCombo: number;
  move: string | null;
}

/** Plain data main.ts hands over when the window opens. */
export interface FeedbackSnapshot {
  /** `menu` on the fighter select, otherwise the match kind. */
  screen: 'menu' | 'fight';
  mode: 'cpu' | 'versus' | 'guard' | 'dummy';
  story: { stage: string; encounter: number; bout: number } | null;
  online: { seat: number; wager: boolean; phase: string; link?: string; pingMs?: number | null; rollback?: number } | null;
  stage: string;
  stageName: string;
  /** Simulation frame of the current round (60 per second). */
  frame: number;
  /** The local player's fighter and the other one. */
  player: FeedbackFighter;
  opponent: FeedbackFighter;
  round: number | null;
  wins: [number, number] | null;
  winner: number | null;
  phase: string;
  running: boolean;
  paused: boolean;
  cpuSkill: number | null;
  assisted: boolean;
  godMode: boolean;
  boss: string | null;
  modifier: string | null;
}

const round1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);

/** The mode name stored with a note: story, arcade, versus, training-…, online. */
export function feedbackMode(s: Pick<FeedbackSnapshot, 'screen' | 'mode' | 'story' | 'online'>): string {
  if (s.online) return s.online.wager ? 'online-wager' : 'online';
  if (s.screen === 'menu') return 'menu';
  if (s.story) return 'story';
  if (s.mode === 'versus') return 'versus';
  if (s.mode === 'guard') return 'training-guard';
  if (s.mode === 'dummy') return 'training-combo';
  return 'arcade';
}

/** Shape a snapshot into the SDK's context. Pure, so it is tested without a browser. */
export function feedbackContext(s: FeedbackSnapshot): FeedbackContext {
  const mode = feedbackMode(s);
  if (s.screen === 'menu') return { level: 'fighter-select', mode, extra: { stage: s.stage, character: s.player.character, opponent: s.opponent.character } };
  const side = (f: FeedbackFighter) => ({ character: f.character, ...(f.partner ? { partner: f.partner } : {}), health: f.health, meter: f.meter, combo: f.combo, bestCombo: f.bestCombo, move: f.move });
  return {
    level: s.story ? `${s.stage} / encounter ${s.story.encounter}${s.story.bout > 1 ? ` bout ${s.story.bout}` : ''}` : s.stage,
    mode,
    position: { x: round1(s.player.x), y: round1(s.player.y) },
    gameTime: s.frame / 60,
    player: {
      ...side(s.player),
      ...(s.round === null ? {} : { round: s.round }),
      ...(s.wins ? { wins: s.wins[s.online?.seat ?? 0] } : {}),
      ...(s.godMode ? { godMode: true } : {}),
    },
    extra: {
      stageName: s.stageName,
      opponent: { ...side(s.opponent), position: { x: round1(s.opponent.x), y: round1(s.opponent.y) }, ...(s.wins ? { wins: s.wins[s.online ? 1 - s.online.seat : 1] } : {}) },
      phase: s.phase,
      state: s.paused ? 'paused' : s.running ? 'fighting' : 'stopped',
      ...(s.winner === null ? {} : { winner: s.winner }),
      ...(s.cpuSkill === null ? {} : { difficulty: s.cpuSkill, easierRetry: s.assisted }),
      ...(s.boss ? { boss: s.boss } : {}),
      ...(s.modifier && s.modifier !== 'none' ? { modifier: s.modifier } : {}),
      ...(s.online ? { online: { role: s.online.seat === 0 ? 'p1' : 'p2', ...s.online } } : {}),
    },
  };
}

/** Type from pixelUI.css, colours from mysticUI.css (the pause overlay's panel and amber button). */
export const FEEDBACK_THEME: Partial<FeedbackTheme> = {
  font: "'Pixelify Sans', monospace",
  background: '#030512df',
  panel: '#0e111f',
  text: '#f0e5ca',
  muted: '#a99aac',
  accent: '#dec48b',
  accentText: '#0b0d19',
  border: '#796444',
  radius: '0',
  css: `
.panel { border: 4px double #c4a477; box-shadow: inset 0 0 0 4px #080b14, 0 0 0 2px #4c3655, 8px 8px 0 #02030b; padding: 20px 20px 16px; }
.title { font-size: 24px; letter-spacing: 0; text-shadow: 2px 2px 0 #050913; color: #ffe5b0; }
.chip, .btn, .mini { border-width: 2px; }
.shot canvas { image-rendering: pixelated; }`,
};

/**
 * The hub session arrives after startup, and only for a visit opened from the hub. Until then,
 * and in standalone play, the SDK is told `standalone` and shows its one-line message.
 */
export function lazyFeedbackTransport(sdk: Promise<HubSdk | null>): FeedbackTransport {
  const inner = sdk.then(api => (api ? feedbackTransportFromSdk(api) : null), () => null);
  return {
    async access() {
      return (await inner)?.access() ?? { ok: false, reason: 'standalone' };
    },
    async submit(input) {
      const transport = await inner;
      if (!transport) throw new Error('Feedback needs a hub session');
      return transport.submit(input);
    },
  };
}

export interface FeedbackGame {
  /** The hub SDK once the visit is linked; null for standalone play. */
  sdk: Promise<HubSdk | null>;
  canvas: HTMLCanvasElement;
  /** Freeze a local match and return what to restore; `false` when the game cannot pause (online). */
  pause(): unknown;
  resume(token: unknown): void;
  snapshot(): FeedbackSnapshot;
  /** False while the game itself is waiting for a key (the Controls remapper). */
  enabled(): boolean;
}

/** Install the N-N shortcut and window. Call once at startup. */
export function setupFeedback(game: FeedbackGame): FeedbackHandle {
  // The crash guard counts errors but keeps no list: remember the last few distinct ones here.
  const errors: { message: string; stack: string; source: string; at: number }[] = [];
  crashGuard.onCrash(report => {
    if (report.fatal && errors.at(-1)?.message === report.message) return;
    errors.push({ message: report.message, stack: report.stack, source: report.source, at: Math.round(performance.now()) });
    if (errors.length > 10) errors.shift();
  });
  return installFeedback({
    title: 'Sproto Arena',
    version: BUILD_ID,
    transport: lazyFeedbackTransport(game.sdk),
    pause: () => game.pause(),
    resume: token => game.resume(token),
    context: () => feedbackContext(game.snapshot()),
    canvases: () => [game.canvas],
    errors: () => errors,
    enabled: () => game.enabled(),
    theme: FEEDBACK_THEME,
  });
}
