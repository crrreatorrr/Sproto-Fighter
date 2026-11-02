import type {StageId} from './stage';

export interface StoryLocation {id:string;stage:StageId;title:string;image:string;width:number;height:number}
/** Approved Higgsfield still panoramas. The original stage assets remain intact. */
export const STORY_LOCATIONS:readonly StoryLocation[]=[
  {
    "id": "00-trenches-drainage-floodgate",
    "stage": "trenches",
    "title": "Drainage floodgate",
    "image": "/stages/variations-v2/trenches/00-trenches-drainage-floodgate.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "01-trenches-sun-baked-scrapworks",
    "stage": "trenches",
    "title": "Sun-baked scrapworks",
    "image": "/stages/variations-v2/trenches/01-trenches-sun-baked-scrapworks.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "02-trenches-canal-underpass",
    "stage": "trenches",
    "title": "Canal underpass",
    "image": "/stages/variations-v2/trenches/02-trenches-canal-underpass.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "03-circuit-checkpoint-lockdown",
    "stage": "circuit",
    "title": "Checkpoint lockdown",
    "image": "/stages/variations-v2/circuit/03-circuit-checkpoint-lockdown.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "04-circuit-daylight-maglev-terminal",
    "stage": "circuit",
    "title": "Daylight maglev terminal",
    "image": "/stages/variations-v2/circuit/04-circuit-daylight-maglev-terminal.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "05-circuit-underground-control-bunker",
    "stage": "circuit",
    "title": "Underground control bunker",
    "image": "/stages/variations-v2/circuit/05-circuit-underground-control-bunker.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "06-midnight-market-alley",
    "stage": "retro",
    "title": "Midnight market alley",
    "image": "/stages/variations-v2/retro/06-midnight-market-alley.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "07-antenna-rooftop-at-dawn",
    "stage": "retro",
    "title": "Antenna rooftop at dawn",
    "image": "/stages/variations-v2/retro/07-antenna-rooftop-at-dawn.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "08-night-transit-tunnel",
    "stage": "retro",
    "title": "Night transit tunnel",
    "image": "/stages/variations-v2/retro/08-night-transit-tunnel.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "09-sunlit-cargo-pier",
    "stage": "yacht",
    "title": "Sunlit cargo pier",
    "image": "/stages/variations-v2/yacht/09-sunlit-cargo-pier.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "10-upper-deck-in-a-storm",
    "stage": "yacht",
    "title": "Upper deck in a storm",
    "image": "/stages/variations-v2/yacht/10-upper-deck-in-a-storm.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "11-grand-salon-after-dark",
    "stage": "yacht",
    "title": "Grand salon after dark",
    "image": "/stages/variations-v2/yacht/11-grand-salon-after-dark.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "12-throne-furnace-relay-vault",
    "stage": "throne",
    "title": "Furnace relay vault",
    "image": "/stages/variations-v2/throne/12-throne-furnace-relay-vault.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "13-throne-power-conduit-gallery",
    "stage": "throne",
    "title": "Power conduit gallery",
    "image": "/stages/variations-v2/throne/13-throne-power-conduit-gallery.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "14-throne-broken-crown-sanctuary",
    "stage": "throne",
    "title": "Broken crown sanctuary",
    "image": "/stages/variations-v2/throne/14-throne-broken-crown-sanctuary.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "15-castle-stained-glass-great-hall",
    "stage": "castle",
    "title": "Stained-glass great hall",
    "image": "/stages/variations-v2/castle/15-castle-stained-glass-great-hall.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "16-castle-smoky-armory-forge",
    "stage": "castle",
    "title": "Smoky armory forge",
    "image": "/stages/variations-v2/castle/16-castle-smoky-armory-forge.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "17-castle-snow-swept-battlements",
    "stage": "castle",
    "title": "Snow-swept battlements",
    "image": "/stages/variations-v2/castle/17-castle-snow-swept-battlements.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "18-verse-red-sun-asteroid-causeway",
    "stage": "verse",
    "title": "Red-sun asteroid causeway",
    "image": "/stages/variations-v2/verse/18-verse-red-sun-asteroid-causeway.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "19-verse-cosmic-crystal-cavern",
    "stage": "verse",
    "title": "Cosmic crystal cavern",
    "image": "/stages/variations-v2/verse/19-verse-cosmic-crystal-cavern.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "20-verse-beyond-the-dimensional-sea",
    "stage": "verse",
    "title": "Beyond the dimensional sea",
    "image": "/stages/variations-v2/verse/20-verse-beyond-the-dimensional-sea.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "21-ranch-lantern-lit-barn",
    "stage": "ranch",
    "title": "Lantern-lit barn",
    "image": "/stages/variations-v2/ranch/21-ranch-lantern-lit-barn.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "22-ranch-green-paddock-at-midday",
    "stage": "ranch",
    "title": "Green paddock at midday",
    "image": "/stages/variations-v2/ranch/22-ranch-green-paddock-at-midday.png",
    "width": 2688,
    "height": 1520
  },
  {
    "id": "23-ranch-dusty-farmhouse-yard",
    "stage": "ranch",
    "title": "Dusty farmhouse yard",
    "image": "/stages/variations-v2/ranch/23-ranch-dusty-farmhouse-yard.png",
    "width": 2688,
    "height": 1520
  }
];

const regionOrder:Partial<Record<StageId,readonly number[]>>={
 trenches:[0,1,2,21,22,23],
 circuit:[3,5,4,8,6,7],
 yacht:[9,10,11],
 throne:[15,16,17,12,13,14],
 verse:[18,19,20],
};
/** Scenery selection never reorders opponents or changes a saved encounter ID.
 * Contiguous location blocks make travel legible instead of randomizing backdrops.
 * Regions without variations (Bar and Hatchery) retain their original scenery. */
export function storyLocationForEncounter(encounter:{stage:StageId;index:number},route:readonly {stage:StageId;index:number}[]):StoryLocation|null {
 const pool=regionOrder[encounter.stage];if(!pool?.length)return null;
 const local=route.filter(e=>e.stage===encounter.stage),position=local.findIndex(e=>e.index===encounter.index);
 if(position<0)return null;
 return STORY_LOCATIONS[pool[Math.min(pool.length-1,Math.floor(position*pool.length/local.length))]];
}
const images=new Map<string,HTMLImageElement>();
const pending=new Map<string,Promise<void>>();
export function loadStoryLocation(location:StoryLocation):Promise<void>{
 if(images.has(location.id))return Promise.resolve();
 let load=pending.get(location.id);if(load)return load;
 load=new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>{images.set(location.id,image);resolve();};image.onerror=()=>reject(new Error(`Could not load story scenery: ${location.title}`));image.src=location.image;}).finally(()=>pending.delete(location.id));
 pending.set(location.id,load);return load;
}
/** All variants have a full-width floor around y=578. Reviewed in the lane lab.
 * Return false while unavailable so callers can keep the original stage visible. */
export function drawStoryLocation(ctx:CanvasRenderingContext2D,location:StoryLocation):boolean{
 const image=images.get(location.id);if(!image)return false;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,1280,720);ctx.restore();return true;
}

let activeStoryLocation:StoryLocation|null=null;
export function setActiveStoryLocation(location:StoryLocation|null){activeStoryLocation=location;}
export function drawActiveStoryLocation(ctx:CanvasRenderingContext2D){return activeStoryLocation?drawStoryLocation(ctx,activeStoryLocation):false;}
