"""Add Erik Stevens Sproto without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'erik-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'erik-{kind}';dest=ROOT/'public/fighters'/category/'erik';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['erik']=cfg
    if not manifest.get('revision','').endswith('-erik'):manifest['revision']=manifest.get('revision','expansion')+'-erik'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/sim/roster.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* ERIK '+tag+r' BEGIN \*/.*?/\* ERIK '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'erik'" not in line.group(1):s=s[:line.end()-1]+" | 'erik'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'erik'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'erik'"+s[line.end()-len('] as const;'):]
    roster="erik:{name:'Erik Stevens',color:'#f0c94d',dark:'#192944',speed:5.5,jump:15.8,partner:'rivet',special:'EXECUTIVE FINISH',role:'FORMAL',description:'Tailored navy suit, yellow dress shirt and red tie; composed strikes and a four-contact finish.'},"
    s=s.replace('    duo: { name:', '/* ERIK ROSTER BEGIN */\n'+roster+'\n/* ERIK ROSTER END */\n    duo: { name:',1)
    kit=" erik:kit('FORMAL','EXECUTIVE FINISH','Composed formal footwork, precise strikes and a four-contact Executive Finish.',90,{range:136,damage:96},{startup:16,damage:55},{speed:10,shape:'spark'},[14,24,36,48],{range:510,damage:81,push:5},2),"
    s=s.replace(' duo:kit(', '/* ERIK KIT BEGIN */\n'+kit+'\n/* ERIK KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* ERIK GRIP BEGIN */\nerik:'+json.dumps(grips)+',\n/* ERIK GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* ERIK PORTRAIT BEGIN \*/.*?/\* ERIK PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* ERIK PORTRAIT BEGIN */\n erik:new URL('../art/erik/reference.png',import.meta.url).href,\n/* ERIK PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('Erik Stevens Sproto installed: 32 combat poses, eight formal-suit walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
