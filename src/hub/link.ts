import { createHubSdk, HubSdkError, type HubSdk, type InitResult } from '@metaverse/hub-sdk';
import { BELT_NAME, BELT_RELIC, BOSS_EVENT, HUB_GAME_ID } from './config';
import { planFighterWin, type FighterWin } from './report';
import { pageServerKey } from '../net/serverKey';

export type Notify = (title: string, sub: string) => void;

/** Written by the SDK while a portal ticket or a cached visit is live. */
const HUB_SESSION_KEY = `hub:${HUB_GAME_ID}:session`;

/**
 * The game's view of one hub visit, entered from the arcade cabinet in the hub's Bar.
 * `init` returns a profile even for standalone play. The visit is hub-connected only when
 * sessionStorage holds `hub:sproto-fighter:session`. Otherwise the game plays on its own and
 * reports nothing.
 */
export class HubLink {
  connected = false;
  /** Relics from the hub init result. Empty when standalone. Nothing in the game writes these back. */
  relics: string[] = [];
  balance: number | null = null;
  error: string | null = null;

  constructor(private readonly api: HubSdk = createBrowserSdk()) {}

  /** The SDK behind this visit, for features the SDK ships whole (the feedback window). */
  get sdk(): HubSdk {
    return this.api;
  }

  attach(session: InitResult | null): void {
    this.connected = session !== null;
    this.relics = [...(session?.relics ?? [])];
    this.error = null;
  }

  fail(err: unknown): void {
    this.connected = false;
    this.relics = [];
    this.error = err instanceof Error ? err.message : String(err);
  }

  /**
   * Report a finished round. Standalone visits, losses, practice and CPU wins the hub has no rule for do nothing.
   * The match id is the operation id, so a queued call the SDK resends on the next init keeps it.
   * Returns true when this call granted the Tidebreaker Belt.
   */
  async onRoundEnd(win: Omit<FighterWin, 'matchId'>, notify: Notify = () => {}): Promise<boolean> {
    if (!this.connected) return false;
    const calls = planFighterWin({ ...win, matchId: crypto.randomUUID() });
    let title = '';
    let sub = '';
    let belt = false;
    for (const call of calls) {
      try {
        // Since hub SDK 0.7.1, reportEvent returns the `tickets` the server credited for a story boss.
        // A server that predates it leaves the field out, so the balance is still read before and after
        // the report: the difference is the fallback when `tickets` is absent, and when neither is
        // available the toast makes no claim about payment at all.
        const boss = call.eventId === BOSS_EVENT;
        const before = boss ? await this.readBalance() : null;
        const reported = await this.api.reportEvent(call.eventId, call.data, call.key);
        if (boss) {
          const after = await this.readBalance();
          if (after !== null) this.balance = after;
          const credited = typeof reported.tickets === 'number' && Number.isFinite(reported.tickets)
            ? reported.tickets
            : before !== null && after !== null ? after - before : null;
          const balance = after !== null ? ` · Balance ${after}` : '';
          if (credited === null) {
            title = 'Boss defeated';
            sub = 'Reported to the hub';
          } else if (credited > 0) {
            title = `+${credited} Tickets`;
            sub = `Story boss defeated${balance}`;
          } else {
            title = 'Boss defeated';
            sub = `No Tickets credited: each boss pays once per day${balance}`;
          }
        }
        if (reported.granted === BELT_RELIC) {
          belt = true;
          if (!this.relics.includes(BELT_RELIC)) this.relics.push(BELT_RELIC);
          title = `Relic: ${BELT_NAME}`;
          sub = sub ? `${sub} · On its plinth in the Bar` : 'On its plinth in the Bar';
        }
      } catch (err) {
        const message = err instanceof HubSdkError && err.code === 'queued'
          ? err.message
          : err instanceof Error ? err.message : String(err);
        if (!title) title = 'Hub';
        sub = sub ? `${sub} · ${message}` : message;
      }
    }
    if (title) notify(title, sub);
    return belt;
  }

  /** This game's Ticket balance from the hub, or null when it cannot be read. */
  private async readBalance(): Promise<number | null> {
    try {
      const result = await this.api.getTicketBalance();
      return typeof result?.balance === 'number' && Number.isFinite(result.balance) ? result.balance : null;
    } catch {
      return null;
    }
  }

  /** Close the hub session and go back to the Bar's arcade cabinet. */
  exitHub(): void {
    const sdkNavigates = this.connected;
    this.api.exit('return');
    if (!sdkNavigates) redirectToHub();
  }
}

/** Redeem a portal ticket when the fragment has one, or resume a cached visit. Never throws. */
export async function connectHub(api?: HubSdk): Promise<HubLink> {
  const sdk = api ?? createBrowserSdk();
  const link = new HubLink(sdk);
  try {
    const profile = await sdk.init(HUB_GAME_ID);
    link.attach(hubSessionPresent() ? profile : null);
  } catch (err) {
    link.fail(err);
  }
  return link;
}

/** True when this build knows where the hub is, so Return to hub can show without a session. */
export function hubConfigured(): boolean {
  return Boolean(import.meta.env.VITE_HUB_URL?.trim());
}

function createBrowserSdk(): HubSdk {
  const serverUrl = (import.meta.env.VITE_NAKAMA_URL || 'http://127.0.0.1:7350').replace(/\/$/, '');
  // Nakama's client server key (public, not a secret). `VITE_NAKAMA_SERVER_KEY` for a build,
  // `defaultkey` in dev or on a loopback host (see ../net/serverKey.ts). The SDK no longer embeds one.
  const serverKey = pageServerKey();
  return createHubSdk({ serverUrl, serverKey, hubUrl: hubPageUrl(), assign: () => redirectToHub() });
}

/** Build-time hub page. Dev default is same-origin `/hub/`; production is `https://<domain>/hub`. */
function hubPageUrl(): string {
  const configured = import.meta.env.VITE_HUB_URL?.trim();
  return configured ? configured.split('#')[0] : '/hub/';
}

export function hubExitUrl(): string {
  return `${hubPageUrl()}#from=${HUB_GAME_ID}`;
}

function redirectToHub(): void {
  if (typeof window === 'undefined') return;
  window.location.assign(hubExitUrl());
}

function hubSessionPresent(): boolean {
  try {
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(HUB_SESSION_KEY) !== null;
  } catch {
    return false;
  }
}
