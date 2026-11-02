"""Add RLARSSON without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'rlarsson-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'rlarsson-{kind}';dest=ROOT/'public/fighters'/category/'rlarsson';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['rlarsson']=cfg
    if not manifest.get('revision','').endswith('-rlarsson'):manifest['revision']=manifest.get('revision','expansion')+'-rlarsson'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/core.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* RLARSSON '+tag+r' BEGIN \*/.*?/\* RLARSSON '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'rlarsson'" not in line.group(1):s=s[:line.end()-1]+" | 'rlarsson'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'rlarsson'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'rlarsson'"+s[line.end()-len('] as const;'):]
    roster='rlarsson:{"name":"rlarsson.eth","color":"#f4df4f","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"ENS ENCORE","role":"STEADY","description":"Reference-based pixel art and a four-contact Ens Encore."},'
    s=s.replace('    duo: { name:', '/* RLARSSON ROSTER BEGIN */\n'+roster+'\n/* RLARSSON ROSTER END */\n    duo: { name:',1)
    kit=' rlarsson:kit("STEADY","ENS ENCORE","Distinct strikes and a four-contact Ens Encore.",82,{range:132,damage:93},{startup:16,recovery:25,damage:58},{speed:12,shape:\'ring\'},[15,27,39,51],{range:584,damage:76,push:4},1),'
    s=s.replace(' duo:kit(', '/* RLARSSON KIT BEGIN */\n'+kit+'\n/* RLARSSON KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* RLARSSON GRIP BEGIN */\nrlarsson:'+json.dumps(grips)+',\n/* RLARSSON GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* RLARSSON PORTRAIT BEGIN \*/.*?/\* RLARSSON PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* RLARSSON PORTRAIT BEGIN */\n rlarsson:new URL('../art/rlarsson/reference.png',import.meta.url).href,\n/* RLARSSON PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('RLARSSON installed: 32 combat poses, eight guarded walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
