"""Add MLK without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'mlk-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'mlk-{kind}';dest=ROOT/'public/fighters'/category/'mlk';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['mlk']=cfg
    if not manifest.get('revision','').endswith('-mlk'):manifest['revision']=manifest.get('revision','expansion')+'-mlk'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/core.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* MLK '+tag+r' BEGIN \*/.*?/\* MLK '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'mlk'" not in line.group(1):s=s[:line.end()-1]+" | 'mlk'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'mlk'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'mlk'"+s[line.end()-len('] as const;'):]
    roster='mlk:{"name":"Bitcoin MLK","color":"#c1a0ff","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"PURPLE RESOLVE","role":"RESOLVE","description":"Reference-based pixel art and a four-contact Purple Resolve."},'
    s=s.replace('    duo: { name:', '/* MLK ROSTER BEGIN */\n'+roster+'\n/* MLK ROSTER END */\n    duo: { name:',1)
    kit=' mlk:kit("RESOLVE","PURPLE RESOLVE","Distinct strikes and a four-contact Purple Resolve.",86,{range:144,damage:97},{startup:20,recovery:25,damage:62},{speed:16,shape:\'orb\'},[15,27,39,51],{range:632,damage:80,push:4},1),'
    s=s.replace(' duo:kit(', '/* MLK KIT BEGIN */\n'+kit+'\n/* MLK KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* MLK GRIP BEGIN */\nmlk:'+json.dumps(grips)+',\n/* MLK GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* MLK PORTRAIT BEGIN \*/.*?/\* MLK PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* MLK PORTRAIT BEGIN */\n mlk:new URL('../art/mlk/reference.png',import.meta.url).href,\n/* MLK PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('MLK installed: 32 combat poses, eight guarded walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
