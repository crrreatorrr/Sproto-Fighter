"""Add LIFEISAMEME without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'lifeisameme-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'lifeisameme-{kind}';dest=ROOT/'public/fighters'/category/'lifeisameme';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['lifeisameme']=cfg
    if not manifest.get('revision','').endswith('-lifeisameme'):manifest['revision']=manifest.get('revision','expansion')+'-lifeisameme'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/core.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* LIFEISAMEME '+tag+r' BEGIN \*/.*?/\* LIFEISAMEME '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'lifeisameme'" not in line.group(1):s=s[:line.end()-1]+" | 'lifeisameme'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'lifeisameme'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'lifeisameme'"+s[line.end()-len('] as const;'):]
    roster='lifeisameme:{"name":"Lifeisameme","color":"#ffe841","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"MEME MOMENT","role":"QUIRK","description":"Reference-based pixel art and a four-contact Meme Moment."},'
    s=s.replace('    duo: { name:', '/* LIFEISAMEME ROSTER BEGIN */\n'+roster+'\n/* LIFEISAMEME ROSTER END */\n    duo: { name:',1)
    kit=' lifeisameme:kit("QUIRK","MEME MOMENT","Distinct strikes and a four-contact Meme Moment.",80,{range:126,damage:91},{startup:14,recovery:25,damage:56},{speed:10,shape:\'orb\'},[15,27,39,51],{range:560,damage:74,push:4},1),'
    s=s.replace(' duo:kit(', '/* LIFEISAMEME KIT BEGIN */\n'+kit+'\n/* LIFEISAMEME KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* LIFEISAMEME GRIP BEGIN */\nlifeisameme:'+json.dumps(grips)+',\n/* LIFEISAMEME GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* LIFEISAMEME PORTRAIT BEGIN \*/.*?/\* LIFEISAMEME PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* LIFEISAMEME PORTRAIT BEGIN */\n lifeisameme:new URL('../art/lifeisameme/reference.png',import.meta.url).href,\n/* LIFEISAMEME PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('LIFEISAMEME installed: 32 combat poses, eight guarded walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
