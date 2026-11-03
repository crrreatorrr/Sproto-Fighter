import { drawPoseAtlas } from './poseAtlas';
import { type Fighter } from './core';
/**
 * Draw one fighter from its complete-body pose atlas. Every playable fighter
 * ships an atlas; while one is still loading (or failed, which startup reports)
 * nothing is drawn rather than an outdated placeholder.
 */
export function drawSprite(c:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false,frozen=false){
 drawPoseAtlas(c,f,frame,ghost,frozen);
}
