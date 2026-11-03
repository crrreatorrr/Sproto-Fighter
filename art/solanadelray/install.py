"""Scoped installation: never rebuild the unrelated expansion or story code."""
import json,re,shutil,hashlib
from pathlib import Path
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
def install():
 plan=json.loads((HERE/'plan.json').read_text());configs={};grips={};report=[]
 for item in plan:
  id=item['id'];directory=ROOT/item['artDirectory'];kinds=['core','walk','events']+(['motion'] if item['twin'] else [])
  parts={k:json.loads((directory/'processed'/f'{id}-{k}/metadata.json').read_text()) for k in kinds}
  cfg=parts['core'];cfg['walkFrames']=parts['walk']['frames'];cfg['clips']=parts['events']['clips']
  if 'motion' in parts:cfg['clips'].update(parts['motion']['clips'])
  cfg['scale']=item.get('bodyScale',1.25)
  for k in kinds:
   src=directory/'processed'/f'{id}-{k}';category={'core':'poses','walk':'walk','events':'events','motion':'motion'}[k];dest=ROOT/'public/fighters'/category/id;dest.mkdir(parents=True,exist_ok=True)
   frames=list(src.glob('[0-9][0-9].png'));assert len(frames)==(8 if k=='walk' else 32)
   for f in frames:
    im=Image.open(f);assert im.mode=='RGBA' and im.size==(256,256);assert set(im.getchannel('A').getdata())<={0,255};b=im.getchannel('A').getbbox();assert b and min(b[:2])>0 and max(b[2:])<256
    shutil.copy2(f,dest/f.name)
  configs[id]=cfg
  grips[id]={}
  for part,slot in [('hand',26),('torso',24)]:
   anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];grips[id][part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
  item['status']='installed-playable';item['installedFrames']=104 if item['twin'] else 72
  (directory/(id+'-identity.json')).write_text(json.dumps(item,indent=2)+'\n')
  report.append({'id':id,'frames':item['installedFrames'],'clips':list(cfg['clips'])})
 path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());manifest['fighters'].update(configs);manifest['revision']=manifest.get('revision','atlas').split('-solana')[0]+'-solana'+hashlib.sha256(json.dumps(configs,sort_keys=True).encode()).hexdigest()[:10];temp=path.with_suffix('.solana-tmp');temp.write_text(json.dumps(manifest,indent=2)+'\n');temp.replace(path)
 playable=[x for x in plan if not x['id'].endswith('-companion')];ids=[x['id'] for x in playable]
 path=ROOT/'src/core.ts';s=path.read_text()
 for tag in ['ROSTER','KITS','GRIPS','PAIRS']:
  s=re.sub(r'/\* SOLANA '+tag+r' BEGIN \*/.*?/\* SOLANA '+tag+r' END \*/\n','',s,flags=re.S)
 type_decl=re.search(r'export type FighterId = (.*?);',s)
 for id in ids:
  if repr(id) not in type_decl.group(1):s=s[:type_decl.end()-1]+" | "+repr(id)+s[type_decl.end()-1:];type_decl=re.search(r'export type FighterId = (.*?);',s)
 m=re.search(r'export const PLAYABLE_FIGHTERS = \[(.*?)\] as const;',s);old=re.findall(r"'([^']+)'",m.group(1));s=s[:m.start()]+'export const PLAYABLE_FIGHTERS = '+repr(old+[id for id in ids if id not in old])+' as const;'+s[m.end():]
 entries=[];kits=[]
 for i,item in enumerate(playable):
  id=item['id'];twin=bool(item['twin']);desc='An agile red striker and a blue powerhouse share health and trade acrobatic attacks.' if twin else 'Distinct reference face and outfit, guarded footwork, mouth-spit and a four-contact finish.'
  if id=='pirate':desc='Boarding strikes, a flowing cape and a hand-thrown spinning skull and crossbones.'
  data=dict(name=item['name'],color=item['color'],dark='#253783',speed=5.5,jump=15.8,partner='rivet',special=item['special'],role=item['role'],description=desc)
  entries.append(id+':'+json.dumps(data)+',')
  origin={'forward':42,'height':107}
  if (HERE/'mouth-origins.json').exists():origin=json.loads((HERE/'mouth-origins.json').read_text()).get(id,origin)
  if twin:origin={**origin,'forward':origin['forward']+68}
  shot=dict(speed=11+i%4,shape='skullBones' if id=='pirate' else 'twin' if twin else ['spark','orb','ring','prism'][i%4],horizontal=True,origin=origin)
  if twin:
   points=json.loads((HERE/'mouth-origins.json').read_text());spread=68
   shot['originByFacing']={face:{**points[body],'forward':points[body]['forward']+spread} for face,body in [('left',id),('right',id+'-companion')]}
  if id=='pirate':shot.update(speed=12,returnAt=36)
  kits.append(f" {id}:kit({item['role']!r},{item['special']!r},{desc!r},{111+i},{{range:{156+i},damage:{113+i}}},{{startup:{18+i%6},recovery:25,damage:{64+i%11}}},{json.dumps(shot)},[13,25,39,53],{{range:{680+i*7},damage:{97+i},push:4}},1),")
 def block(tag,lines):return '/* SOLANA '+tag+' BEGIN */\n'+'\n'.join(lines)+'\n/* SOLANA '+tag+' END */\n'
 s=s.replace('    duo: { name:',block('ROSTER',entries)+'    duo: { name:',1)
 s=s.replace(' duo:kit(',block('KITS',kits)+' duo:kit(',1)
 start=s.index('export const THROW_GRIPS:');key=s.index(' = {',start)+4;s=s[:key]+'\n'+block('GRIPS',[id+':'+json.dumps(grips[id])+',' for id in ids])+s[key:]
 def update_json_const(name,fn):
  nonlocal s
  m=re.search(r'((?:export )?const '+name+r'[^=]*= )(.*?);',s);data=json.loads(m.group(2));fn(data);s=s[:m.start(2)]+json.dumps(data)+s[m.end(2):]
 pairs={'solanadelray':['solanadelray','solanadelray-companion']};spacing={'solanadelray':136}
 update_json_const('PAIRED_BODY_IDS',lambda a:[a.pop(id,None) for id in pairs]);update_json_const('BODY_SPACING',lambda a:[a.pop(id,None) for id in pairs])
 pairgrips={}
 for id,bodies in pairs.items():pairgrips[id]={str(face):{p:[spacing[id]/2+grips[bodies[-1] if face==1 else id][p][0],grips[bodies[-1] if face==1 else id][p][1]] for p in ['hand','torso']} for face in [-1,1]}
 update_json_const('EXPANSION_PAIR_GRIPS',lambda a:[a.pop(id,None) for id in pairs])
 pairblock=block('PAIRS',['Object.assign(PAIRED_BODY_IDS,'+json.dumps(pairs)+');','Object.assign(BODY_SPACING,'+json.dumps(spacing)+');','Object.assign(EXPANSION_PAIR_GRIPS,'+json.dumps(pairgrips)+');'])
 s=s.replace('export const DUO_SPREAD = 72;','export const DUO_SPREAD = 72;\n'+pairblock,1)
 m=re.search(r'(export const HORIZONTAL_SPIT_FIGHTERS[^=]*= )\[(.*?)\];',s);old=re.findall(r"['\"]([^'\"]+)['\"]",m.group(2));add=[id for id in ids if id!='pirate' and id not in old];s=s[:m.start(2)]+','.join(repr(x) for x in old+add)+s[m.end(2):]
 marker=s.index('const CROUCH_SPIT_ORIGINS:');pos=s.index(' = {',marker)+4
 s=re.sub(r'/\* SOLANA CROUCH BEGIN \*/.*?/\* SOLANA CROUCH END \*/\n','',s,flags=re.S)
 marker=s.index('const CROUCH_SPIT_ORIGINS:');pos=s.index(' = {',marker)+4
 crouch={id:{'forward':113,'height':62} for id in ids if id!='pirate'}
 s=s[:pos]+'\n/* SOLANA CROUCH BEGIN */\n'+''.join(id+':'+json.dumps(p)+',\n' for id,p in crouch.items())+'/* SOLANA CROUCH END */\n'+s[pos:]
 m=re.search(r'(export const isFreePlayAddition = .*?\(\[)(.*?)(\] as readonly FighterId\[\]\)\.includes\(id\);)',s)
 old=re.findall(r"['\"]([^'\"]+)['\"]",m.group(2));s=s[:m.start(2)]+','.join(repr(x) for x in old+[id for id in ids if id not in old])+s[m.end(2):]
 path.write_text(s)
 path=ROOT/'src/originalPortraits.ts';s=path.read_text();s=re.sub(r'/\* SOLANA PORTRAITS BEGIN \*/.*?/\* SOLANA PORTRAITS END \*/\n','',s,flags=re.S);s=s.replace(' = {',' = {\n/* SOLANA PORTRAITS BEGIN */\n'+'\n'.join(f" {x['id']}:new URL('../{x['reference']}',import.meta.url).href," for x in playable)+'\n/* SOLANA PORTRAITS END */',1);path.write_text(s)
 (HERE/'identity.json').write_text(json.dumps({'name':'Solana Del Ray','id':'solanadelray','status':'installed-playable','reference':'art/solanadelray/reference.png','entities':plan,'bodies':2,'installedFrames':208},indent=2)+'\n')
 (HERE/'install-report.json').write_text(json.dumps(report,indent=2)+'\n');(HERE/'plan.json').write_text(json.dumps(plan,indent=2)+'\n')
 print('Installed',len(playable),'roster entries,',len(configs),'independent bodies,',sum(x['frames'] for x in report),'drawings.')
if __name__=='__main__':install()
