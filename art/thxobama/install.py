"""Add THXOBAMA without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'thxobama-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'thxobama-{kind}';dest=ROOT/'public/fighters'/category/'thxobama';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['thxobama']=cfg
    if not manifest.get('revision','').endswith('-thxobama'):manifest['revision']=manifest.get('revision','expansion')+'-thxobama'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/sim/roster.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* THXOBAMA '+tag+r' BEGIN \*/.*?/\* THXOBAMA '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'thxobama'" not in line.group(1):s=s[:line.end()-1]+" | 'thxobama'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'thxobama'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'thxobama'"+s[line.end()-len('] as const;'):]
    roster='thxobama:{"name":"thxObama","color":"#f5d83c","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"THANK YOU","role":"DRY WIT","description":"Reference-based pixel art and a four-contact Thank You."},'
    s=s.replace('    duo: { name:', '/* THXOBAMA ROSTER BEGIN */\n'+roster+'\n/* THXOBAMA ROSTER END */\n    duo: { name:',1)
    kit=' thxobama:kit("DRY WIT","THANK YOU","Distinct strikes and a four-contact Thank You.",81,{range:129,damage:92},{startup:15,recovery:25,damage:57},{speed:11,shape:\'prism\'},[15,27,39,51],{range:572,damage:75,push:4},1),'
    s=s.replace(' duo:kit(', '/* THXOBAMA KIT BEGIN */\n'+kit+'\n/* THXOBAMA KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* THXOBAMA GRIP BEGIN */\nthxobama:'+json.dumps(grips)+',\n/* THXOBAMA GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* THXOBAMA PORTRAIT BEGIN \*/.*?/\* THXOBAMA PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* THXOBAMA PORTRAIT BEGIN */\n thxobama:new URL('../art/thxobama/reference.png',import.meta.url).href,\n/* THXOBAMA PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('THXOBAMA installed: 32 combat poses, eight guarded walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
