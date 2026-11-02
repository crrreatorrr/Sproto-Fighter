import json,sys,shutil,hashlib
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
sys.path.insert(0,str(ROOT/'art/sprotos-expansion'))
import make_requests as p
ups={x['id']:x for x in json.loads((HERE/'uploads.json').read_text())}
specs=[
 ('reverend','Reverend Cloud','FORMAL','SUNDAY SERVICE','#ffdf39','Light sky BLUE swept spiky head, enormous round YELLOW eyes with BLACK oval pupils and white glints, broad curved YELLOW smiling muzzle and blue nose/chin. RED formal blazer with lapels, WHITE collared shirt, BLACK tie with distinctive yellow oval clock-shaped tie ornament and small yellow oval below it. Red suit trousers, black formal shoes, blue bare fingered hands. Preserve the long spiky head silhouette and friendly wide-eyed expression. Ignore the photographic building and all background.',''),
 ('zepump','H.E. ZEPUMP','DUET','DOUBLE DIP','#ffe34b','Isolate ONLY the LARGE BLUE character on the RIGHT of the original. Large long round blue-violet bald-topped head and long thick blue torso, huge YELLOW almond eyes with small black pupils, blue eyelids and broad projecting BLUE nose with small dark nostril, asymmetric RED flat upper lip and separate small RED lower lip. Swept blue rear side spikes. Unclothed cartoon blue body, blue arms and fingered hands, sturdy blue legs and blue feet; no anatomical nudity detail. Exclude the yellow partner, red background and all other subjects.','lead'),
 ('zepump-companion','H.E. ZEPUMP partner','DUET','DOUBLE DIP','#ffe34b','Isolate ONLY the SMALLER YELLOW character on the LEFT of the original. Narrow tall YELLOW torso and very long YELLOW neck, BLUE angular pointed spiky head with two tall blue ear/crest points, large pale yellow eyes with glossy BLACK pupils and white glints, enormous bright YELLOW paired cheek/muzzle lobes and RED pursed lips below. YELLOW slim arms, yellow fingered hands, small RED chest/lower torso markings, yellow legs and red feet. Bare stylized cartoon body with no anatomical nudity details. Exclude the large blue partner, red background and all other subjects. The red curled object in raised hand is a closed RED fist, not a separate character.','companion'),
 ('sprotopotamus','Sprotopotamus','HEAVY','HIPPO HUSTLE','#ffdf39','Round stocky BLUE-VIOLET head with swept angular blue rear spikes, very large WHITE round eyes with glossy BLACK pupils and white glints, thick RED curved eyebrows and huge broad bright RED duck-like muzzle/lips. Small YELLOW side ear fins. RED outfit with thick narrow YELLOW round collar and yellow oval pendant in small dark rim at chest. Blue fingered hands, red trousers and yellow shoes. Preserve the enormous red muzzle and wide white eyes in every pose, rounded broad torso rather than thin body. Exclude pale blue background.',''),
 ('willuminati','WILLUMINATI','RADIANT','RED SUN RALLY','#ffe227','ONLY the main ROUND BLUE character. Large circular medium blue head ringed by many short RED triangular spikes, huge bright YELLOW eyes with BLACK pupils and white glints, blue brows, small BLUE nose, broad joyful RED smiling lips with small blue tooth-like interior line. Bright YELLOW fitted outfit with large RED CIRCULAR spots around high collar, chest and shoulders; simple red triangular chest panel. Blue hands, yellow trousers, red shoes. Preserve circular head and red spikes. IGNORE and EXCLUDE the tiny human gnome at lower left completely: no gnome, no hat, no second character, no green object. Exclude blue background.','')
]
specs.append(('pirate','P| RATΞ','CORSAIR','JOLLY ROGER','#fff1b8','Bright COBALT BLUE tall jagged spiky head and long blue body, huge YELLOW oval eyes with BLACK pupils and white glints, small blue nose, enormous broad upward RED smile. RED bare cartoon arms and red fingered hands; thin YELLOW belt across waist, blue torso and blue legs, red boots. Large RED superhero-like CAPE attached behind shoulders, trailing behind body; preserve cape from original. No invented hat, eyepatch or weapon. Ignore pale background. Ranged poses wind up the front hand near shoulder then THROW toward RIGHT; empty hand releases, no object drawn, engine supplies skull-and-crossbones projectile. Special is a vigorous pirate boarding rush with four strike beats.',''))
from more_specs import SPECS
specs.extend(SPECS)
from latest_specs import SPECS as LATEST
specs.extend(LATEST)
plan=[]
for i,(id,name,role,special,color,identity,twin) in enumerate(specs):
 parent=id.removesuffix('-companion')
 d=ROOT/'art'/id;d.mkdir(exist_ok=True)
 shutil.copy2(ups[parent]['file'],d/'reference.png')
 item=dict(id=id,name=name,role=role,special=special,color=color,identity=identity,twin=twin,artDirectory='art/'+id,reference='art/'+id+'/reference.png',media_id=ups[parent]['result']['media_id'],referenceSHA256=hashlib.sha256((d/'reference.png').read_bytes()).hexdigest(),status='prepared')
 plan.append(item);(d/'identity.json').write_text(json.dumps(item,indent=2)+'\n')
(HERE/'plan.json').write_text(json.dumps(plan,indent=2)+'\n')

def requests(kind):
 jobs=json.loads((HERE/'jobs.json').read_text()) if (HERE/'jobs.json').exists() else []
 out=[]
 for i,item in enumerate(plan):
  if kind=='motion' and not item['twin']:continue
  media=[dict(role='image',value=item['media_id'])]
  if kind!='core':
   core=next((j for j in reversed(jobs) if j['entity']==item['id'] and j['kind']=='core' and j['status']=='completed'),None)
   if not core:continue
   media.append(dict(role='image',value=core['job_id']))
  style=p.STYLE.replace('and slender long torso','and the specific body shape described below').replace('or weapons','or weapons')
  choreo=''
  if item['twin']:
   choreo=' Draw ONLY this selected actor, never its partner. They have separate atlases. Dynamic coordinated action with strong anticipation and follow-through. '+('Lead striker: powerful shoulder-driven straights, uppercuts and planted finishing palm.' if item['twin']=='lead' else 'Acrobatic companion: elastic low-hip kick chambers, airborne bent-knee strikes, quick pivots, exuberant hops and a planted palm finish. Never detach the long neck.')
  seq={'core':'Exactly 32 separate complete figures in a strict FOUR-column by EIGHT-row grid. '+p.CORE,'walk':p.WALK,'events':p.EVENTS,'motion':p.MOTION}[kind]
  if kind=='events':
   from event_variants import customize
   seq=customize(item,p.SPIT_EVENTS if item['id']!='pirate' else p.EVENTS)
  style=style.replace('anatomical nudity','explicit anatomy')
  prompt=style+'\n\nIDENTITY: '+item['identity'].replace('anatomical nudity','explicit anatomy')+choreo+' Match original face and clothing, no boxing gloves. Keep fully connected fingers, hands, feet and head. Each cell ONE complete body. Reference 2 when present locks full-body design and proportions.\n\n'+seq
  out.append(dict(index=i*4+['core','walk','events','motion'].index(kind),entity=item['id'],fighter=item['id'].removesuffix('-companion'),kind=kind,params=dict(model='gpt_image_2_5',variant='sunburst',quality='high',resolution='2k' if kind=='walk' else '4k',aspect_ratio='4:3' if kind=='walk' else '9:16',count=1,use_unlim=False,medias=media,prompt=prompt)))
 (HERE/(kind+'-requests.json')).write_text(json.dumps(out,indent=2)+'\n')
 print('Prepared',kind,len(out))
if __name__=='__main__':requests(sys.argv[1] if len(sys.argv)>1 else 'core')
