"""Add LEVIOSA without rebuilding or replacing the ongoing bulk roster expansion."""
import json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    pieces={k:json.loads((HERE/'processed'/f'leviosa-{k}'/'metadata.json').read_text()) for k in ['core','walk','events']}
    cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
    for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
        src=HERE/'processed'/f'leviosa-{kind}';dest=ROOT/'public/fighters'/category/'leviosa';dest.mkdir(parents=True,exist_ok=True)
        for p in src.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters']['leviosa']=cfg
    if not manifest.get('revision','').endswith('-leviosa'):manifest['revision']=manifest.get('revision','expansion')+'-leviosa'
    path.write_text(json.dumps(manifest,indent=2)+'\n')
    path=ROOT/'src/sim/roster.ts';s=path.read_text()
    for tag in ['ROSTER','KIT','GRIP']:
        s=re.sub(r'/\* LEVIOSA '+tag+r' BEGIN \*/.*?/\* LEVIOSA '+tag+r' END \*/\n','',s,flags=re.S)
    line=re.search(r'export type FighterId = (.*?);',s)
    if "'leviosa'" not in line.group(1):s=s[:line.end()-1]+" | 'leviosa'"+s[line.end()-1:]
    line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
    if "'leviosa'" not in line.group(1):s=s[:line.end()-len('] as const;')]+", 'leviosa'"+s[line.end()-len('] as const;'):]
    roster="leviosa:{name:'Bitcoinium Leviosa',color:'#ffed48',dark:'#163cc9',speed:5.5,jump:15.8,partner:'rivet',special:'LEVIOSA LIFT',role:'APLOMB',description:'Round blue head, yellow forelock, asymmetric arms and a four-contact Leviosa Lift.'},"
    s=s.replace('    duo: { name:', '/* LEVIOSA ROSTER BEGIN */\n'+roster+'\n/* LEVIOSA ROSTER END */\n    duo: { name:',1)
    kit=" leviosa:kit('APLOMB','LEVIOSA LIFT','Nimble steps, open palm strikes and a four-contact Leviosa Lift.',83,{range:134,damage:91},{startup:16,damage:60},{speed:13,shape:'orb'},[16,28,40,52],{range:555,damage:81,push:5},1),"
    s=s.replace(' duo:kit(', '/* LEVIOSA KIT BEGIN */\n'+kit+'\n/* LEVIOSA KIT END */\n duo:kit(',1)
    grips={}
    for part,slot in [('hand',26),('torso',24)]:
        anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
    # Kept outside generated SPROTOS blocks so later expansion installs retain it.
    key=s.index('"duo":',s.index('export const THROW_GRIPS:'))
    s=s[:key]+'/* LEVIOSA GRIP BEGIN */\nleviosa:'+json.dumps(grips)+',\n/* LEVIOSA GRIP END */\n'+s[key:]
    path.write_text(s)
    path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* LEVIOSA PORTRAIT BEGIN \*/.*?/\* LEVIOSA PORTRAIT END \*/\n','',s,flags=re.S)
    s=s.replace(' duo:new URL(',"/* LEVIOSA PORTRAIT BEGIN */\n leviosa:new URL('../art/leviosa/reference.png',import.meta.url).href,\n/* LEVIOSA PORTRAIT END */\n duo:new URL(",1);path.write_text(s)
    print('LEVIOSA installed: 32 combat poses, eight guarded walking frames and 32 event drawings. Visual review and runtime checks remain required.')

if __name__=='__main__':install()
