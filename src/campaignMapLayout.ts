import type {StageId} from './stage';
import type {Encounter} from './storyProgress';

export type MapPoint=readonly [number,number];
type MapEncounter=Pick<Encounter,'id'|'stage'>;
// Roads traced on the 1600x900 preview of the improved 3840x2160 map.
// Ranch is a separate middle chapter; Club, Hatchery and Verse have distinct roads.
const roads:Partial<Record<StageId,readonly MapPoint[]>>={"trenches":[[480,879],[505,866],[519,850],[516,837],[503,825],[482,819],[455,814],[429,809],[405,803],[378,790],[352,776],[330,760],[315,740],[303,719],[286,700],[264,688],[242,683],[220,685],[198,692],[176,701],[154,715],[136,731],[122,748],[108,770]],"circuit":[[700,663],[674,652],[641,640],[609,628],[577,616],[547,606],[521,598],[506,589],[505,580],[516,572],[532,564],[544,553],[547,540],[538,526],[519,512],[494,501],[466,495],[433,494],[403,492],[380,487],[365,479],[359,470],[366,460],[384,451],[407,444]],"yacht":[[633,406],[657,390],[685,387],[715,391],[744,399],[771,401],[803,397],[839,393],[875,394],[910,406],[937,416],[955,430],[964,448],[966,465],[970,475],[983,488],[963,495],[936,499],[912,507],[894,525],[873,541],[849,548],[826,545],[805,536],[779,531]],"ranch":[[1047,742],[1062,720],[1070,699],[1057,687],[1046,672],[1044,654],[1056,637],[1074,623],[1095,612],[1113,600],[1123,586],[1117,571],[1105,558],[1103,544],[1111,533],[1128,531],[1154,539],[1186,550],[1223,559],[1252,570],[1272,581],[1295,588],[1323,595],[1353,602],[1379,613],[1395,627],[1401,646],[1395,665],[1384,682],[1370,694],[1351,703],[1327,710],[1305,724],[1295,741],[1299,755],[1312,768]],"throne":[[912,146],[892,154],[879,164],[883,176],[902,185],[923,190],[941,199],[949,215],[964,223],[985,229],[1006,224],[1025,216],[1037,203],[1054,211],[1076,219],[1098,228],[1125,226],[1141,217],[1150,205],[1145,191],[1133,180],[1128,165]],"bar":[[1098,430],[1136,424],[1163,412],[1182,395],[1193,381],[1213,377],[1244,372],[1275,366],[1308,362],[1341,358],[1372,352],[1404,348],[1427,342],[1439,331],[1434,319],[1420,309]],"hatchery":[[1209,177],[1227,178],[1246,181],[1264,185],[1285,190],[1296,200],[1288,211],[1272,215],[1253,213],[1234,212],[1218,215],[1212,226],[1218,238],[1231,245],[1250,248],[1268,246],[1289,241],[1310,235],[1330,230],[1349,221],[1360,210],[1362,199]],"verse":[[1382,207],[1402,196],[1425,189],[1445,181],[1455,172],[1451,162],[1436,153],[1417,148],[1404,141],[1405,132],[1421,122],[1443,116],[1460,108]]};
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
