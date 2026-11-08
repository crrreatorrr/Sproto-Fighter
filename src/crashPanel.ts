import type { CrashReport } from './crash';

/**
 * The small "Something broke" panel, in the pixel overlay style. It opens when the game pauses
 * after repeated errors (Reload) or when the first fighter art fails to load (Retry). Every error
 * string is set as text, never as markup.
 */
export function showCrashPanel(
  report: CrashReport,
  opts: { parent?: HTMLElement; reload?: () => void } = {},
): HTMLElement {
  const parent = opts.parent ?? document.body;
  const doc = parent.ownerDocument;
  parent.querySelector(':scope > .crash-overlay')?.remove();
  const boot = report.source === 'boot';

  const overlay = doc.createElement('div');
  overlay.className = 'overlay crash-overlay';
  overlay.setAttribute('role', 'alertdialog');
  overlay.setAttribute('aria-labelledby', 'crash-title');
  const box = doc.createElement('div');

  const kicker = doc.createElement('div');
  kicker.className = 'eyebrow';
  kicker.textContent = boot ? 'LOADING STOPPED' : 'GAME PAUSED';
  const title = doc.createElement('h2');
  title.id = 'crash-title';
  title.textContent = 'Something broke';
  const note = doc.createElement('p');
  note.textContent = boot
    ? 'The game could not finish loading. Retry to load it again.'
    : 'The game hit an error and paused. Reload to keep playing.';
  const details = doc.createElement('details');
  const summary = doc.createElement('summary');
  summary.textContent = 'Details';
  const pre = doc.createElement('pre');
  pre.textContent = report.stack && report.stack.includes(report.message)
    ? report.stack
    : [report.message, report.stack].filter(Boolean).join('\n');
  details.append(summary, pre);

  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'primary';
  button.textContent = boot ? 'Retry' : 'Reload';
  button.addEventListener('click', opts.reload ?? (() => location.reload()));

  box.append(kicker, title, note, details, button);
  overlay.append(box);
  parent.append(overlay);
  if (doc.pointerLockElement) doc.exitPointerLock?.();
  button.focus();
  return overlay;
}
