import { ROSTER } from './core';

const highSproto = ROSTER.highsproto.name;
const yannix = ROSTER.mox.name;
const collector = ROSTER.sproto102.name;
const dad = ROSTER.sproto1187.name;
const snarf = ROSTER.sproto763.name;

const panels = [
    {
        art: '01-wake',
        description: `Under a distant skyline, ${highSproto} stands ankle-deep in the flooded trench.`,
        line: 'My hands won’t stop shaking. That feels real. So why can’t I remember how I got down here?',
    },
    {
        art: '02-reflection',
        description: `${highSproto} peers into a puddle. A magenta band cuts across the eyes of his reflection.`,
        line: 'I blinked. The face in the water kept staring. For a second, I thought it was waiting for me to copy it.',
    },
    {
        art: '03-march',
        description: `${yannix}, ${collector}, ${dad}, and ${snarf} march in lockstep past ${highSproto}’s hiding place, their eyes glowing magenta.`,
        line: `${collector}. ${dad}. ${snarf}. Every boot hits the water on the same beat. ${yannix} has a tear on his cheek. He keeps marching.`,
    },
    {
        art: '04-relay',
        description: `A relay sends a magenta signal to ${yannix} and ${collector}. The receiver beside ${highSproto}’s ear glows the same color.`,
        line: 'Those receivers are feeding them orders. Mine’s doing it too. I hear my own voice say, “Fight him.” I never opened my mouth.',
    },
    {
        art: '05-choice',
        description: `${highSproto} holds his disconnected receiver and reaches toward ${yannix}, whose eye still glows magenta.`,
        line: `I pulled mine out. The voice stopped. ${yannix}, I’m taking yours off too. If the signal makes you swing at me, I’ll get close enough to free you.`,
    },
];

const characterDelay = 38;

export function mountTrenchesCutscene(parent: HTMLElement, advance: HTMLButtonElement, finish: () => void) {
    const scene = document.createElement('section');
    scene.className = 'trenches-cutscene';
    scene.innerHTML = `
        <div class="trenches-cutscene-art">
            <div class="trenches-cutscene-image"></div>
            <p class="trenches-cutscene-status" aria-live="polite"></p>
        </div>
        <div class="trenches-cutscene-caption">
            <div class="trenches-cutscene-meta">
                <strong class="trenches-cutscene-speaker"></strong>
                <span class="trenches-cutscene-count"></span>
            </div>
            <p class="trenches-cutscene-line">
                <span class="trenches-cutscene-transcript" aria-live="polite" aria-atomic="true"></span>
                <span aria-hidden="true"><span class="trenches-cutscene-typed"></span><span class="trenches-cutscene-untyped"></span></span>
            </p>
        </div>`;
    parent.replaceChildren(scene);

    const art = scene.querySelector('.trenches-cutscene-image')!;
    const status = scene.querySelector<HTMLElement>('.trenches-cutscene-status')!;
    scene.querySelector('.trenches-cutscene-speaker')!.textContent = highSproto;
    const count = scene.querySelector('.trenches-cutscene-count')!;
    const transcript = scene.querySelector('.trenches-cutscene-transcript')!;
    const typed = scene.querySelector('.trenches-cutscene-typed')!;
    const untyped = scene.querySelector('.trenches-cutscene-untyped')!;
    const base = document.querySelector<HTMLMetaElement>('meta[name="sproto-asset-base"]')?.content || './';
    const images = panels.map((panel, index) => {
        const image = new Image();
        image.alt = panel.description;
        image.fetchPriority = index === 0 ? 'high' : 'low';
        image.src = `${base}story/trenches/${panel.art}.webp`;
        return image;
    });
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let revealed = 0;
    let timer: number | undefined;
    let stopWaitingForArt: (() => void) | undefined;

    function stopPanel() {
        stopWaitingForArt?.();
        stopTyping();
    }

    function stopTyping() {
        if (timer !== undefined) window.clearInterval(timer);
        timer = undefined;
    }

    function reveal(length: number) {
        const line = panels[index].line;
        revealed = length;
        typed.textContent = line.slice(0, length);
        untyped.textContent = line.slice(length);
    }

    function showPanel() {
        const panel = panels[index];
        const image = images[index];
        art.replaceChildren(image);
        status.hidden = false;
        status.textContent = 'Loading artwork…';
        advance.setAttribute('aria-disabled', 'true');
        count.textContent = `${index + 1} / ${panels.length}`;
        transcript.textContent = '';
        reveal(0);

        function startDialogue() {
            stopWaitingForArt?.();
            const hasArtwork = image.naturalWidth > 0;
            image.hidden = !hasArtwork;
            status.hidden = hasArtwork;
            if (!hasArtwork) status.textContent = panel.description;
            advance.removeAttribute('aria-disabled');
            transcript.textContent = `${highSproto}. ${panel.line}`;
            if (reducedMotion) {
                reveal(panel.line.length);
                return;
            }
            timer = window.setInterval(() => {
                reveal(revealed + 1);
                if (revealed === panel.line.length) stopTyping();
            }, characterDelay);
        }

        if (image.complete) startDialogue();
        else {
            image.onload = image.onerror = startDialogue;
            stopWaitingForArt = () => {
                image.onload = image.onerror = null;
                stopWaitingForArt = undefined;
            };
        }
    }

    advance.onclick = () => {
        if (advance.getAttribute('aria-disabled') === 'true') return;
        stopPanel();
        if (index < panels.length - 1) {
            index++;
            showPanel();
        } else finish();
    };

    showPanel();
    return stopPanel;
}
