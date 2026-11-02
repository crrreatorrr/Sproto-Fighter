"""Add GPM without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'gpm-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'gpm-{kind}';dest=ROOT/'public/fighters'/category/'gpm';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['gpm']=cfg
    if not manifest.get('revision','').endswith('-gpm'):manifest['revision']=manifest.get('revision','expansion')+'-gpm'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/core.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* GPM '+tag+r' BEGIN \*/.*?/\* GPM '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'gpm'" not in line.group(1):s=s[:line.end()-1]+" | 'gpm'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'gpm'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'gpm'"+s[line.end()-len('] as const;'):]
    roster="gpm:{name:'GPM',color:'#f9da38',dark:'#354ba6',speed:5.5,jump:15.8,partner:'rivet',special:'BRIGHT BURST',role:'BULWARK',description:'Round blue furry silhouette, yellow eye markings and a four-contact Bright Burst.'},"
    s=s.replace('    duo: { name:', '/* GPM ROSTER BEGIN */\n'+roster+'\n/* GPM ROSTER END */\n    duo: { name:',1)
    kit=" gpm:kit('BULWARK','BRIGHT BURST','Firm footwork, broad palm strikes and a four-contact Bright Burst.',89,{range:140,damage:98},{startup:18,damage:57},{speed:8,shape:'orb'},[16,27,39,51],{range:545,damage:79,push:5},1),"
    s=s.replace(' duo:kit(', '/* GPM KIT BEGIN */\n'+kit+'\n/* GPM KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* GPM GRIP BEGIN */\ngpm:'+json.dumps(grips)+',\n/* GPM GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* GPM PORTRAIT BEGIN \*/.*?/\* GPM PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* GPM PORTRAIT BEGIN */\n gpm:new URL('../art/gpm/reference.png',import.meta.url).href,\n/* GPM PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('GPM installed: 32 combat poses, eight guarded walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
