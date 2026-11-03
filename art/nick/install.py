"""Add Nick without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'nick-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'nick-{kind}';dest=ROOT/'public/fighters'/category/'nick';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['nick']=cfg
    if not manifest.get('revision','').endswith('-nick'):manifest['revision']=manifest.get('revision','expansion')+'-nick'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/core.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* NICK '+tag+r' BEGIN \*/.*?/\* NICK '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'nick'" not in line.group(1):s=s[:line.end()-1]+" | 'nick'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'nick'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'nick'"+s[line.end()-len('] as const;'):]
    roster="nick:{name:'Nick',color:'#3158ee',dark:'#172763',speed:5.5,jump:15.8,partner:'rivet',special:'BARE KNUCKLE RUSH',role:'BARE HANDS',description:'Uncovered fingered hands, quick palm strikes and a four-contact rush.'},"
    s=s.replace('    duo: { name:', '/* NICK ROSTER BEGIN */\n'+roster+'\n/* NICK ROSTER END */\n    duo: { name:',1)
    kit=" nick:kit('BARE HANDS','BARE KNUCKLE RUSH','Uncovered hands, quick palm strikes and a driving four-contact rush.',84,{range:128,damage:92},{startup:14,damage:54},{speed:11,shape:'spark'},[13,23,35,47],{range:465,damage:76,push:4},3),"
    s=s.replace(' duo:kit(', '/* NICK KIT BEGIN */\n'+kit+'\n/* NICK KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* NICK GRIP BEGIN */\nnick:'+json.dumps(grips)+',\n/* NICK GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* NICK PORTRAIT BEGIN \*/.*?/\* NICK PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* NICK PORTRAIT BEGIN */\n nick:new URL('../art/nick/reference.png',import.meta.url).href,\n/* NICK PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('Nick installed: 32 combat poses, eight bare-handed walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
