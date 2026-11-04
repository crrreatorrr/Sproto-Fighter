/** Size the full map inside its window before applying user zoom. */
export function campaignMapViewport(width:number,height:number,zoomPercent=100){
 const availableWidth=Math.max(1,width-24),availableHeight=Math.max(1,height-24);
 const fitWidth=Math.min(availableWidth,availableHeight*16/9);
 const maxZoom=Math.max(400,Math.ceil(7680/fitWidth*4)*25);
 const zoom=Math.max(100,Math.min(maxZoom,zoomPercent));
 const mapWidth=fitWidth*zoom/100;
 return {fitWidth,maxZoom,zoom,width:mapWidth,height:mapWidth*9/16,
  nodeSize:Math.max(3,mapWidth/100),nodeFont:Math.max(10,mapWidth/230),overview:mapWidth<1800};
}
