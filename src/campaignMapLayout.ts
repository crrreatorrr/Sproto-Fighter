import type {StageId} from './stage';
import type {Encounter} from './storyProgress';

export type MapPoint=readonly [number,number];
type MapEncounter=Pick<Encounter,'id'|'stage'>;
// Roads traced on the 1200×675 review of the reference-based 3840×2160 expansion.
// Each chapter follows its own land paths and bridges; sea crossings are never invented.
const roads:Partial<Record<StageId,readonly MapPoint[]>>={"trenches":[[190,590],[250,579],[285,560],[270,535],[210,526],[165,536],[126,548],[88,535],[99,512],[145,496],[185,475],[219,450],[230,424],[214,398],[181,381],[127,386],[81,401],[43,386],[40,355],[65,331],[82,306],[66,286],[43,273],[46,251],[71,240],[99,233],[133,242],[166,257],[207,262],[237,250],[246,233],[226,218],[183,221],[145,208],[135,190],[159,171],[204,163],[251,174],[283,167],[302,151],[293,132],[263,120],[207,128],[159,143],[109,147],[66,162]],"circuit":[[259,321],[239,333],[246,347],[277,355],[311,362],[343,379],[365,395],[369,414],[399,433],[434,444],[469,456],[507,461],[541,450],[563,428],[544,421],[514,424],[485,418],[459,407],[429,400],[400,388],[373,374],[350,365]],"yacht":[[446,280],[464,269],[487,259],[511,258],[537,264],[554,276],[566,289],[575,293]],"ranch":[[778,563],[810,552],[831,527],[851,516],[873,510],[907,505],[940,496],[972,491],[1003,497],[1024,513],[1051,526],[1086,538],[1102,530],[1090,517],[1069,507],[1037,499],[1009,483],[988,470],[981,450],[968,433],[944,421],[914,413],[884,415],[865,423],[848,431],[826,435]],"throne":[[474,208],[505,205],[540,214],[563,200],[568,183],[550,166],[541,149],[557,137],[586,139],[613,149],[639,154],[666,155],[694,164],[719,173],[742,173],[771,166],[785,147],[770,137],[742,130],[719,118],[712,101],[694,88]],"bar":[[801,260],[817,280],[845,291],[870,289],[887,276],[905,271],[933,276],[964,290],[995,291],[1026,279],[1043,261],[1036,246],[1010,236],[985,222],[970,207],[948,200],[918,206],[891,221],[868,234],[837,244]],"hatchery":[[912,98],[895,105],[893,118],[908,124],[930,126],[950,125],[967,120],[962,108],[951,103],[936,104],[922,113],[920,122]],"verse":[[997,165],[1021,157],[1047,152],[1073,143],[1097,130],[1124,116],[1138,101],[1121,95],[1104,91],[1096,81],[1104,71]]};
const percent=(point:MapPoint):MapPoint=>[point[0]/12,point[1]/6.75];

/** Draw real road segments, never a straight connector across the sea. */
export function campaignMapPaths(route:readonly MapEncounter[]):MapPoint[][]{
 return [...new Set(route.map(e=>e.stage))].map(stage=>{
  const road=roads[stage];if(!road)throw new Error(`No campaign map route for ${stage}`);
  return road.map(percent);
 });
}

/** Keep dense routes legible: overview dots until numbered targets fit. */
export function campaignMapMarkerLayout(points:readonly MapPoint[]){
 let gap=Infinity;
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)gap=Math.min(gap,Math.hypot(points[i][0]-points[j][0],(points[i][1]-points[j][1])*9/16)/100);
 const nodeRatio=Math.min(.01,.01*100/Math.max(1,points.length),gap*.85);
 return {nodeRatio,minGapRatio:gap,detailWidth:Math.max(2400,24/gap)};
}

export function campaignMapPoints(route:readonly MapEncounter[]):MapPoint[]{
 const counts=new Map<StageId,number>(),seen=new Map<StageId,number>(),placements=new Map<StageId,MapPoint[]>();
 for(const encounter of route)counts.set(encounter.stage,(counts.get(encounter.stage)??0)+1);
 for(const [stage,count]of counts){
  const path=roads[stage];if(!path)throw new Error(`No campaign map route for ${stage}`);
  const lengths=path.slice(1).map((p,i)=>Math.hypot(p[0]-path[i][0],p[1]-path[i][1]));
  const total=lengths.reduce((a,b)=>a+b,0);
  const at=(fraction:number):MapPoint=>{
   let remaining=total*fraction;
   for(let i=0;i<lengths.length;i++){
    if(remaining<=lengths[i]||i===lengths.length-1){const t=remaining/lengths[i];return [path[i][0]+(path[i+1][0]-path[i][0])*t,path[i][1]+(path[i+1][1]-path[i][1])*t];}
    remaining-=lengths[i];
   }
   return path[0];
  };
  if(count===1){placements.set(stage,[percent(at(.5))]);continue;}
  let best:MapPoint[]=[],bestGap=-1;
  // Small end insets let a dense set of markers avoid bunching at a tight bend.
  // Every candidate remains on the traced road, in the original encounter order.
  for(let left=0;left<=10;left++)for(let right=0;right<=10;right++){
   const candidate=Array.from({length:count},(_,i)=>at((i+left/10)/(count-1+(left+right)/10)));
   let gap=Infinity;
   for(let i=0;i<count;i++)for(let j=i+1;j<count;j++)gap=Math.min(gap,Math.hypot(candidate[i][0]-candidate[j][0],candidate[i][1]-candidate[j][1]));
   if(gap>bestGap+1e-6){bestGap=gap;best=candidate;}
  }
  placements.set(stage,best.map(percent));
 }
 return route.map(encounter=>{
  const index=seen.get(encounter.stage)??0;seen.set(encounter.stage,index+1);
  return placements.get(encounter.stage)![index];
 });
}
