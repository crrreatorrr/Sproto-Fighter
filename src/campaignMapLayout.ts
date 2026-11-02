import type {StageId} from './stage';
import type {Encounter} from './storyProgress';

type Point=readonly [number,number];
// Percent coordinates traced against the approved complete map. The final two
// markers sit beyond its portal; the Hatchery is deliberately a separate zone.
const roads:Partial<Record<StageId,readonly Point[]>>={
 trenches:[[25.4,95.8],[29.6,92],[29.6,90.8],[27,88.2],[22,89.5],[16.5,88.2],[18.4,86],[18.6,83.4],[17.1,81],[11.2,80.2],[7.8,76],[6.7,73.3],[10.6,69.4],[14.5,67.2],[17.4,67.4],[17.3,70.3]],
 circuit:[[18.6,72],[22.3,73.8],[26,74.7],[28.7,71.7],[29.9,68],[28.4,64.8],[26.3,59.7],[21.4,59.6],[16.3,59.7],[14.7,59.2],[13.5,57],[13.6,55],[16.1,53.4],[18.2,53.1]],
 yacht:[[39.3,48.8],[41.7,45.5],[45.2,44.3],[50.1,44.6],[52.6,46.7],[55.8,46.8],[58.6,45.9],[60.1,48.6],[60.4,51.4],[63.6,54.5],[66.6,58],[66.6,60.5],[63.3,63.1],[58,65.8],[55.1,70],[51.6,68.1],[48,65.5]],
 throne:[[57,21.1],[55.6,22.7],[53.9,25.3],[52.6,26.2],[53.3,27.4],[55.7,28.4],[56.7,30],[56.6,32],[60.1,34.1],[65.3,34.5],[66.8,32.7],[69.4,33.1],[71,36],[68.8,38.6],[69.7,41.7]],
 bar:[[71.8,43.3],[75.4,46.8],[78,46.6],[81.2,45.9],[84.6,47.3],[87,47.8],[89.5,46.3],[90,43.5],[88.1,40.6],[84.4,39.4],[81.2,37.7],[78.9,34.8]],
 verse:[[92.56,25],[92.12,22.8],[89.7,21.37],[87.17,19.72],[85.52,17.41],[85.85,15.1],[87.39,13.23],[89.7,12.24],[91.68,12.02],[93.55,13.23],[95.53,13.78]],
 hatchery:[[93.2,5.8],[97,5.8]],
};
export function campaignMapPoints(route:readonly Encounter[]):Point[]{
 return route.map(encounter=>{
  const local=route.filter(e=>e.stage===encounter.stage),index=local.findIndex(e=>e.id===encounter.id),path=roads[encounter.stage];
  if(!path)throw new Error(`No campaign map route for ${encounter.stage}`);
  const lengths=path.slice(1).map((p,i)=>Math.hypot((p[0]-path[i][0])*16/9,p[1]-path[i][1]));
  let remaining=lengths.reduce((a,b)=>a+b,0)*index/Math.max(1,local.length-1);
  for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]||i===lengths.length-1){const t=remaining/lengths[i];return [path[i][0]+(path[i+1][0]-path[i][0])*t,path[i][1]+(path[i+1][1]-path[i][1])*t];}remaining-=lengths[i];}
  return path[0];
 });
}

