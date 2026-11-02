from pathlib import Path
exec((Path(__file__).resolve().parent/'build_repairs.py').read_text().split('# Deliberate')[0])
# Per-source calibration, fixed throughout all32drawingframes. Derived from distinct head/eye and torso landmarks, never alphaheight.
FACTORS={'sproto832':.86,'sproto832-companion':.83,'sproto3235':.71,'sproto3235-companion':.82,'sproto3224':.82,'sproto3224-companion':.87,'sproto1499-companion':.88,'sproto1625-companion':.81,'gryph-companion':.80,'godmod3d':.79,'nosmileclown':.84}
patch={'schemaVersion':1,'note':'Merge clips by key into latest manifest. All original drawing cells retained, no generation or new articulated anatomy. One uniform scale perbodymotion source preserves32unique drawings.','bodies':{}};metrics=[]
def full_sheet(body,seqs,label,facing,dest):
 f=MANIFEST['fighters'][body];items=[('CORE 0',f['frames'][0])]+[(f'{seq}[{i}]',fr) for seq,fs in seqs.items() for i,fr in enumerate(fs)];w,h,cols=380,345,6;im=Image.new('RGBA',(w*cols,h*((len(items)+cols-1)//cols)+30),(24,29,39,255));d=ImageDraw.Draw(im);scale=f.get('scale',1.25);d.text((8,5),f'{body} {label} facing{facing:+} fixedworldscale{scale}; cyanroot/floor',font=FONT,fill='white')
 for n,(l,fr) in enumerate(items):
  x=n%cols*w;y=n//cols*h+30;src=read(fr);a=fr.get('anchor',f['anchor']);ox=x+180;oy=y+295;sz=(round(src.width*scale),round(src.height*scale));src=src.resize(sz,Image.Resampling.NEAREST);ax=a[0]*scale
  if facing<0:src=src.transpose(Image.Transpose.FLIP_LEFT_RIGHT);ax=sz[0]-ax
  im.alpha_composite(src,(round(ox-ax),round(oy-a[1]*scale)));d.line((x,oy,x+w,oy),fill=(35,115,130));d.line((ox,y+24,ox,oy),fill=(35,70,80));d.text((x+6,y+8),l,font=FONT,fill='white');d.text((x+6,y+315),Path(fr['url']).name,font=FONT,fill=(180,190,200))
 im.convert('RGB').save(dest)
def compact(body,new,dest):
 f=MANIFEST['fighters'][body];picks=[('jump',0),('jump',3),('heavy',3),('airKick',2),('dash',3),('victory',5)];items=[(f'CORE {i}',f['frames'][i]) for i in [0,8,18,23,6,31]]+[(f'BEFORE {seq}[{i}]',f['clips'][seq][i]) for seq,i in picks]+[(f'AFTER {seq}[{i}]',new[seq][i]) for seq,i in picks];w,h=340,345;im=Image.new('RGBA',(w*6,h*3),(24,29,39,255));d=ImageDraw.Draw(im);scale=f.get('scale',1.25)
 for n,(l,fr) in enumerate(items):
  x=n%6*w;y=n//6*h;src=read(fr);a=fr.get('anchor',f['anchor']);ox=x+180;oy=y+295;src=src.resize((round(src.width*scale),round(src.height*scale)),Image.Resampling.NEAREST);im.alpha_composite(src,(round(ox-a[0]*scale),round(oy-a[1]*scale)));d.line((x,oy,x+w,oy),fill=(35,115,130));d.line((ox,y+24,ox,oy),fill=(35,70,80));d.text((x+6,y+8),l,font=FONT,fill='white')
 im.convert('RGB').save(dest)
for body,s in FACTORS.items():
 f=MANIFEST['fighters'][body];new={};folder=ROOT/f'public/fighters/motion/{body}/scale-fix';folder.mkdir(parents=True,exist_ok=True)
 for seq in ['dash','jump','heavy','airKick','victory']:
  new[seq]=[]
  for i,old in enumerate(f['clips'][seq]):
   src=read(old);oa=old.get('anchor',f['anchor']);na=[176,274];fixed=src.transform((416,336),Image.Transform.AFFINE,(1/s,0,oa[0]-na[0]/s,0,1/s,oa[1]-na[1]/s),resample=Image.Resampling.NEAREST);dest=folder/Path(old['url']).name;fixed.save(dest)
   fr={**old,'url':'/'+str(dest.relative_to(ROOT/'public')),'width':416,'height':336,'anchor':na,'bounds':list(fixed.getbbox())}
   if 'contactHull' in old:fr['contactHull']=hull(fixed)
   new[seq].append(fr);metrics.append({'body':body,'sequence':seq,'index':i,'source':old['url'],'replacement':fr['url'],'factor':s,'sourceSHA256':hashlib.sha256((ROOT/'public'/old['url'].lstrip('/')).read_bytes()).hexdigest(),'bounds':fr['bounds'],'floorDeltaPx':fr['bounds'][3]-na[1],'minimumPaddingPx':min(fr['bounds'][0],fr['bounds'][1],416-fr['bounds'][2],336-fr['bounds'][3])})
 patch['bodies'][body]={'expectedClipUrls':{seq:[x['url'] for x in f['clips'][seq]] for seq in new},'replacements':{'clips':new}}
 compact(body,new,OUT/f'{body}-all-motion-candidate-compact.png')
 full_sheet(body,new,'AFTER',1,OUT/f'{body}-all-motion-after-right.png');full_sheet(body,new,'AFTER',-1,OUT/f'{body}-all-motion-after-left.png')
# sproto102 internallycoherent identityranged preservesall8drawings and sparks.
body='sproto102';f=MANIFEST['fighters'][body];s=.88;new=[];folder=ROOT/f'public/fighters/identity/{body}/scale-fix';folder.mkdir(parents=True,exist_ok=True)
for i,old in enumerate(f['clips']['ranged']):
 src=read(old);oa=old.get('anchor',f['anchor']);fixed=src.transform((416,336),Image.Transform.AFFINE,(1/s,0,oa[0]-176/s,0,1/s,oa[1]-274/s),resample=Image.Resampling.NEAREST);dest=folder/Path(old['url']).name;fixed.save(dest);fr={**old,'url':'/'+str(dest.relative_to(ROOT/'public')),'width':416,'height':336,'anchor':[176,274],'bounds':list(fixed.getbbox())};fr['contactHull']=hull(fixed);new.append(fr)
 metrics.append({'body':body,'sequence':'ranged','index':i,'source':old['url'],'replacement':fr['url'],'factor':s,'sourceSHA256':hashlib.sha256((ROOT/'public'/old['url'].lstrip('/')).read_bytes()).hexdigest(),'bounds':fr['bounds'],'floorDeltaPx':fr['bounds'][3]-274,'minimumPaddingPx':min(fr['bounds'][0],fr['bounds'][1],416-fr['bounds'][2],336-fr['bounds'][3])})
patch['bodies'][body]={'expectedClipUrls':{'ranged':[x['url'] for x in f['clips']['ranged']]},'replacements':{'clips':{'ranged':new}}}
sheet(body,'ranged',f['clips']['ranged'],new,OUT/f'{body}-ranged-scaled-candidate.png');full_sheet(body,{'ranged':new},'AFTER',1,OUT/f'{body}-ranged-after-right.png');full_sheet(body,{'ranged':new},'AFTER',-1,OUT/f'{body}-ranged-after-left.png')
json.dump(patch,open(OUT/'motion-manifest-patch.json','w'),indent=2);json.dump(metrics,open(OUT/'motion-correction-metrics.json','w'),indent=2)
print('Bodies',list(patch['bodies']),'changedmotioncells',len(metrics),'minimumPadding',min(x['minimumPaddingPx'] for x in metrics),'floorDeltas',sorted(set(x['floorDeltaPx'] for x in metrics)))
