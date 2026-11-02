/** Fallback ranch pixel art, drawn at 320×180 then nearest-neighbor scaled.
 * Reference motifs: amber dusk, stone farmhouse, grassy fields, muddy lane,
 * dry-stone boundary and distant weathered farm buildings. No reference pixels,
 * people, text overlays or logos are reused. Purely visual; never changes combat.
 */
let scenery: HTMLCanvasElement | undefined;
const PALETTE = {
    ink: '#272532', cloud: '#3b3440', cloudLight: '#65504b', rust: '#8e543e',
    amber: '#db9953', gold: '#edba69', sky: '#ba7d51', distant: '#66634d',
    grass: '#68704b', grassLight: '#92945b', grassDark: '#444f3e',
    stone: '#8b8170', stoneLight: '#b1a18a', stoneDark: '#5c5851',
    dirt: '#8e7058', dirtLight: '#b28c66', dirtDark: '#665447', wood: '#574a40',
};
function buildScenery(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const c = canvas.getContext('2d')!;
    const rect = (x: number, y: number, w: number, h: number, color: string) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
    const poly = (points: number[][], color: string) => { c.fillStyle = color; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); };
    // Chunky horizontal sky bands and stepped cloud shapes preserve a pixel grid.
    const sky = ['#272832', '#34313a', '#493b40', '#674b44', '#8a5b46', '#ae704b', '#cb8a50', '#e1a55e', '#e9b66a'];
    sky.forEach((color, i) => rect(0, i * 10, 320, 11, color));
    rect(0, 85, 320, 22, PALETTE.gold);
    rect(232, 70, 17, 16, '#f4cb7b');
    rect(229, 74, 23, 8, '#f4cb7b');
    poly([[0, 45], [20, 45], [20, 49], [47, 49], [47, 52], [74, 52], [74, 55], [101, 55], [101, 58], [61, 58], [61, 56], [25, 56], [25, 53], [0, 53]], '#755047');
    poly([[142, 41], [166, 41], [166, 38], [196, 38], [196, 42], [215, 42], [215, 46], [253, 46], [253, 49], [283, 49], [283, 52], [320, 52], [320, 60], [278, 60], [278, 56], [247, 56], [247, 53], [201, 53], [201, 49], [166, 49], [166, 46], [142, 46]], PALETTE.cloud);
    rect(204, 52, 39, 2, '#aa704c');
    rect(248, 57, 35, 2, '#bd7c4d');
    poly([[12, 67], [38, 67], [38, 63], [66, 63], [66, 66], [86, 66], [86, 69], [113, 69], [113, 72], [151, 72], [151, 75], [106, 75], [106, 73], [62, 73], [62, 71], [12, 71]], '#8a5d49');
    rect(0, 79, 36, 3, '#c58a55');
    rect(145, 82, 36, 2, '#cb8d52');
    rect(270, 77, 50, 3, '#aa774f');
    // Distant hills, trees and a pair of old stone silos.
    poly([[0, 100], [0, 94], [18, 94], [18, 92], [40, 92], [40, 95], [62, 95], [62, 93], [86, 93], [86, 96], [115, 96], [115, 94], [142, 94], [142, 91], [168, 91], [168, 88], [192, 88], [192, 91], [216, 91], [216, 93], [246, 93], [246, 90], [278, 90], [278, 92], [303, 92], [303, 89], [320, 89], [320, 111]], '#797b59');
    rect(164, 76, 12, 22, '#706556');
    rect(166, 72, 8, 5, '#796c59');
    rect(167, 69, 6, 4, '#8a745c');
    rect(172, 78, 4, 20, '#5f5b50');
    rect(178, 82, 13, 17, '#686154');
    rect(181, 79, 7, 4, '#766957');
    rect(195, 74, 4, 24, '#74634f');
    rect(195, 72, 4, 3, '#8b7055');
    rect(167, 81, 2, 3, '#3e4540');
    rect(182, 86, 2, 3, '#3e4540');
    for (let i = 0; i < 13; i++) {
        const x = 6 + i * 27, h = 4 + (i * 3 % 6);
        rect(x, 95 - h, 3, h, '#5e654c');
        rect(x - 2, 97 - h, 7, h - 2, '#5e654c');
    }
    poly([[0, 105], [38, 102], [77, 106], [127, 102], [169, 105], [208, 99], [261, 104], [320, 100], [320, 146], [0, 146]], PALETTE.grass);
    poly([[0, 120], [56, 111], [104, 114], [136, 108], [195, 111], [232, 106], [269, 111], [320, 107], [320, 131], [239, 121], [170, 125], [99, 120], [36, 129], [0, 127]], '#768052');
    // A farm lane curves toward the fighting yard, with stepped puddles.
    poly([[222, 101], [230, 101], [226, 108], [229, 115], [242, 123], [263, 135], [289, 145], [204, 145], [220, 133], [227, 123], [216, 115], [216, 109]], '#9e805d');
    poly([[225, 102], [228, 102], [223, 111], [225, 116], [237, 124], [249, 134], [257, 145], [237, 145], [237, 133], [230, 124], [220, 116], [220, 110]], '#b49469');
    poly([[228, 120], [232, 120], [232, 122], [239, 122], [239, 125], [232, 125], [232, 124], [226, 124], [226, 122], [228, 122]], '#5c574c');
    rect(229, 121, 4, 2, '#d4aa72');
    rect(230, 122, 7, 1, '#bc986a');
    poly([[240, 134], [248, 134], [248, 136], [255, 136], [255, 139], [241, 139], [241, 138], [237, 138], [237, 136], [240, 136]], '#655b4d');
    rect(240, 135, 8, 1, '#c4a273');
    // Main farmhouse and attached barn: different composition from the photo.
    rect(55, 86, 60, 40, PALETTE.stoneDark);
    rect(57, 86, 56, 38, PALETTE.stone);
    poly([[54, 86], [78, 66], [114, 86]], PALETTE.stoneLight);
    poly([[48, 85], [73, 65], [83, 65], [60, 85]], '#4c4140');
    poly([[60, 85], [83, 65], [125, 65], [141, 85]], '#6f453c');
    poly([[60, 85], [83, 65], [125, 65], [141, 85], [139, 88], [60, 88]], '#71483f');
    for (let y = 69; y < 85; y += 4) {
        const left = 83 - (y - 65) * 1.15, right = 125 + (y - 65) * .8;
        rect(Math.ceil(left), y, Math.floor(right - left), 1, '#a4694c');
        for (let x = Math.ceil(left) + 3; x < right; x += 9)
            rect(x, y + 1, 1, 2, '#563b37');
    }
    rect(63, 85, 76, 2, '#3f3737');
    rect(81, 62, 5, 9, '#605049');
    rect(80, 61, 7, 2, '#8a6c54');
    rect(120, 62, 4, 7, '#65534a');
    rect(114, 88, 25, 38, '#716c5e');
    // Small irregular stonework, deterministic placement rather than random noise.
    for (let row = 0; row < 8; row++)
        for (let col = 0; col < 8; col++) {
            const x = 58 + col * 7 + (row % 2) * 3, y = 89 + row * 4;
            if (x < 112) {
                rect(x, y, 5, 2, (row + col) % 3 === 0 ? '#a2947d' : '#7c7667');
            }
        }
    for (let row = 0; row < 7; row++)
        for (let col = 0; col < 3; col++)
            rect(117 + col * 7, row * 5 + 90, 5, 2, (row + col) % 3 === 0 ? '#8b806c' : '#625f54');
    const window = (x: number, y: number, lit = false) => { rect(x - 1, y - 1, 9, 12, '#b5a085'); rect(x, y, 7, 10, '#343b36'); rect(x + 1, y + 1, 2, 7, lit ? '#cda568' : '#697465'); rect(x + 4, y + 1, 2, 7, lit ? '#b28b53' : '#46584c'); rect(x, y + 4, 7, 1, '#3e433b'); rect(x - 1, y + 10, 9, 2, '#544c43'); };
    window(65, 92);
    window(94, 92, true);
    window(66, 111, true);
    window(124, 95);
    rect(90, 108, 12, 18, '#49483d');
    rect(92, 109, 8, 17, '#59604b');
    rect(93, 110, 1, 15, '#77755a');
    rect(98, 118, 1, 1, '#d6af6b');
    rect(48, 125, 94, 3, '#4c503d');
    // Lean-to with timber door and weathered roof.
    rect(32, 105, 28, 21, '#817764');
    poly([[28, 105], [36, 94], [61, 94], [66, 106]], '#69453d');
    for (let y = 97; y < 105; y += 3)
        rect(34 - (y - 97) / 2, y, 28 + (y - 97) / 2, 1, '#9c654c');
    rect(37, 109, 14, 17, '#4d4b3d');
    for (let x = 38; x < 51; x += 3)
        rect(x, 110, 1, 15, '#68634a');
    rect(36, 117, 16, 2, '#807053');
    // Meadow detail, with flowers kept small and low contrast behind fighters.
    for (let i = 0; i < 145; i++) {
        const x = (i * 47 + 11) % 320, y = 110 + (i * 17 % 31);
        if ((x > 25 && x < 145 && y < 129) || (x > 211 && x < 280))
            continue;
        rect(x, y, 1, 2, i % 3 === 0 ? '#969657' : '#4f623f');
        if (i % 13 === 0)
            rect(x - 1, y, 2, 1, '#c6ad66');
    }
    // Dry-stone walls leave the winding lane open.
    const wall = (x: number, w: number) => { rect(x, 132, w, 8, '#535a48'); for (let row = 0; row < 2; row++)
        for (let j = 0; j < Math.floor(w / 7); j++) {
            const bx = x + j * 7 + (row % 2) * 2;
            rect(bx, 132 + row * 4, 6, 3, (j + row) % 3 === 0 ? '#9e9780' : '#7d826b');
        } for (let j = 0; j < w; j += 6)
        rect(x + j, 130 + (j % 3), 5, 3, '#92937a'); };
    wall(0, 163);
    wall(282, 38);
    // Posts and two rails add a strong ranch silhouette without obscuring torsos.
    for (const x of [168, 193, 282, 310]) {
        rect(x, 120, 3, 24, '#534d3e');
        rect(x, 119, 3, 2, '#a28d67');
        rect(x + 1, 122, 1, 21, '#817054');
    }
    rect(169, 126, 26, 2, '#8c7a59');
    rect(169, 136, 26, 2, '#706246');
    rect(283, 126, 30, 2, '#8c7a59');
    rect(283, 136, 30, 2, '#706246');
    // The level's flat combat lane is distinct from the receding scenic path.
    rect(0, 144, 320, 36, PALETTE.dirt);
    rect(0, 144, 320, 2, '#c1a079');
    rect(0, 146, 320, 3, '#9d7e5e');
    for (let i = 0; i < 155; i++) {
        const x = (i * 53) % 320, y = 150 + (i * 23 % 29), w = 1 + i % 4;
        rect(x, y, w, 1, i % 3 === 0 ? '#a98966' : i % 3 === 1 ? '#7d6553' : '#96795d');
    }
    // Ruts and puddles live in the foreground, below both fighters' feet.
    rect(0, 169, 94, 2, '#78614f');
    rect(19, 172, 105, 1, '#a18462');
    rect(238, 165, 82, 2, '#78614f');
    poly([[180, 164], [197, 164], [197, 165], [209, 165], [209, 168], [201, 168], [201, 169], [177, 169], [177, 167], [173, 167], [173, 165], [180, 165]], '#625a51');
    rect(180, 165, 19, 1, '#ba956b');
    rect(185, 167, 18, 1, '#988063');
    // Tufts at the extreme edges frame the action, never its center.
    for (const x of [2, 7, 13, 18, 302, 308, 315]) {
        rect(x, 141 - (x % 4), 1, 7 + (x % 4), '#4e5b3d');
        rect(x - 1, 145, 3, 2, '#667147');
    }
    // A deliberately calm dark top region keeps existing health bars legible.
    rect(0, 0, 320, 41, '#15192370');
    return canvas;
}
function drawRanch(ctx: CanvasRenderingContext2D, frame: number): void {
    scenery ??= buildScenery();
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scenery, 0, 0, 1280, 720);
    // A few warm drifting motes provide life without requiring raster assets.
    for (let i = 0; i < 6; i++) {
        const x = (((frame >> 3) + i * 73) % 320) * 4;
        const y = (108 + ((i * 19 + (frame >> 6)) % 29)) * 4;
        ctx.fillStyle = i % 2 ? '#dfbf7438' : '#f3d18c30';
        ctx.fillRect(x, y, 4, 4);
    }
    ctx.restore();
}

export type StageId = 'yacht' | 'bar' | 'castle' | 'retro' | 'ranch' | 'trenches' | 'circuit' | 'throne' | 'verse' | 'hatchery';
/** Canonical chapter order; encounter assignments and gates derive from this route. */
export const STORY_STAGE_IDS:readonly StageId[] = ['trenches','circuit','yacht','throne','bar','verse','hatchery'];
export const STAGES: {id:StageId;name:string;theme:string;accent:string;chapter:number|null}[] = [
    {id:'trenches',name:'Mudline Trenches',theme:'The Trenches / city below',accent:'#d6a05c',chapter:1},
    {id:'circuit',name:'Circuit Gate',theme:'The City / challenge gate',accent:'#64d7df',chapter:2},
    {id:'retro',name:'Neon Tomorrow',theme:'Retrofuturistic city',accent:'#df86de',chapter:2},
    {id:'yacht',name:'Tidebreak Marina',theme:'$Bitcoin Yacht Party',accent:'#66d7e8',chapter:3},
    {id:'throne',name:'Crown Relay Chamber',theme:'The Castle / relay throne',accent:'#e5b65f',chapter:4},
    {id:'castle',name:'Moonkeep Castle',theme:'Castle courtyard',accent:'#adabed',chapter:4},
    {id:'bar',name:'Last Light Bar',theme:'The Bar / hidden doorway',accent:'#efaa65',chapter:5},
    {id:'verse',name:'Verse Gate',theme:'The Verse / open every gate',accent:'#ad92f4',chapter:6},
    {id:'hatchery',name:'The Hatchery',theme:'Beyond the portal / alien hive',accent:'#c4d75c',chapter:7},
    {id:'ranch',name:'Sproto Ranch',theme:'Bonus / sunset farmstead',accent:'#efbd7a',chapter:null},
];
let currentStage:StageId='ranch';
const placeholderScenery=new Map<StageId,HTMLCanvasElement>();
const stageImages=new Map<StageId,HTMLImageElement>();
const stageArtErrors=new Map<StageId,string>();
let stageArtPromise:Promise<void>|undefined;
/** Higgsfield scenery from text or environmental references, never fighter atlases. */
export function loadStageArt():Promise<void>{
    return stageArtPromise??=Promise.all(STAGES.map(async stage=>{
        const image=new Image();
        try{
            await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Stage image could not load'));image.src=`/stages/higgsfield/${stage.id}.png`;});
            stageImages.set(stage.id,image);
        }catch(error){stageArtErrors.set(stage.id,String(error));}
    })).then(()=>undefined);
}
export const getStageArtStatus=()=>({loaded:[...stageImages.keys()],errors:Object.fromEntries(stageArtErrors)});
export function setStage(id:StageId){currentStage=id;}
export function getStage(){return currentStage;}
/** Menu thumbnails and the arena share scenery without changing the active stage. */
export function drawStagePreview(ctx:CanvasRenderingContext2D,id:StageId,width:number,height:number,frame=0):void{
    // Wide menu panels crop scenery instead of vertically flattening it.
    const scale=Math.max(width/1280,height/720);
    ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();
    ctx.translate((width-1280*scale)/2,(height-720*scale)*.6);ctx.scale(scale,scale);ctx.imageSmoothingEnabled=false;
    const art=stageImages.get(id);
    if(art){
        drawArenaScenery(ctx,id,art);
        if(id==='bar')drawBarApron(ctx);
    }
    else if(id==='ranch'){drawRanch(ctx,frame);}
    else{
        let scene=placeholderScenery.get(id);
        if(!scene){scene=buildPlaceholder(id);placeholderScenery.set(id,scene);}
        ctx.drawImage(scene,0,0,1280,720);
    }
    ctx.restore();
}
/** Reframe depth bands around the unchanged y=578 gameplay floor.
 * Verse's deck surrounds the fighters rather than ending at their heels;
 * the castle's courtyard begins before their feet instead of after the curb.
 * Source coordinates use the same 1280×720 space as the unmodified panorama.
 */
function drawArenaScenery(ctx:CanvasRenderingContext2D,id:StageId,art:HTMLImageElement):void{
    const sourceWidth=art.naturalWidth,sourceHeight=art.naturalHeight;
    const bands=id==='verse'?[[0,0],[480,480],[570,676],[720,720]]:
        id==='castle'?[[0,0],[596,520],[692,704],[720,720]]:null;
    if(bands){
        for(let i=1;i<bands.length;i++){
            const [sourceTop,targetTop]=bands[i-1],[sourceBottom,targetBottom]=bands[i];
            ctx.drawImage(art,0,sourceTop/720*sourceHeight,sourceWidth,(sourceBottom-sourceTop)/720*sourceHeight,
                0,targetTop,1280,targetBottom-targetTop);
        }
    }else ctx.drawImage(art,0,0,1280,720);
    if(id==='yacht'){
        // The source pier turns into water on the right. Continue its own timber
        // across the foreground so the entire walkable arena stays on the dock.
        ctx.drawImage(art,0,532/720*sourceHeight,650/1280*sourceWidth,188/720*sourceHeight,
            0,532,1280,188);
        ctx.fillStyle='#594531';ctx.fillRect(0,532,1280,3);
        ctx.fillStyle='#d5b87c';ctx.fillRect(0,535,1280,2);
    }
}
/** A clear fighting floor in front of the bar's side booths, including both corners. */
function drawBarApron(ctx:CanvasRenderingContext2D):void{
    ctx.fillStyle='#63442f';ctx.fillRect(0,530,1280,190);
    ctx.fillStyle='#916747';ctx.fillRect(0,530,1280,4);
    ctx.fillStyle='#302720';ctx.fillRect(0,534,1280,2);
    for(let i=0;i<7;i++){
        const y=538+i*20+i*i;
        ctx.fillStyle=i%2?'#684832':'#5b3e2d';ctx.fillRect(0,y,1280,18+i*2);
        ctx.fillStyle='#392d24';ctx.fillRect(0,y,1280,2);
        ctx.fillStyle='#856044';ctx.fillRect(0,y+2,1280,1);
    }
    ctx.strokeStyle='#392c23';ctx.lineWidth=2;
    for(let i=-5;i<=5;i++){
        ctx.beginPath();ctx.moveTo(640+i*88,530);ctx.lineTo(640+i*210,720);ctx.stroke();
    }
}
export function drawStage(ctx:CanvasRenderingContext2D,frame:number):void {
    drawStagePreview(ctx,currentStage,1280,720,frame);
    if(currentStage==='ranch'||stageImages.has(currentStage))return;
    ctx.save();ctx.fillStyle='#0b101acc';ctx.fillRect(24,630,430,35);ctx.fillStyle='#d7e3ef';ctx.font='12px "Pixelify Sans", monospace';ctx.textAlign='left';
    ctx.fillText('PLACEHOLDER STAGE / '+STAGES.find(s=>s.id===currentStage)!.theme.toUpperCase(),36,652);ctx.restore();
}
/** Deliberately static layout studies. These are not final level art or cutscene animation. */
function buildPlaceholder(id:StageId):HTMLCanvasElement {
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180;const c=canvas.getContext('2d')!;
    const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const p=(points:number[][],color:string)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
    if(id==='trenches'){
        r(0,0,320,180,'#142b42');
        for(let i=0;i<12;i++){const x=i*29,h=16+i*13%35;r(x,64-h,20,h,'#234c63');r(x+5,65-h,2,h-6,'#53a2b4');}
        r(0,68,320,76,'#34434b');r(115,70,90,74,'#182d3c');
        for(let y=86;y<144;y+=9){const width=40+(y-86)*.9;r(160-width/2,y,width,5,'#56707a');}
        for(const x of [8,73,237,301]){r(x,68,5,76,'#1d2f38');r(x+2,80,2,55,'#61717a');}
        for(const x of [55,260]){r(x,89,3,37,'#867047');r(x-8,87,18,4,'#ecb765');r(x-4,92,10,4,'#d58d39');}
        r(0,143,320,37,'#685143');r(0,143,320,2,'#a78b65');
        for(let i=0;i<20;i++)r((i*47)%320,151+i*7%25,14,2,i%2?'#56453e':'#7c6250');
    }else if(id==='yacht'){
        r(0,0,320,180,'#406978');r(0,42,320,39,'#89b4b9');r(0,81,320,63,'#397b89');r(255,51,22,22,'#eed49c');
        for(let i=0;i<18;i++)r((i*43)%320,89+(i*7)%44,17+i%12,1,'#75a8ab');
        p([[72,103],[211,103],[190,118],[88,118]],'#d7d3bd');r(100,82,75,21,'#ded9c2');r(113,70,42,12,'#cfceb9');r(119,73,30,7,'#416477');r(106,89,60,9,'#355d70');r(156,62,2,20,'#c1c1ab');
        p([[0,134],[45,127],[90,135],[320,137],[320,180],[0,180]],'#bea57b');r(0,143,320,2,'#e4cba0');
        for(const x of [25,294]){r(x,72,5,61,'#725f48');p([[x+2,72],[x-22,67],[x-30,75],[x+1,70],[x+20,62],[x+31,68],[x+3,76],[x+19,85],[x+8,81]],'#35564c');}
        for(let i=0;i<45;i++)r((i*53)%320,149+(i*17)%29,3,1,'#a68e6e');
    }else if(id==='bar'){
        r(0,0,320,180,'#302c39');r(0,45,320,96,'#52434a');
        for(const x of [25,126,230]){r(x,55,65,62,'#242b39');r(x+3,58,59,55,'#343343');for(let j=0;j<3;j++){r(x,70+j*15,65,3,'#8a6b54');for(let k=0;k<6;k++){r(x+6+k*9,61+j*15,4,9,k%2?'#6e9087':'#af8868');r(x+7+k*9,58+j*15,2,3,'#9db3a0');}}}
        r(14,114,292,9,'#bd9366');r(18,123,284,20,'#694939');r(18,138,284,5,'#50372e');
        for(const x of [52,153,255]){r(x,126,19,4,'#b58b69');r(x+7,130,4,14,'#39323a');r(x+3,142,12,2,'#292832');r(x+8,42,2,15,'#7a6d69');p([[x+9,55],[x-1,63],[x+19,63]],'#dda96a');}
        r(0,144,320,36,'#453635');for(let y=150;y<180;y+=8)r(0,y,320,1,'#685044');for(let x=0;x<320;x+=40)r(x,144,1,36,'#352b2e');
    }else if(id==='castle'||id==='throne'){
        r(0,0,320,180,'#272b47');r(0,64,320,80,'#474865');r(236,48,22,22,'#c9c8cf');
        for(const x of [15,130,260]){r(x,78,44,66,'#66677b');for(let j=0;j<4;j++)r(x+j*12,69,8,12,'#77788a');r(x+15,93,14,30,'#2d304b');p([[x+15,93],[x+22,84],[x+29,93]],'#2d304b');}
        r(0,126,320,18,'#777585');for(let x=0;x<320;x+=18)r(x,119,11,10,'#888591');
        r(0,144,320,36,'#62616f');for(let y=145;y<180;y+=9){r(0,y,320,1,'#85828b');for(let x=(y%2)*12;x<320;x+=24)r(x,y,1,9,'#454654');}
        for(const x of [82,224]){r(x,100,3,31,'#7f695c');r(x-2,94,7,10,'#b5825e');r(x,91,3,10,'#d5ae78');}
    }else if(id==='hatchery'){
        r(0,0,320,180,'#171d31');r(0,73,320,71,'#202733');
        for(let x=0;x<320;x+=24){r(x,112,22,20,'#303747');r(x+5,110,2,3,'#50a9b4');}
        p([[105,136],[94,119],[104,96],[129,86],[187,86],[213,110],[215,136]],'#362633');
        p([[122,128],[113,96],[128,65],[138,102],[157,76],[175,101],[190,66],[200,98],[186,128]],'#765130');
        p([[139,128],[128,106],[142,88],[159,94],[174,87],[190,109],[180,128]],'#ac5736');
        for(const [x,y]of[[126,104],[145,95],[168,99],[181,113]]){r(x,y,7,10,'#c3c535');r(x+2,y+2,3,4,'#e2e84b');}
        for(const x of [33,66,247,281]){p([[x,135],[x-6,118],[x-1,109],[x+3,123],[x+8,115],[x+11,135]],'#3d6d9c');r(x,119,2,13,'#78b8d2');}
        r(0,144,320,36,'#262936');r(0,144,320,2,'#4e5365');
        for(let i=0;i<28;i++)r(i*47%320,150+i*7%27,8,1,i%3?'#35394a':'#46334b');
    }else if(id==='verse'){
        r(0,0,320,180,'#17172d');
        for(let i=0;i<50;i++)r((i*79)%320,25+i*17%100,1,1,i%3?'#827fc1':'#d9d6f1');
        c.strokeStyle='#69d5ef';c.lineWidth=7;c.beginPath();c.arc(160,76,39,0,Math.PI*2);c.stroke();
        c.strokeStyle='#7c6bc6';c.lineWidth=4;c.beginPath();c.arc(160,76,49,-2.9,-.2);c.stroke();
        for(const x of [13,60,230,285]){r(x,113,26,6,'#4f527b');p([[x,119],[x+26,119],[x+13,140]],'#2f3554');}
        r(0,144,320,36,'#363d5d');r(0,144,320,3,'#9697b2');r(0,172,320,3,'#94794c');
        for(let x=0;x<320;x+=32)r(x,147,1,26,'#202b46');
    }else{
        r(0,0,320,180,'#272541');r(0,65,320,79,'#443553');r(144,53,31,31,'#c38b9f');
        for(let i=0;i<10;i++){const x=i*35-6,h=26+(i*17)%45;r(x,134-h,25,h,'#292d43');r(x+4,130-h,2,h,'#74738b');for(let j=0;j<5;j++)r(x+8,138-h+j*7,12,2,j%2?'#9c7ca1':'#679b9c');}
        r(0,128,320,5,'#7c8ca0');r(0,135,320,9,'#34374c');r(0,144,320,36,'#262a3e');r(0,144,320,2,'#d786c0');
        for(let y=152;y<180;y+=9)r(0,y,320,1,'#5f547e');for(let x=-160;x<480;x+=40)p([[160,145],[x,180],[x+1,180]],'#5e557d');
        r(27,92,43,16,'#53536d');r(30,95,37,10,'#8e98a5');r(254,101,37,15,'#4d566b');r(257,104,31,9,'#ae8fa8');
    }
    r(0,0,320,42,'#11182799');return canvas;
}
