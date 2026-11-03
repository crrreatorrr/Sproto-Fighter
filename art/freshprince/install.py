"""Add FRESHPRINCE without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'freshprince-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'freshprince-{kind}';dest=ROOT/'public/fighters'/category/'freshprince';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['freshprince']=cfg
    if not manifest.get('revision','').endswith('-freshprince'):manifest['revision']=manifest.get('revision','expansion')+'-freshprince'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/sim/roster.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* FRESHPRINCE '+tag+r' BEGIN \*/.*?/\* FRESHPRINCE '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'freshprince'" not in line.group(1):s=s[:line.end()-1]+" | 'freshprince'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'freshprince'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'freshprince'"+s[line.end()-len('] as const;'):]
    roster='freshprince:{"name":"FreshPrinceOfBellend","color":"#ffe963","dark":"#253783","speed":5.5,"jump":15.8,"partner":"rivet","special":"ROYAL REBOUND","role":"REGAL","description":"Reference-based pixel art and a four-contact Royal Rebound."},'
    s=s.replace('    duo: { name:', '/* FRESHPRINCE ROSTER BEGIN */\n'+roster+'\n/* FRESHPRINCE ROSTER END */\n    duo: { name:',1)
    kit=' freshprince:kit("REGAL","ROYAL REBOUND","Distinct strikes and a four-contact Royal Rebound.",85,{range:141,damage:96},{startup:19,recovery:25,damage:61},{speed:15,shape:\'pixel\'},[15,27,39,51],{range:620,damage:79,push:4},1),'
    s=s.replace(' duo:kit(', '/* FRESHPRINCE KIT BEGIN */\n'+kit+'\n/* FRESHPRINCE KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* FRESHPRINCE GRIP BEGIN */\nfreshprince:'+json.dumps(grips)+',\n/* FRESHPRINCE GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* FRESHPRINCE PORTRAIT BEGIN \*/.*?/\* FRESHPRINCE PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* FRESHPRINCE PORTRAIT BEGIN */\n freshprince:new URL('../art/freshprince/reference.png',import.meta.url).href,\n/* FRESHPRINCE PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('FRESHPRINCE installed: 32 combat poses, eight guarded walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
