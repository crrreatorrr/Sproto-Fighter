from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
root=Path.cwd();out=root/'docs/evidence/movement-followup-20261102/paired-after';out.mkdir(parents=True,exist_ok=True);j=json.loads((root/'public/fighters/pose-atlas.json').read_text());pairs=json.loads((root/'docs/evidence/movement-followup-20261102/paired/sample-manifest.json').read_text())['pairs']
sets=[('ground',[('poses',n)for n in[0,1,12,15,16,17,18,19]]+[('walk',0),('walk',4),('dash',0),('dash',3),('heavy',1),('heavy',3),('heavy',4),('heavy',7)]),('air-special',[('poses',0),('jump',0),('jump',2),('jump',4),('airKick',0),('airKick',2),('airKick',3),('airKick',5)]+[('special',i)for i in range(8)])]
def lookup(c,seq,i):
 if seq=='poses':return c['frames'][i],'poses',i
 if seq=='walk':
  if c.get('walkFrames'):return c['walkFrames'][i%len(c['walkFrames'])],'walk',i%len(c['walkFrames'])
  n=[2,3,4,5][i%4];return c['frames'][n],'poses',n
 clip=c.get('clips',{}).get(seq)
 if clip:return clip[i],seq,i
 n={'dash':6,'jump':8 if i<3 else 9,'heavy':11 if i<3 else 12 if i<5 else 13,'airKick':22 if i<2 else 23 if i<4 else 9,'special':[29,29,30,29,30,29,31,13][i]}[seq]
 return c['frames'][n],'poses',n
record=[]
for pair in pairs:
 cells=[]
 for body in pair['bodies']:
  c=j['fighters'][body]
  for group,specs in sets:
   for seq,i in specs:
    e,actual,index=lookup(c,seq,i);a=e.get('anchor',c['anchor']);reg=c.get('clipRegistration',{}).get(actual,{});offset=reg.get('anchorOffset',[0,0]);a=[a[n]+offset[n]for n in range(2)];b=e['bounds'];scale=c['scale']*reg.get('pixelScale',1);box=[(b[0]-a[0])*scale,(b[1]-a[1])*scale,(b[2]-a[0])*scale,(b[3]-a[1])*scale]
    cells.append(dict(owner=pair['id'],body=body,group=group,label=f'{seq}:{i}',sequence=actual,index=index,url=e['url'],anchor=a,scale=scale,box=box,sha256=hashlib.sha256((root/'public'/e['url'].lstrip('/')).read_bytes()).hexdigest()))
 left=min(e['box'][0]for e in cells);top=min(e['box'][1]for e in cells);right=max(e['box'][2]for e in cells);bottom=max(e['box'][3]for e in cells)
 factor=min(1,236/(right-left),214/(bottom-top));rx=10-left*factor;fy=250-max(0,bottom)*factor
 for group,_ in sets:
  sheet=Image.new('RGB',(2048,1040),(22,29,40));d=ImageDraw.Draw(sheet)
  selected=[e for e in cells if e['group']==group]
  for k,e in enumerate(selected):
   x=(k%8)*256;y=(k//8)*260;d.rectangle((x,y,x+255,y+259),outline=(73,88,106));d.line((x,y+fy,x+255,y+fy),fill=(98,137,153));d.line((x+rx,y+35,x+rx,y+253),fill=(58,71,89));d.text((x+5,y+5),e['body'],fill='white');d.text((x+5,y+18),e['label']+f' / uniform view x{factor:.3f}',fill=(200,211,222))
   im=Image.open(root/'public'/e['url'].lstrip('/')).convert('RGBA');s=e['scale']*factor;im=im.resize((round(im.width*s),round(im.height*s)),Image.Resampling.NEAREST);panel=Image.new('RGBA',(256,260));panel.alpha_composite(im,(round(rx-e['anchor'][0]*s),round(fy-e['anchor'][1]*s)));sheet.paste(panel,(x,y),panel)
   e['viewFactor']=factor;e['page']=pair['id']+'-'+group+'.png';e['visualReview']='pending'
  sheet.save(out/(pair['id']+'-'+group+'.png'))
 record.extend(cells)
(out/'sample-manifest.json').write_text(json.dumps({'atlasSha256':hashlib.sha256((root/'public/fighters/pose-atlas.json').read_bytes()).hexdigest(),'scope':'Static original-facing sampling. One uniform display factor per pair, actual per-member atlas scales and anchors. No per-frame fitting. Not browser playback or pair composition approval.','pairs':pairs,'cells':record},indent=2)+'\n')
print(json.dumps({'pairs':len(pairs),'bodies':sum(len(p['bodies'])for p in pairs),'pages':len(pairs)*2,'observations':len(record)}))
