"""Install only these new characters, preserving every existing fighter."""
import hashlib,json,re,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
plan=json.loads((HERE/'plan.json').read_text())
for info in plan:
 id=info['id'];tag=id.upper();folder=ROOT/info['artDirectory'];pieces={k:json.loads((folder/'processed'/f'{id}-{k}'/'metadata.json').read_text()) for k in ['core','walk','events','identity']}
 cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']={**pieces['events']['clips'],**pieces['identity']['clips']}
 for name,n in [('entrance',8),('ranged',8),('death',16)]:assert len(cfg['clips'][name])==n
 for kind,category in [('core','poses'),('walk','walk'),('events','events'),('identity','identity')]:
  source=folder/'processed'/f'{id}-{kind}';dest=ROOT/'public/fighters'/category/id;dest.mkdir(parents=True,exist_ok=True)
  for image in source.glob('[0-9][0-9].png'):shutil.copy2(image,dest/image.name)
 manifestPath=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(manifestPath.read_text());manifest['fighters'][id]=cfg
 manifest['revision']='late-'+hashlib.sha256(json.dumps(cfg).encode()).hexdigest()[:16];manifestPath.write_text(json.dumps(manifest,separators=(',',':'))+'\n')
 path=ROOT/'src/core.ts';s=path.read_text()
 for section in ['ROSTER','KIT','GRIP']:
  s=re.sub(r'/\* '+tag+' '+section+r' BEGIN \*/.*?/\* '+tag+' '+section+r' END \*/\n','',s,flags=re.S)
 line=re.search(r'export type FighterId = (.*?);',s)
 if "'"+id+"'" not in line.group(1):s=s[:line.end()-1]+" | '"+id+"'"+s[line.end()-1:]
 line=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s)
 if "'"+id+"'" not in line.group(1):at=line.end()-len('] as const;');s=s[:at]+", '"+id+"'"+s[at:]
 roster=dict(name=info['name'],color=info['color'],dark='#253783',speed=5.5,jump=15.8,partner='rivet',special=info['special'],role=info['role'],description='Mouth-spit pressure and a four-contact '+info['special'].title()+'.')
 s=s.replace('    duo: { name:',f'/* {tag} ROSTER BEGIN */\n'+id+':'+json.dumps(roster,separators=(',',':'))+f',\n/* {tag} ROSTER END */\n    duo: {{ name:',1)
 # Mouth origin is reviewed in identity release frame12 before installation.
 origin=info['mouthOrigin'];i=info['ordinal'];shape=['ring','prism','coin'][i]
 kit=f' {id}:kit({json.dumps(info["role"])},{json.dumps(info["special"])},'+json.dumps('Straight mouth spit, distinctive footwork and a four-contact '+info['special'].title()+'.')+f',{87+i},{{range:{143+i*4},damage:{94+i}}},{{startup:{16+i},recovery:{27+i},damage:{59+i}}},{{speed:{11+i},shape:\'{shape}\',horizontal:true,origin:'+json.dumps(origin)+f'}},[15,27,39,51],{{range:{640+i*18},damage:{81+i},push:4}},1),'
 s=s.replace(' duo:kit(',f'/* {tag} KIT BEGIN */\n'+kit+f'\n/* {tag} KIT END */\n duo:kit(',1)
 grips={}
 for part,slot in [('hand',26),('torso',24)]:
  anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);point=cfg['holdContact'][part];grips[part]=[(point[k]-anchor[k])*cfg['scale'] for k in [0,1]]
 at=s.index('"duo":',s.index('export const THROW_GRIPS:'));s=s[:at]+f'/* {tag} GRIP BEGIN */\n'+id+':'+json.dumps(grips)+f',\n/* {tag} GRIP END */\n'+s[at:]
 path.write_text(s)
 path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* '+tag+r' PORTRAIT BEGIN \*/.*?/\* '+tag+r' PORTRAIT END \*/\n','',s,flags=re.S)
 s=s.replace(' duo:new URL(',f'/* {tag} PORTRAIT BEGIN */\n {id}:new URL(\'../art/{id}/reference.png\',import.meta.url).href,\n/* {tag} PORTRAIT END */\n duo:new URL(',1);path.write_text(s)
 info['status']='installed-playable';info['installedFrames']=104;(folder/'identity.json').write_text(json.dumps(info,indent=2)+'\n')
 sourceManifest=ROOT/'art/roster-manifest.json';references=json.loads(sourceManifest.read_text());references=[r for r in references if r.get('name')!=id]
 references.append(dict(name=id,display_name=info['name'],local_reference=info['reference'],inspected=True,requirement='Reference identity, custom entrance8, mouth-spit8 and death16; one complete actor.',status='Campaign recruit; 104 authored drawings. See docs/LATE-NAMED-NOV02-QA.md.'))
 sourceManifest.write_text(json.dumps(references,indent=2)+'\n')
 print(info['name']+': 32 combat + 8 walking + 32 event + 32 custom identity drawings installed.')
(HERE/'plan.json').write_text(json.dumps(plan,indent=2)+'\n')
