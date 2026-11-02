"""Install complete expansion art and requested existing-roster revisions.

Preserve existing fighters and changes. Generated blocks are idempotent; runtime
pair logic and lazy loading live in TypeScript, not in generated per-fighter code.
"""
import json,re,shutil,sys,hashlib
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def install():
    inventory=json.loads((HERE/'inventory.json').read_text());expansion_ids={r['id'] for r in inventory if not r.get('preserveGameplay')};configs={};missing=[]
    for ref in inventory:
        for body in ref['entities']:
            ident=body['id'];kinds=['core','walk','events']+(['motion'] if len(ref['entities'])>=2 or ref.get('extraMotion') else [])+(['assist'] if ref.get('extraAssist') else [])
            pieces={}
            for kind in kinds:
                path=HERE/'processed'/f'{ident}-{kind}'/'metadata.json'
                if not path.exists():missing.append(f'{ident}/{kind}');continue
                pieces[kind]=json.loads(path.read_text())
            if len(pieces)!=len(kinds):continue
            cfg=pieces['core'];cfg['scale']=body.get('scale',cfg.get('scale',1.25));cfg['locomotion']=ref.get('locomotion','ground');cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
            if 'motion' in pieces:cfg['clips'].update(pieces['motion']['clips'])
            if 'assist' in pieces:cfg['clips'].update(pieces['assist']['clips'])
            configs[ident]=cfg
    if missing and '--available' not in sys.argv:raise SystemExit('Not installed; missing '+str(len(missing))+' sets: '+', '.join(missing[:20]))
    inventory=[r for r in inventory if all(b['id'] in configs for b in r['entities'])]
    configs={b['id']:configs[b['id']] for r in inventory for b in r['entities']}
    for ident,cfg in configs.items():
        for kind,category in [('core','poses'),('walk','walk'),('events','events'),('motion','motion'),('assist','assist')]:
            source=HERE/'processed'/f'{ident}-{kind}'
            if not source.exists():continue
            dest=ROOT/'public/fighters'/category/ident;dest.mkdir(parents=True,exist_ok=True)
            for p in source.glob('[0-9][0-9].png'):shutil.copy2(p,dest/p.name)
    manifest_path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(manifest_path.read_text());
    for ident,cfg in configs.items():
        cfg['clips'].update({k:v for k,v in manifest['fighters'].get(ident,{}).get('clips',{}).items() if k in ('entrance','death','ranged')})
    manifest['fighters'].update(configs);manifest['fighters'].pop('sproto313-companion',None);manifest['fighters'].pop('sproto1870-companion',None);manifest['fighters'].pop('sproto999-companion',None);manifest['revision']='sprotos-'+hashlib.sha256(''.join(hashlib.sha256((ROOT/'public'/entry['url'].lstrip('/')).read_bytes()).hexdigest() for cfg in configs.values() for entry in cfg['frames']+cfg['walkFrames']+[f for clip in cfg['clips'].values() for f in clip]).encode()).hexdigest()[:12]
    manifest['fighters'].pop('sproto3181-companion2',None)
    manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
    core_path=ROOT/'src/core.ts';core=core_path.read_text()
    # Existing roster art revisions retain their kits, order and portrait entries.
    for ref in inventory:
        if not ref.get('preserveGameplay'):continue
        ident=ref['id'];cfg=configs[ident];points={}
        for part,slot in [('hand',26),('torso',24)]:
            anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part]
            points[part]=[(p[0]-anchor[0])*cfg['scale'],(p[1]-anchor[1])*cfg['scale']]
        pattern=r'(?:[\"\']?'+re.escape(ident)+r'[\"\']?):\s*\{\s*"hand":\s*\[[^\]]+\],\s*"torso":\s*\[[^\]]+\]\s*\}'
        core,n=re.subn(pattern,'"'+ident+'":'+json.dumps(points),core)
        if n!=1:raise RuntimeError(f'Expected one existing grip record for {ident}, got {n}')
    inventory=[r for r in inventory if not r.get('preserveGameplay')]
    # Strip only this tool's prior generated declarations, if installed before.
    core=re.sub(r'\n/\* SPROTOS (?:TYPE|ROSTER|KITS|GRIPS|PAIRS) BEGIN \*/.*?/\* SPROTOS (?:TYPE|ROSTER|KITS|GRIPS|PAIRS) END \*/\n','\n',core,flags=re.S)
    ids=[r['id'] for r in inventory]
    line=re.search(r'export type FighterId = (.*?);',core).group(1)
    if 'SprotoFighterId' not in line:core=core.replace('export type FighterId = '+line+';','export type FighterId = '+line+' | SprotoFighterId;')
    typeblock='\n/* SPROTOS TYPE BEGIN */\nexport type SprotoFighterId = '+' | '.join(repr(x) for x in ids)+';\n/* SPROTOS TYPE END */\n'
    core=core.replace('export type FighterId',typeblock+'export type FighterId',1)
    playable=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',core)
    old=[x for x in re.findall(r"'([^']+)'",playable.group(1)) if not x.startswith('sproto') and x not in expansion_ids]
    core=core[:playable.start()]+'export const PLAYABLE_FIGHTERS = '+repr(old+ids)+' as const;'+core[playable.end():]
    # Explicit keys keep the serializable core self-contained for deterministic
    # replay tools and the existing data-URL test harness.
    entries=[];kits=[];grips=[];pairs={};pair_grips={};spacings={}
    for i,ref in enumerate(inventory):
        ident=ref['id'];twin=len(ref['entities'])>=2;n=ref['number'];name=f'TWIN FUSION {n}' if twin else f'SPROTO BURST {n}'
        color='#b59aff' if n in [215,2789,3152] else '#ff655e' if n in [282,763,3106] else '#ffe168' if n in [1668,3215] else '#60aaff'
        if ident=='vaudream':name='DREAM SURGE'
        elif ref.get('weapon')=='microphone':name='MIC CHECK'
        elif ref.get('power')=='retain':name='RETAIN SCREAM'
        elif ref.get('power')=='pelvicStream':name='GOLDEN STREAM'
        elif ref.get('weapon')=='halberd':name=f'HALBERD TEMPEST {n}'
        elif ref.get('weapon'):name=f'STAFF TEMPEST {n}'
        elif len(ref['entities'])==3:name=f'TRIPLE SURGE {n}'
        elif ref.get('locomotion')=='hover':name=f'FLOATING SURGE {n}'
        data=dict(name=ref['name'],color=color,dark='#263c64',speed=5.5,jump=15.8,partner=ref.get('partner','rivet'),special=name,role='DUET' if twin else 'SKIRMISH',description='Two separate animated bodies with one health pool and alternating contacts.' if twin else 'Reference-based full-body pixel art; shared controls and individual combat profile.')
        if ref.get('specialPartners'):data['specialPartners']=ref['specialPartners']
        if ident=='vaudream':data.update(role='HOVER',description='Legless floating machine: hover glides, chassis rams and screen casts.')
        elif ref.get('locomotion')=='hover':data.update(role='HOVER',description='One legless floating Sproto with hovering glides and head rams.')
        elif ref.get('weapon')=='microphone':data.update(role='MC',description='Microphone jabs, overhead mic swings and vocal casts.')
        elif ref.get('power')=='retain':data.update(role='SHOUT',description='RETAIN scream sends readable words horizontally across the arena.')
        elif ref.get('power')=='pelvicStream':data.update(role='STREAM',description='A comic yellow stream fires from the covered pelvis, with a four-pulse Golden Stream finish.')
        elif ref.get('power')=='miniSproto':data.update(role='SPITTER',description='Sharp white eyes and red boxing gloves; spits a complete miniature Sproto from the mouth.')
        elif ref.get('power')=='referenceB':data.update(role='THROWER',description='Throws the exact yellow, red-accented B from the supplied original reference.')
        elif ref.get('power')=='yellowEight':data.update(role='THROWER',description='Hand-thrown yellow 8s, a heavy kick and a four-contact ranged relay.')
        elif ref.get('weapon')=='halberd':data.update(role='HALBERD',description='Hooked halberd thrusts, overhead swings, low sweeps and aerial strikes.')
        elif ref.get('weapon'):data.update(role='STAFF',description='Full-length staff thrusts, overhead swings, low sweeps and aerial strikes.')
        elif len(ref['entities'])==3:data.update(role='TRIO',description='Three separate bodies share one health pool and alternate attack contacts.')
        entries.append(ident+': '+json.dumps(data)+',')
        signature='Coordinated alternating strikes and an acrobatic companion finish.' if twin else 'Guarded footwork, a heavy kick and four-contact ranged relay.'
        if ident=='vaudream':signature='Legless hovering machine with chassis rams, aerial banks and a four-contact Dream Surge.'
        elif ref.get('locomotion')=='hover':signature='One legless floating Sproto: hover glides, banks and body-ram strikes.'
        elif ref.get('weapon')=='microphone':signature='Microphone jabs, swings and aerial mic strikes, with vocal casts.'
        elif ref.get('power')=='retain':signature='RETAIN scream: I fires the word horizontally; special sends four vocal bursts.'
        elif ref.get('power')=='pelvicStream':signature='Pelvic-origin yellow stream; Golden Stream delivers four coordinated pulses.'
        elif ref.get('power')=='miniSproto':signature='Mouth-spit releases a miniature Sproto; boxing gloves and sharp white eyes retain the reference identity.'
        elif ref.get('power')=='referenceB':signature='Hand windup releases the original yellow B, retaining its tilted serif shape, red accents and black outline.'
        elif ref.get('power')=='yellowEight':signature='Hand windup throws a bright yellow 8, with a heavy kick and four-contact relay.'
        elif ref.get('weapon')=='halberd':signature='Full-length hooked halberd thrusts, overhead swings, low sweeps and airborne strikes.'
        elif ref.get('weapon'):signature='Full-length staff thrusts, overhead swings, low sweeps and airborne staff strikes.'
        elif len(ref['entities'])==3:signature='Three separate Sprotos coordinate alternating contacts with one shared health bar.'
        elif ref.get('meleeStyle')=='bellyMonster':signature='Attached stomach monster swells, lunges and bites in place of blue actor kicks; the small yellow partner covers.'
        elif ident=='sproto313':signature='One connected Sproto with two faces; one body, shared combat controls.'
        shot={'speed':9+i%4,'shape':'twin' if twin else 'spark'}
        if ref.get('power')=='retain':shot.update(speed=11,shape='retain',horizontal=True,origin={'forward':110,'height':95})
        if ref.get('power')=='pelvicStream':shot.update(speed=11,shape='pelvicStream',horizontal=True,origin={'forward':30,'height':50})
        if ref.get('power')=='miniSproto':shot.update(shape='miniSproto',horizontal=True,origin=ref.get('projectileOrigin',{'forward':50,'height':100}))
        if ref.get('power')=='referenceB':shot.update(shape='referenceB',origin=ref.get('projectileOrigin',{'forward':86.25,'height':106.25}))
        if ref.get('power')=='yellowEight':shot.update(shape='yellowEight',origin=ref.get('projectileOrigin',{'forward':77.5,'height':105}))
        kits.append(f" {ident}:kit({data['role']!r},{name!r},{signature!r},82,{{range:{125+i%20},damage:{78+i}}},{{startup:{13+i%7},damage:{46+i%13}}},{json.dumps(shot)},[14,24,36,48],{{range:{440+i},damage:{61+i},push:3}},2),")
        cfg=configs[ident]
        def grip(config,part):
            slot=26 if part=='hand' else 24;anchor=config['frames'][slot].get('anchor',config['anchor']);p=config['holdContact'][part];return [(p[0]-anchor[0])*config['scale'],(p[1]-anchor[1])*config['scale']]
        grips.append(ident+':'+json.dumps({p:grip(cfg,p) for p in ['hand','torso']})+',')
        if twin:
            companion=ref['entities'][-1]['id'];pairs[ident]=[b['id'] for b in ref['entities']];spacings[ident]=ref.get('bodySpacing',144)
            pair_grips[ident]={str(face):{p:[ref.get('bodySpacing',144)*(len(ref['entities'])-1)/2+grip(configs[companion if face==1 else ident],p)[0],grip(configs[companion if face==1 else ident],p)[1]] for p in ['hand','torso']} for face in [-1,1]}
    roster_marker='    duo: { name:'
    core=core.replace(roster_marker,'/* SPROTOS ROSTER BEGIN */\n'+ '\n'.join(entries)+'\n/* SPROTOS ROSTER END */\n'+roster_marker,1)
    core=core.replace(' duo:kit(', '/* SPROTOS KITS BEGIN */\n'+'\n'.join(kits)+'\n/* SPROTOS KITS END */\n duo:kit(',1)
    grip_start=core.index('export const THROW_GRIPS:');brace=core.index(' = {',grip_start)+4
    core=core[:brace]+'\n/* SPROTOS GRIPS BEGIN */\n'+'\n'.join(grips)+'\n/* SPROTOS GRIPS END */\n'+core[brace:]
    block='\n/* SPROTOS PAIRS BEGIN */\nexport const PAIRED_BODY_IDS:Partial<Record<FighterId,readonly string[]>> = '+json.dumps({'duo':['duo','duo-blue'],**pairs})+';\nexport const BODY_SPACING:Partial<Record<FighterId,number>> = '+json.dumps(spacings)+';\nexport const bodyAtlasIds=(id:FighterId):readonly string[]=>PAIRED_BODY_IDS[id]??[id];\nexport const isPairedFighter=(id:FighterId)=>!!PAIRED_BODY_IDS[id];\nexport const bodyOffsets=(id:FighterId)=>bodyAtlasIds(id).map((_,i)=>(i-(bodyAtlasIds(id).length-1)/2)*(BODY_SPACING[id]??144));\nconst EXPANSION_PAIR_GRIPS:Partial<Record<FighterId,Record<string,{hand:[number,number];torso:[number,number]}>>> = '+json.dumps(pair_grips)+';\n/* SPROTOS PAIRS END */\n'
    core=core.replace('export const DUO_SPREAD = 72;',block+'export const DUO_SPREAD = 72;',1)
    core=core.replace("id==='duo'?DUO_SPREAD:0","(bodyAtlasIds(id).length-1)*DUO_SPREAD").replace("isPairedFighter(id)?DUO_SPREAD:0","(bodyAtlasIds(id).length-1)*DUO_SPREAD")
    if 'const pair=EXPANSION_PAIR_GRIPS' not in core:
        core=core.replace("    if(f.id!=='duo')return THROW_GRIPS[f.id][part];","    const pair=EXPANSION_PAIR_GRIPS[f.id];if(pair)return pair[String(f.facing)][part];\n    if(f.id!=='duo')return THROW_GRIPS[f.id][part];")
    core=core.replace("if(f.id==='duo'&&!m.projectile", "if(isPairedFighter(f.id)&&!m.projectile")
    core=core.replace("f.id==='duo'?{forward:DUO_SPREAD+65,height:75}","isPairedFighter(f.id)?{forward:DUO_SPREAD+65,height:75}")
    core=core.replace('m.range+=DUO_SPREAD','m.range+=bodySpread(f.id)').replace('forward:DUO_SPREAD+65','forward:bodySpread(f.id)+65')
    core=core.replace('(bodyAtlasIds(id).length-1)*DUO_SPREAD','(bodyAtlasIds(id).length-1)*(BODY_SPACING[id]??144)/2')
    core_path.write_text(core)
    portrait_path=ROOT/'src/originalPortraits.ts';portrait=portrait_path.read_text();portrait=re.sub(r'/\* SPROTOS PORTRAITS BEGIN \*/.*?/\* SPROTOS PORTRAITS END \*/\n','',portrait,flags=re.S)
    portrait=portrait.replace(' = {',' = {\n/* SPROTOS PORTRAITS BEGIN */\n'+'\n'.join(f" {r['id']}:new URL('../{r['reference']}',import.meta.url).href," for r in inventory)+'\n/* SPROTOS PORTRAITS END */',1);portrait_path.write_text(portrait)
    print(f'Installed {len(inventory)} expansion selections; installed/revised {len(configs)} body atlases. Runtime and visual QA required.')

if __name__=='__main__':install()
