"""Reproducible request preparation. A request file is not a submission."""
import json, sys
import floating_prompts, staff_prompts, microphone_prompts, shout_prompts
from pathlib import Path
HERE=Path(__file__).resolve().parent
inventory=json.loads((HERE/'inventory.json').read_text())
uploads=json.loads((HERE/'uploads.json').read_text())
pilot=json.loads((HERE/'pilot-requests.json').read_text())[0]['params']['prompt']
CORE='Row 1'+pilot.split('\n\nRow 1',1)[1]
STYLE='''Production PIXEL ART for the existing Sproto fighting game. Crisp stepped pixels, dark outlines, compact limited-color shading. Not smooth vector or painterly art. Each cell contains exactly ONE complete actor facing RIGHT, consistent three-quarter side view. Preserve the reference identity, facial shape, exact eye count, colors, clothing, accessories and slender long torso. Same head, torso and limb proportions in every frame. Exactly two arms and two legs per actor, legs rooted at the LOWEST pelvis below the belly. Low hip, chambered knee and connected ankle for every kick. Never attach legs to the chest. Keep all limbs and feet wholly inside their own cell with generous empty margins; no clipping. Flat solid pure MAGENTA #ff00ff background, no grid lines, labels, shadows, trails, floating particles or weapons. Worn/held identity accessories must remain attached to body or hand. Extend cropped lower bodies conservatively using matching skin/clothing colors and simple shoes. Complete separate body drawings; no limb cutouts. Both feet need readable soles. No extra subjects.'''
WALK='''Exactly EIGHT separate full-body drawings in a regular 4-column by 2-row grid. A continuous guarded fighting footwork loop, NOT a run. Upper body stays calm, head/torso size constant, hips stay at the same height and same x center. Both fists remain raised. Feet are clearly different on adjacent frames: 0 near foot forward grounded/far foot back grounded; 1 transfer weight to near sole, far heel lifts; 2 far knee passes under low pelvis with far foot lifted; 3 far foot reaches forward while near sole still supports; 4 far foot forward grounded/near foot back grounded; 5 transfer weight to far sole, near heel lifts; 6 near knee passes under low pelvis with near foot lifted; 7 near foot reaches forward ready to plant. No feet crossing through one another, no sliding torso, no detached hips. Each frame has at least one clearly grounded foot. Last frame loops to first. Same complete body and clothing as the combat reference.'''
EVENTS='''Exactly 32 separate complete drawings, regular 4-column by 8-row grid, read left-to-right/top-to-bottom. All 32 are the SAME single actor, including lying floor drawings. No opponents or partner drawn.
Row 1 INTRO: relaxed idle; determined head turn with fists rising; guarded confident stance; settle combat guard.
Row 2 SPECIAL A: low coil; shoulder windup; fully extended straight impact punch; punch retract.
Row 3 SPECIAL B: alternate shoulder strike; retract to cover; two-arm finishing palm thrust to RIGHT; recover combat guard. No floating effects.
Row 4 CAST: hands coil at chest; forward hand chambers; front palm extends RIGHT at chest height; retract to guard. No projectile, sphere or particles; engine supplies effects.
Row 5 RECOIL: chest impact arch; head/torso lean back with arms still connected; bend knees to absorb; regain combat guard.
Row 6 DEFEAT START: staggering upright; knees buckle; dropping toward floor with bent elbows; roll onto side with head and feet fully visible.
Row 7 DEFEAT FLOOR: entirely lying on side, head to LEFT feet to RIGHT; same lying body settles; small final shoulder drop; side-lying completely still. No kneeling or standing in any of these four.
Row 8 DEFEAT REST: same side-lying floor silhouette with tiny relaxed hand change; same side-lying rest; same resting body; final completely relaxed side-lying body. Floor poses are lower than standing poses; never stretch them upright. All hats, heads, hands and feet remain connected and fully visible.'''
MOTION='''Exactly 32 complete dynamic pixel-art figures in an EXACTLY FOUR-COLUMN by EIGHT-ROW regular grid. Each of the following rows contains EXACTLY FOUR figures; do not create a fifth column. Equal cell width/height; generous empty magenta margins around each body. Same single actor throughout.
Row 1 DASH: crouch-drive anticipation; rear-leg powerful push; low traveling stride with front knee drive; long low traveling stride with coherent bent knees.
Row 2 DASH TO JUMP: front foot brakes and torso rises; guard recovery; tucked rising jump with bent low knees; springing airborne rise with front arm high.
Row 3 JUMP: folded knees at apex; falling with arms balancing; feet reach down; falling landing-ready with both feet below hips. These are airborne silhouettes, no floor.
Row 4 HEAVY KICK: low hip coil; front knee chambers from low pelvis; knee rises; SIDE KICK fully extended waist-high to RIGHT.
Row 5 HEAVY RECOVERY: sustain extended side kick one beat; knee folds back; grounded follow-through; guard.
Row 6 AIR KICK: compact aerial coil; front knee chambers; knee opens; forceful extended diagonal kick to RIGHT, rear knee folded.
Row 7 AIR TO VICTORY: knee retracts in air; balanced airborne recovery; confident upright victory guard; victory knees coil.
Row 8 VICTORY: jubilant short hop with fist up; stylish landing crouch; proud standing hero stance; settled triumphant hero pose. No effects, no additional figures. Exactly 4 figures per row, 8 rows.''' 

SPIT_CORE=CORE.split('Row 8:',1)[0]+'''Row 8: forward throw release with planted feet, no opponent; SPIT windup, head leans slightly back, cheeks inflate and lips purse while gloves stay raised; SPIT release, head leans forward with open red mouth and forceful exhale while gloves stay near chest, NO projectile or miniature character drawn; broad triumphant team special impact stance.'''
SPIT_EVENTS=EVENTS.replace(next(line for line in EVENTS.splitlines() if line.startswith('Row 4 CAST:')),'''Row 4 CAST: head leans back to inhale, gloves remain raised; cheeks visibly inflate with pursed red lips and chin slightly raised; head snaps forward, mouth opens to SPIT horizontally RIGHT, gloves remain in guard near chest; cheeks relax and mouth returns to the normal smile. NO palm cast or extended glove, NO projectile or miniature Sproto drawn: the engine supplies the mini at the mouth.''')

def requests(kind='core',force=False):
    ledger=json.loads((HERE/'jobs.json').read_text()) if (HERE/'jobs.json').exists() else []
    jobs={(j['entity'],j['kind']):j for j in ledger if j.get('job_id')}
    out=[];ordinal=0
    for ref in inventory:
        receipt=uploads.get(str(ref['number']),{})
        for body in ref['entities']:
            index=jobs.get((body['id'],kind),{}).get('index',1000+ordinal*4+{'core':0,'walk':1,'events':2,'motion':3}[kind]);ordinal+=1
            if kind=='motion' and len(ref['entities'])<2 and not ref.get('extraMotion'): continue
            if not receipt.get('media_id') or ((body['id'],kind) in jobs and not force): continue
            media=[dict(role='image',value=receipt['media_id'])]
            if body['id']=='sproto1870':media=[dict(role='image',value=receipt['media_id'])]
            if body['id']=='sproto3181-companion':media=[dict(role='image',value='e51b5ca0-3fbd-4a7a-8940-067ae597ffc9')]
            if body['id']=='sproto3181-companion2':media=[dict(role='image',value='f702993a-21e7-443d-94af-0703ec7d7d2d')]
            if body['id']=='sproto999-companion':media=[dict(role='image',value='4470efe3-185a-4369-a2a9-a3c53a501e26')]
            if body['id']=='sproto1870-companion':media=[dict(role='image',value='45681be8-c2c6-47f4-ba08-66c42bf8b913')]
            if body['id']=='sproto3224-companion':media=[dict(role='image',value='7579755c-3d25-4bb7-8f1b-be67e30fccd6')]
            if kind!='core':
                base=jobs.get((body['id'],'core'))
                if not base or base.get('status')!='completed':continue
                media=[dict(role='image',value=base['job_id'])]
            identity=body['description']
            if len(ref['entities'])>1: identity+=' This sheet isolates ONLY this selected figure. All companions have separate animation atlases. Never merge bodies, duplicate heads or include a companion.'
            if kind!='core': identity+=' The attached image supplies this individual character\'s full-body combat design: copy its EXACT head size, body/clothing design and body proportions in these new poses.'
            choreography=''
            if len(ref['entities'])>=2 and kind=='events' and ref.get('locomotion')!='hover':
                choreography=(' This actor is the LEAD STRIKER: intro includes a confident fist salute and low settling guard; SPECIAL rows 2-3 use powerful shoulder-driven straight/uppercut punches, open palm finish, clear low-hip anticipation and recoil.' if body==ref['entities'][0] else ' This actor is the ACROBATIC COMPANION: intro includes a quick pivot and jaunty guarded hop; SPECIAL rows 2-3 use dynamic low-hip kick chambers, waist-high kicks, bent-knee airborne strike, planted double-palm finish, then recover guard. Rows 2-3 still follow the exact 8 windup/contact/retract/finish beats. Every striking pose faces RIGHT.')+' Separate complete actor only; its partner will alternate attack contacts in the engine. Do not draw the partner.'
            prompt=STYLE+'\n\nIDENTITY: '+identity+choreography+'\n\n'+{'core':'Exactly 32 separate complete figures in a regular 4-column by 8-row grid. '+CORE,'walk':WALK,'events':EVENTS,'motion':MOTION}[kind]
            if ref.get('power')=='miniSproto' and kind in ('core','events'):
                prompt=STYLE+'\n\nIDENTITY: '+identity+choreography+'\n\n'+('Exactly 32 full figures, 4 columns by 8 rows. '+SPIT_CORE if kind=='core' else SPIT_EVENTS)
            if ref['id']=='sproto2344':
                prompt=prompt.replace('and slender long torso','and the individually specified curvy or chubby body shape')
                prompt+=' Preserve the individually specified design in EVERY frame: the red adult woman is SLIM but curvy, with a small waist, slender limbs, proportionate full chest and rounded hips; her wide oval face has slanted half-lidded yellow almond eyes and closed red lips like the original. The blue actor has a round belly, thick waist and sturdy legs. Do not turn the red actor back into a heavy build or a round-eyed chibi face.'
            if ref.get('weapon') and ref.get('weapon')!='microphone' and kind in ('core','walk','events'):prompt=staff_prompts.STYLE+'\n\nIDENTITY: '+identity+'\n\n'+getattr(staff_prompts,kind.upper())
            if ref.get('weapon')=='halberd':
                prompt=prompt.replace('A LARGE RED-AND-GOLD STAFF about as tall as the actor, with a clearly curled/spiral top','A LARGE body-height HALBERD with dark wooden shaft, curved RED hooked axe blade, WHITE spear point and white fang-like serrations').replace('STAFF','HALBERD').replace('staff','halberd')
            if ref.get('weapon')=='microphone' and kind in ('core','walk','events'):prompt=microphone_prompts.STYLE+'\n\nIDENTITY: '+identity+'\n\n'+getattr(microphone_prompts,kind.upper())
            if ref.get('power')=='retain' and kind in ('core','events'):prompt=shout_prompts.STYLE+'\n\nIDENTITY: '+identity+'\n\n'+getattr(shout_prompts,kind.upper())
            if ref.get('locomotion')=='hover':prompt=floating_prompts.STYLE+'\n\nIDENTITY: '+identity+'\n\n'+getattr(floating_prompts,kind.upper())
            params=dict(model='gpt_image_2_5',variant='sunburst',quality='high',resolution='2k' if kind=='walk' else '4k',aspect_ratio='4:3' if kind=='walk' else '9:16',count=1,use_unlim=False,medias=media,prompt=prompt)
            out.append(dict(index=index,entity=body['id'],fighter=ref['id'],kind=kind,params=params))
    (HERE/f'{kind}-requests.json').write_text(json.dumps(out,indent=2)+'\n')
    print(json.dumps(out))
    return out

if __name__=='__main__': requests(sys.argv[1] if len(sys.argv)>1 else 'core')
