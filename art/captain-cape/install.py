"""Add Captain Sproto without rebuilding or replacing the ongoing bulk roster expansion; install eye-aligned laser combat data."""
import json,re,shutil
import numpy as np
from PIL import Image
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
HERE=ROOT/'art/captain-cape'

def install():
    pieces={k:json.loads((HERE/'processed'/f'captain-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'captain-{kind}';dest=ROOT/'public/fighters'/category/'captain';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['captain']=cfg
    if not manifest.get('revision','').endswith('-captain'):manifest['revision']=manifest.get('revision','expansion')+'-captain'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    # Reviewed near-eye point in cast release cel14; the second beam begins 25 world pixels behind it.
    point=[147.0,123.0];emitter={'forward':round((point[0]-112)*cfg['scale'],3),'height':round((210-point[1])*cfg['scale'],3)}
    (HERE/'laser-origin.json').write_text(json.dumps(dict(point=point,world=emitter),indent=2)+'\n')
    path=ROOT/'src/sim/roster.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* CAPTAIN '+tag+r' BEGIN \*/.*?/\* CAPTAIN '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'captain'" not in line.group(1):s=s[:line.end()-1]+" | 'captain'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'captain'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'captain'"+s[line.end()-len('] as const;'):]
    roster="captain:{name:'Captain Sproto',color:'#ef473b',dark:'#243783',speed:5.5,jump:15.8,partner:'rivet',special:'SOLAR SALVO',role:'LASER CAPTAIN',description:'Eye-fired laser bolts and a flowing yellow cape, sturdy kicks and a four-contact Solar Salvo.'},"
    s=s.replace('    duo: { name:', '/* CAPTAIN ROSTER BEGIN */\n'+roster+'\n/* CAPTAIN ROSTER END */\n    duo: { name:',1)
    kit=" captain:kit('LASER CAPTAIN','SOLAR SALVO','Straight eye lasers and a driving four-contact Solar Salvo.',86,{range:132,damage:94},{startup:15,recovery:24,damage:64},{speed:22,shape:'eyeLaser',horizontal:true,origin:EMITTER},[15,25,37,49],{range:680,damage:73,push:4},2),"
    kit=kit.replace('EMITTER',json.dumps(emitter))
    s=s.replace(' duo:kit(', '/* CAPTAIN KIT BEGIN */\n'+kit+'\n/* CAPTAIN KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* CAPTAIN GRIP BEGIN */\ncaptain:'+json.dumps(grips)+',\n/* CAPTAIN GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* CAPTAIN PORTRAIT BEGIN \*/.*?/\* CAPTAIN PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* CAPTAIN PORTRAIT BEGIN */\n captain:new URL('../art/captain/reference.png',import.meta.url).href,\n/* CAPTAIN PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('Captain Sproto installed: 32 combat poses, eight walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
