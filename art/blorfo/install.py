"""Add BLORFO without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'blorfo-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'blorfo-{kind}';dest=ROOT/'public/fighters'/category/'blorfo';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['blorfo']=cfg
    if not manifest.get('revision','').endswith('-blorfo'):manifest['revision']=manifest.get('revision','expansion')+'-blorfo'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/core.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* BLORFO '+tag+r' BEGIN \*/.*?/\* BLORFO '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'blorfo'" not in line.group(1):s=s[:line.end()-1]+" | 'blorfo'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'blorfo'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'blorfo'"+s[line.end()-len('] as const;'):]
    roster='blorfo:{"name":"Blorfo","color":"#4658ef","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"BLORFO BREAK","role":"LONG REACH","description":"Reference-based pixel art and a four-contact Blorfo Break."},'
    s=s.replace('    duo: { name:', '/* BLORFO ROSTER BEGIN */\n'+roster+'\n/* BLORFO ROSTER END */\n    duo: { name:',1)
    kit=' blorfo:kit("LONG REACH","BLORFO BREAK","Distinct strikes and a four-contact Blorfo Break.",83,{range:135,damage:94},{startup:17,recovery:25,damage:59},{speed:13,shape:\'arrow\'},[15,27,39,51],{range:596,damage:77,push:4},1),'
    s=s.replace(' duo:kit(', '/* BLORFO KIT BEGIN */\n'+kit+'\n/* BLORFO KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* BLORFO GRIP BEGIN */\nblorfo:'+json.dumps(grips)+',\n/* BLORFO GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* BLORFO PORTRAIT BEGIN \*/.*?/\* BLORFO PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* BLORFO PORTRAIT BEGIN */\n blorfo:new URL('../art/blorfo/reference.png',import.meta.url).href,\n/* BLORFO PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('BLORFO installed: 32 combat poses, eight guarded walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
