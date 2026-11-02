# Reproduction only: source URLs/geometry come from frozen original inputs.
from pathlib import Path
exec((Path(__file__).resolve().parent/'build_repairs.py').read_text().split('# Deliberate')[0])
f=MANIFEST['fighters']['guest12'];frames=json.loads(json.dumps(f['frames']));folder=ROOT/'public/fighters/poses/guest12/scale-fix';folder.mkdir(parents=True,exist_ok=True)
for slot,s in {8:1.28,9:1.17,22:1.33,23:1.33}.items():
    old=f['frames'][slot];src=read(old);oa=old.get('anchor',f['anchor'])
    fixed=src.transform((416,336),Image.Transform.AFFINE,(1/s,0,oa[0]-176/s,0,1/s,oa[1]-274/s),resample=Image.Resampling.NEAREST)
    dest=folder/Path(old['url']).name;fixed.save(dest)
    fr={**old,'url':'/'+str(dest.relative_to(ROOT/'public')),'width':416,'height':336,'anchor':[176,274],'bounds':list(fixed.getbbox())}
    if 'contactHull' in old:fr['contactHull']=hull(fixed)
    frames[slot]=fr
patch={'schemaVersion':1,'bodies':{'guest12':{'expectedFrameUrls':[x['url'] for x in f['frames']],'replacements':{'frames':frames}}}}
json.dump(patch,open(OUT/'guest12-preview-patch.json','w'),indent=2)
