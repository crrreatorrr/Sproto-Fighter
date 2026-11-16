export interface StoryCutscene {
    folder: string;
    speaker: string;
    panels: readonly { art: string; description: string; line: string; speaker?: string }[];
}

const characterDelay = 38;

export function storyCutsceneArt(folder: string, art: string) {
    const base = document.querySelector<HTMLMetaElement>('meta[name="sproto-asset-base"]')?.content || './';
    return `${base}story/${folder}/${art}.webp`;
}

export function mountStoryCutscene(parent: HTMLElement, advance: HTMLButtonElement, { folder, speaker, panels }: StoryCutscene, finish: () => void) {
    const scene = document.createElement('section');
    scene.className = 'story-cutscene';
    scene.innerHTML = `
        <div class="story-cutscene-art">
            <div class="story-cutscene-image"></div>
            <p class="story-cutscene-status" aria-live="polite"></p>
        </div>
        <div class="story-cutscene-caption">
            <div class="story-cutscene-meta">
                <strong class="story-cutscene-speaker"></strong>
                <span class="story-cutscene-count"></span>
            </div>
            <p class="story-cutscene-line">
                <span class="story-cutscene-transcript" aria-live="polite" aria-atomic="true"></span>
                <span aria-hidden="true"><span class="story-cutscene-typed"></span><span class="story-cutscene-untyped"></span></span>
            </p>
        </div>`;
    parent.replaceChildren(scene);

    const art = scene.querySelector('.story-cutscene-image')!;
    const status = scene.querySelector<HTMLElement>('.story-cutscene-status')!;
    const speakerLabel = scene.querySelector('.story-cutscene-speaker')!;
    const count = scene.querySelector('.story-cutscene-count')!;
    const transcript = scene.querySelector('.story-cutscene-transcript')!;
    const typed = scene.querySelector('.story-cutscene-typed')!;
    const untyped = scene.querySelector('.story-cutscene-untyped')!;
    const images = panels.map((panel, index) => {
        const image = new Image();
        image.alt = panel.description;
        image.fetchPriority = index === 0 ? 'high' : 'low';
        image.src = storyCutsceneArt(folder, panel.art);
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
        const name = panel.speaker ?? speaker;
        speakerLabel.textContent = name;
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
            transcript.textContent = `${name}. ${panel.line}`;
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
