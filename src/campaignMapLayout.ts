import type {StageId} from './stage';
import type {Encounter} from './storyProgress';

export type MapPoint=readonly [number,number];
type MapEncounter=Pick<Encounter,'id'|'stage'>;
// Roads traced on the 1600 x 900 inspection preview of the approved expanded
// 3840 x 2160 map. Source PNG and the old map remain untouched. Coordinates are
// normalized below; the geometry supports extra encounters without adding them.
const roads:Partial<Record<StageId,readonly MapPoint[]>>={"trenches":[[493,869],[507,850],[513,831],[520,825],[522,815],[513,806],[500,799],[483,783],[473,760],[459,745],[445,739],[425,733],[402,729],[376,724],[350,721],[339,714],[333,705],[332,694],[340,682],[351,674],[355,661],[333,653],[312,644],[290,634],[270,625]],"circuit":[[700,680],[674,667],[622,649],[581,634],[534,614],[509,599],[502,584],[511,569],[534,556],[546,541],[548,528],[540,516],[523,507],[500,498],[466,496],[430,498],[397,498],[376,492],[361,483],[356,471],[361,459],[375,448],[396,441],[415,436]],"yacht":[[620,407],[656,385],[699,381],[746,391],[771,399],[794,403],[846,400],[889,407],[912,419],[945,425],[963,437],[965,447],[971,458],[980,466],[987,470],[987,478],[981,485],[967,491],[928,498],[899,512],[882,535],[859,545],[837,546],[805,537],[780,529]],"throne":[[922,133],[932,138],[938,145],[934,151],[926,156],[923,162],[909,166],[896,171],[885,178],[884,184],[901,191],[916,196],[930,197],[941,206],[941,218],[953,226],[977,232],[1000,228],[1018,219],[1028,207],[1030,194],[1044,201],[1064,209],[1080,216],[1101,223]],"bar":[[1090,429],[1125,423],[1150,410],[1165,389],[1180,375],[1190,368],[1215,370],[1245,367],[1274,367],[1305,371],[1330,368],[1350,358],[1360,345],[1352,332],[1325,325],[1298,323],[1272,315],[1247,308],[1223,299],[1204,288],[1196,276],[1213,263]],"verse":[[1262,254],[1300,238],[1341,223],[1385,208],[1425,194],[1444,190],[1466,185],[1468,180],[1461,174],[1449,168],[1439,163],[1426,159],[1414,154],[1409,148],[1410,139],[1415,132],[1427,124]],"hatchery":[[1455,114],[1468,115],[1480,118],[1490,120]]};
const percent=(point:MapPoint):MapPoint=>[point[0]/16,point[1]/9];

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
 const nodeRatio=Math.min(.01,.01*100/Math.max(1,points.length),gap*.9);
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
