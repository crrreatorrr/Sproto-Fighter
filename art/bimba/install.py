"""Add BIMBA without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'bimba-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'bimba-{kind}';dest=ROOT/'public/fighters'/category/'bimba';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['bimba']=cfg
    if not manifest.get('revision','').endswith('-bimba'):manifest['revision']=manifest.get('revision','expansion')+'-bimba'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/sim/roster.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* BIMBA '+tag+r' BEGIN \*/.*?/\* BIMBA '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'bimba'" not in line.group(1):s=s[:line.end()-1]+" | 'bimba'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'bimba'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'bimba'"+s[line.end()-len('] as const;'):]
    roster="bimba:{name:'BIMBA',color:'#ffd637',dark:'#2543aa',speed:5.5,jump:15.8,partner:'rivet',special:'GOLDEN ENTRANCE',role:'POISE',description:'Tall blue silhouette, broad yellow collar and composed four-contact choreography.'},"
    s=s.replace('    duo: { name:', '/* BIMBA ROSTER BEGIN */\n'+roster+'\n/* BIMBA ROSTER END */\n    duo: { name:',1)
    kit=" bimba:kit('POISE','GOLDEN ENTRANCE','Poised footwork, wide palm strikes and a four-contact Golden Entrance.',87,{range:138,damage:93},{startup:15,damage:52},{speed:9,shape:'spark'},[13,25,37,49],{range:525,damage:77,push:5},2),"
    s=s.replace(' duo:kit(', '/* BIMBA KIT BEGIN */\n'+kit+'\n/* BIMBA KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* BIMBA GRIP BEGIN */\nbimba:'+json.dumps(grips)+',\n/* BIMBA GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* BIMBA PORTRAIT BEGIN \*/.*?/\* BIMBA PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* BIMBA PORTRAIT BEGIN */\n bimba:new URL('../art/bimba/reference.png',import.meta.url).href,\n/* BIMBA PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('BIMBA installed: 32 combat poses, eight guarded walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
