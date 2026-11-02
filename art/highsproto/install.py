"""Add High Sproto without rebuilding or replacing the ongoing bulk roster expansion; install hand-aligned joint projectile data."""
import json,re,shutil
import numpy as np
from PIL import Image
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'highsproto-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'highsproto-{kind}';dest=ROOT/'public/fighters'/category/'highsproto';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['highsproto']=cfg
    if not manifest.get('revision','').endswith('-highsproto'):manifest['revision']=manifest.get('revision','expansion')+'-highsproto'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    release=Image.open(HERE/'processed/highsproto-events/14.png');mask=np.array(release.getchannel('A'))>0;yy,xx=np.where(mask);edge=xx>=max(xx)-5
    point=[float(np.median(xx[edge])),float(np.median(yy[edge]))];emitter={'forward':round((point[0]-112)*cfg['scale'],3),'height':round((210-point[1])*cfg['scale'],3)}
    (HERE/'joint-origin.json').write_text(json.dumps(dict(point=point,world=emitter),indent=2)+'\n')
    path=ROOT/'src/core.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* HIGHSPROTO '+tag+r' BEGIN \*/.*?/\* HIGHSPROTO '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'highsproto'" not in line.group(1):s=s[:line.end()-1]+" | 'highsproto'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'highsproto'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'highsproto'"+s[line.end()-len('] as const;'):]
    roster="highsproto:{name:'High Sproto',color:'#79a9e8',dark:'#243458',speed:5.5,jump:15.8,partner:'rivet',special:'SMOKE SIGNAL',role:'SMOKE SHOT',description:'Finger-flick joint shots, relaxed footwork and a four-contact Smoke Signal.'},"
    s=s.replace('    duo: { name:', '/* HIGHSPROTO ROSTER BEGIN */\n'+roster+'\n/* HIGHSPROTO ROSTER END */\n    duo: { name:',1)
    kit=" highsproto:kit('SMOKE SHOT','SMOKE SIGNAL','Straight joint shots from a finger flick and a four-contact Smoke Signal.',88,{range:129,damage:89},{startup:17,recovery:26,damage:58},{speed:12,shape:'joint',horizontal:true,origin:EMITTER},[16,28,40,52],{range:560,damage:74,push:4},1),"
    kit=kit.replace('EMITTER',json.dumps(emitter))
    s=s.replace(' duo:kit(', '/* HIGHSPROTO KIT BEGIN */\n'+kit+'\n/* HIGHSPROTO KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* HIGHSPROTO GRIP BEGIN */\nhighsproto:'+json.dumps(grips)+',\n/* HIGHSPROTO GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* HIGHSPROTO PORTRAIT BEGIN \*/.*?/\* HIGHSPROTO PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* HIGHSPROTO PORTRAIT BEGIN */\n highsproto:new URL('../art/highsproto/reference.png',import.meta.url).href,\n/* HIGHSPROTO PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('High Sproto installed: 32 combat poses, eight walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
