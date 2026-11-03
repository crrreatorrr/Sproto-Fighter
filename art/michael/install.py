"""Add MICHAEL without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'michael-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'michael-{kind}';dest=ROOT/'public/fighters'/category/'michael';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['michael']=cfg
    if not manifest.get('revision','').endswith('-michael'):manifest['revision']=manifest.get('revision','expansion')+'-michael'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/sim/roster.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* MICHAEL '+tag+r' BEGIN \*/.*?/\* MICHAEL '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'michael'" not in line.group(1):s=s[:line.end()-1]+" | 'michael'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'michael'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'michael'"+s[line.end()-len('] as const;'):]
    roster='michael:{"name":"Michael D. Sproto - Chad Dev","color":"#fff5d4","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"RETAIN RALLY","role":"RETAIN","description":"Reference-based pixel art and a four-contact Retain Rally."},'
    s=s.replace('    duo: { name:', '/* MICHAEL ROSTER BEGIN */\n'+roster+'\n/* MICHAEL ROSTER END */\n    duo: { name:',1)
    kit=' michael:kit("RETAIN","RETAIN RALLY","Distinct strikes and a four-contact Retain Rally.",84,{range:138,damage:95},{startup:18,recovery:25,damage:60},{speed:14,shape:\'chadCoin\',horizontal:true,origin:{forward:47.5,height:95}},[15,27,39,51],{range:608,damage:78,push:4},1),'
    s=s.replace(' duo:kit(', '/* MICHAEL KIT BEGIN */\n'+kit+'\n/* MICHAEL KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* MICHAEL GRIP BEGIN */\nmichael:'+json.dumps(grips)+',\n/* MICHAEL GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* MICHAEL PORTRAIT BEGIN \*/.*?/\* MICHAEL PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* MICHAEL PORTRAIT BEGIN */\n michael:new URL('../art/michael/reference.png',import.meta.url).href,\n/* MICHAEL PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('MICHAEL installed: 32 combat poses, eight guarded walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
