import json,sys,shutil,hashlib
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
sys.path.insert(0,str(ROOT/'art/sprotos-expansion'))
import make_requests as p
reference='/var/folders/m7/dcmshhy57bx83804v5dd43vm0000gn/T/codex-clipboard-f39ca678-c3a4-4a37-af8a-7412a1ee284e.png'
shutil.copy2(reference,HERE/'reference.png')
media='f00538e5-02dd-411b-999d-cecfdf4e8c5a'
identities=[
 ('solanadelray','lead',1.15,'Isolate ONLY the SMALL RED female cartoon Sproto at FRONT LEFT. Round bright RED face, pointed swept RED forelock/crest, huge round YELLOW eyes with BLACK pupils and white glints, broad RED smiling muzzle with TWO tiny BLACK nostril dots, RED ears and a BLUE chin/under-jaw band. Slim curvy adult RED torso and red arms/hands. Dress her in a modest fully opaque RED fitted long-sleeve leotard with high round neckline, RED leggings and simple red shoes; clothing matches the red body palette, covers chest and hips completely, no exposed chest or skin details. Preserve cheerful round face, red forelock, blue chin band and curvy waist. No blue partner, horns, extra face or background on this sheet.'),
 ('solanadelray-companion','companion',1.3,'Isolate ONLY the LARGE BLUE actor at BACK RIGHT. Huge rounded PERIWINKLE BLUE head with swept irregular BLUE rear/top spikes; TWO enormous bulging round YELLOW eyes with BLACK pupils and white glints, yellow crescent muzzle wedge under eyes, long thin curved RED closed smiling lips, blue chin. One prominent long YELLOW horn projects diagonally upward/back on rear side and one smaller yellow rear-side spike. Medium round BLUE torso with short jagged side tufts, BLUE arms and normal blue fingered hands, blue legs and red feet. Smooth fully opaque cartoon blue body, no skin details. Preserve huge blue head, protruding yellow eyes, red smile and yellow rear horn. Exclude the red character and all backgrounds.')
]
plan=[]
for id,twin,scale,identity in identities:
 item=dict(id=id,name='Solana Del Ray',role='DUET',special='SUNSET SERENADE',color='#ffe353',identity=identity,twin=twin,bodyScale=scale,artDirectory='art/solanadelray',reference='art/solanadelray/reference.png',referenceSHA256=hashlib.sha256((HERE/'reference.png').read_bytes()).hexdigest(),media_id=media,status='prepared')
 plan.append(item)
(HERE/'plan.json').write_text(json.dumps(plan,indent=2)+'\n')
def requests(kind):
 jobs=json.loads((HERE/'jobs.json').read_text()) if (HERE/'jobs.json').exists() else []
 out=[]
 for i,item in enumerate(plan):
  medias=[dict(role='image',value=media)]
  if kind!='core':
   core=next((j for j in reversed(jobs) if j['entity']==item['id'] and j['kind']=='core' and j['status']=='completed' and not j.get('superseded')),None)
   if not core:continue
   medias=[dict(role='image',value=core['job_id'])]
  style=p.STYLE.replace('and slender long torso','and individually described body shape').replace('weapons','weapons')
  choreography=('The RED lead is a graceful agile striker: planted palm strikes, winding shoulder straights, low-hip waist-high kicks and a sweeping acrobatic finish.' if i==0 else 'The BLUE companion is a powerful round-headed partner: expressive anticipation, bounding dashes, springing bent-knee jumps, strong low-hip kick chambers and a planted palm finisher.')
  seq={'core':'Exactly 32 complete figures in an EXACT regular FOUR-column by EIGHT-row grid. '+p.CORE,'walk':p.WALK,'events':p.SPIT_EVENTS.replace('gloves','hands').replace('glove','hand'),'motion':p.MOTION}[kind]
  if kind=='events':
   entrance=('jaunty red-crest head tilt; graceful hand flourish near waist; lively planted pivot; confident combat guard' if i==0 else 'huge yellow eyes widen; broad blue shoulder roll; heavy jaunty forward step; open-hand guard')
   seq=seq.replace(next(l for l in seq.splitlines() if l.startswith('Row 1 INTRO:')),'Row 1 INTRO: '+entrance+'. Exactly four full-body key drawings.')
   seq+=' Ranged attack is a MOUTH SPIT: cheeks puff, lips purse, head snaps RIGHT with an open mouth, hands stay near ribs. No extended palm cast. Collapse retains the original red or blue identity, outfit, head and horn; final eight drawings fully lie on their side with head LEFT and feet RIGHT. No vanishing or replacement silhouettes.'
  prompt=style+'\n\nIDENTITY: '+item['identity']+' '+choreography+' ONLY this ONE chosen actor, the partner has a different sheet. Never merge bodies or draw the partner. Bare normal fingered hands, no boxing gloves. No text or source watermark. Pure MAGENTA background in every empty area. Keep the same complete clothing and face throughout.\n\n'+seq
  out.append(dict(index=i*4+['core','walk','events','motion'].index(kind),entity=item['id'],fighter='solanadelray',kind=kind,params=dict(model='gpt_image_2_5',variant='sunburst',quality='high',resolution='2k' if kind=='walk' else '4k',aspect_ratio='4:3' if kind=='walk' else '9:16',count=1,use_unlim=False,medias=medias,prompt=prompt)))
 (HERE/f'{kind}-requests.json').write_text(json.dumps(out,indent=2)+'\n')
 print(kind,len(out))
if __name__=='__main__':requests(sys.argv[1] if len(sys.argv)>1 else 'core')
