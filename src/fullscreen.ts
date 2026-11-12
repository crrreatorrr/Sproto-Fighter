/**
 * Browser full screen (the Fullscreen API) for every menu's "Full screen" option.
 * The page already fills the window; this hides the browser's own chrome as well.
 * `requestFullscreen` needs a user gesture, so callers run `toggleFullscreen` from the
 * click, key or controller-button handler itself. A refusal (no gesture, a browser that
 * blocks it) is reported through `onRefused` and never becomes an uncaught rejection.
 */
export interface FullscreenDocument {
    readonly fullscreenEnabled?: boolean;
    readonly fullscreenElement?: Element | null;
    readonly documentElement: { requestFullscreen?: (options?: FullscreenOptions) => Promise<void> };
    exitFullscreen?: () => Promise<void>;
    addEventListener(type: 'fullscreenchange', listener: () => void): void;
}

export const fullscreenSupported = (doc: FullscreenDocument = document): boolean =>
    !!doc.fullscreenEnabled && typeof doc.documentElement.requestFullscreen === 'function';

export const isFullscreen = (doc: FullscreenDocument = document): boolean => !!doc.fullscreenElement;

/** The option's label, which always names the current state. */
export const fullscreenLabel = (on: boolean): string => `Full screen: ${on ? 'On' : 'Off'}`;

/** Enter or leave browser full screen. Returns the request so tests can await it; it never rejects. */
export function toggleFullscreen(doc: FullscreenDocument = document, onRefused?: (error: unknown) => void): Promise<void> {
    if (!fullscreenSupported(doc)) return Promise.resolve();
    try {
        const request = isFullscreen(doc) ? doc.exitFullscreen?.() : doc.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
        return Promise.resolve(request).catch(error => { onRefused?.(error); });
    } catch (error) {
        onRefused?.(error);
        return Promise.resolve();
    }
}

/**
 * Keep every "Full screen" button labelled with the current state and hidden where the
 * browser cannot go full screen. Leaving full screen with Esc or F11 fires `fullscreenchange`,
 * so the labels follow it too.
 */
export function bindFullscreenButtons(buttons: HTMLButtonElement[], onRefused?: (error: unknown) => void, doc: FullscreenDocument = document): () => void {
    const sync = () => {
        const supported = fullscreenSupported(doc), on = isFullscreen(doc);
        for (const button of buttons) {
            button.hidden = !supported;
            button.textContent = fullscreenLabel(on);
            button.setAttribute('aria-pressed', String(on));
        }
    };
    for (const button of buttons) {
        button.dataset.fullscreen = '';
        button.onclick = () => { void toggleFullscreen(doc, onRefused); };
    }
    doc.addEventListener('fullscreenchange', sync);
    sync();
    return sync;
}

/**
 * The browser uses Escape to leave full screen. In some browsers that Escape still reaches the
 * page; let it only leave full screen, so it does not also pause the fight or close a menu.
 */
export function escapeLeavesFullscreenOnly(event: { key?: string; code?: string }, doc: FullscreenDocument = document): boolean {
    return (event.key === 'Escape' || event.code === 'Escape') && isFullscreen(doc);
}
