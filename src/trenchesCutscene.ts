const panels = [
    {
        art: '01-wake',
        description: 'Under a distant skyline, High Sproto stands ankle-deep in the flooded trench.',
        speaker: 'High Sproto',
        line: 'I woke up down here with my name in my mouth. High Sproto. I can’t remember who said it first.',
    },
    {
        art: '02-reflection',
        description: 'High Sproto peers into a puddle. A magenta band cuts across the eyes of his reflection.',
        speaker: 'High Sproto',
        line: 'I blinked. The face in the water didn’t. If it knows my name too… which one of us is real?',
    },
    {
        art: '03-march',
        description: 'Mox and three other Sprotos march in lockstep past High Sproto’s hiding place, their eyes glowing magenta.',
        speaker: 'High Sproto',
        line: 'Every boot hits the water on the same beat. Mox is crying. His feet keep moving.',
    },
    {
        art: '04-relay',
        description: 'A relay sends a magenta signal to Mox and Sproto #102. The receiver beside High Sproto’s ear glows the same color.',
        speaker: 'Ascension Relay',
        line: 'Receivers linked. Overwriting intent. Repeat as your own thought: I want to fight. I have always wanted to fight.',
    },
    {
        art: '05-choice',
        description: 'High Sproto pulls out his receiver and reaches for Mox, who still stares ahead with a glowing magenta eye.',
        speaker: 'High Sproto',
        line: 'I pulled the receiver. The orders stopped. I’m the only one awake down here. I still don’t know if I’m real, Mox. But I’m staying with you.',
    },
];

const characterDelay = 29;

export function mountTrenchesCutscene(parent: HTMLElement, advance: HTMLButtonElement, finish: () => void) {
    const scene = document.createElement('section');
    scene.className = 'trenches-cutscene';
    scene.innerHTML = `
        <div class="trenches-cutscene-art"></div>
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

    const art = scene.querySelector('.trenches-cutscene-art')!;
    const caption = scene.querySelector('.trenches-cutscene-caption') as HTMLElement;
    const speaker = scene.querySelector('.trenches-cutscene-speaker')!;
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

    function stopTyping() {
        if (timer !== undefined) window.clearInterval(timer);
        timer = undefined;
    }

    function reveal(length: number) {
        const line = panels[index].line;
        revealed = length;
        typed.textContent = line.slice(0, length);
        untyped.textContent = line.slice(length);
        advance.textContent = length < line.length ? 'Show full line' : index < panels.length - 1 ? 'Next panel' : 'Continue';
    }

    function showPanel() {
        const panel = panels[index];
        art.replaceChildren(images[index]);
        caption.dataset.speaker = panel.art === '04-relay' ? 'relay' : 'high-sproto';
        speaker.textContent = panel.speaker;
        count.textContent = `${index + 1} / ${panels.length}`;
        transcript.textContent = `${panel.speaker}. ${panel.line}`;
        reveal(reducedMotion ? panel.line.length : 0);
        if (reducedMotion) return;
        timer = window.setInterval(() => {
            reveal(revealed + 1);
            if (revealed === panel.line.length) stopTyping();
        }, characterDelay);
    }

    advance.onclick = () => {
        stopTyping();
        if (revealed < panels[index].line.length) reveal(panels[index].line.length);
        else if (index < panels.length - 1) {
            index++;
            showPanel();
        } else finish();
    };
    // A held Enter should not move through several panels.
    advance.onkeydown = event => {
        if (event.key === 'Enter' && event.repeat) event.preventDefault();
    };

    showPanel();
    return stopTyping;
}
