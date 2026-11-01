"""Prepare the roster only after the two-fighter visual pilot is accepted.

One 32-cell sheet per character, quoted1.5credits each. This script never uploads
or submits generation, and intentionally requires separately confirmed media IDs.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'art/animation-rework'
roster=json.loads((D/'roster.json').read_text());plan=json.loads((D/'plan.json').read_text())
briefs={x['coreid']:x for x in json.loads((ROOT/'art/pose-atlases/character-briefs.json').read_text())}
common='''Create a complete pixel-art ANIMATION SHEET with exactly32 full-body cels in FOUR columns and EIGHT rows. Read left to right. Image1 governs original face/identity; image2 is the INSTALLED GAME GUARD and governs precise body proportions, head size, costume, pixel density and RIGHT-facing camera. Keep these consistent across every cel, including crouches and lying poses. No redesign, new clothes or extra characters.
Solid magenta #FF00FF background. No grid lines, text, labels, shadows, trails or travelling projectiles. All poses attack toward the RIGHT edge, including the other hand's strike. Both hands and feet remain attached and distinct. No duplicate resting limbs under moved limbs. Every entire body fits its cell with margin; retain anatomical scale rather than enlarging lying/crouched poses. Clean pixel clusters, dark outlines, no blur. Depict body performance; necessary held objects remain attached to a hand until release, never floating. Effects/projectiles are drawn separately by the game.
MOTION DIRECTION: theatrical, energetic arcade-fighter performance with strong anticipation, a clear contact silhouette and decisive recovery. Change shoulders, torso, hips and knees together, using connected anatomy and believable weight transfer. Each special contact must have a meaningfully different whole-body pose: loaded stance, driving step/lunge or planted power release, recoil/retraction, then a stronger finishing extension. Do not make a row of the same standing body with only a hand or face changed. Preserve stable anatomical lengths and head proportions; expressive motion comes from articulation, not stretching the character. Keep the support foot readable and the pelvis connected. Intro gestures should use the chest and posture as well as the hands. Defeat should have a readable, character-specific stagger-to-collapse arc, then continuous low settling without an upright return. Flash comes from strong poses; do not bake screen-filling effects or projectile trails into the body cells.
'''
requests=[]
for n,r in enumerate(roster):
    ident=r['runtime_id'];p=plan['fighters'][ident];identity=briefs[ident]['identity']
    identity=identity.replace('Use the supplied ORIGINAL reference as the identity authority, not previous rigging or generated bodies. ','')
    identity=identity.replace('NO CLOTHES.','Costume-free nonsexual fantasy mascot, matching the supplied cartoon.').replace('bra, ','')
    prompt=common+'\nCHARACTER: '+r['display_name']+'. '+identity+'\n'
    prompt+=f'''Each row is FOUR sequential complete-body drawings:
ROW1 INTRO: relaxed stance; first half of this signature gesture; second half; settle to installed raised-hand guard. Gesture: {p['intro']}
ROW2 SPECIAL: compressed anticipation; full windup; clear first RIGHT-facing contact/release; retract. Signature: {p['special']}
ROW3 SPECIAL continued: second distinct RIGHT-facing contact/release; coil for finish; strongest RIGHT-facing finishing contact; planted recovery into guard. All impacts go RIGHT, never left. Show full torso/hip/knee follow-through, not only hand changes.
ROW4 RANGED CAST: prepare; full anticipation; unmistakable release; recovery toward guard. Signature: {p['cast']} No travelling projectile. Mouth/hand release stays anatomically connected.
ROW5 RECOIL: first flinch from front hit; largest backward recoil with knees bracing; feet catch weight and head returns; guard restored. Signature: {p['recoil']}
ROW6 DEFEAT collapse: tired stagger; knees buckle; lower onto hip/forearm; completely lie on SIDE, head toward RIGHT edge and feet toward LEFT. Character-specific emotion: {p['defeat']}
ROW7 DEFEAT grounded: side-rest; tiny head effort while still lying; small shoulder settle; tired head rests. Hips/legs remain on floor, eyes tired. NO upright torso, no smiling recovery, no standing or kneeling. Keep the SAME HEAD SIZE.
ROW8 DEFEAT ending: relax hands; shoulders settle; tired eyes close; final still side-lying rest. ALL last8 cels stay lying with head RIGHT and feet LEFT. Never flip the horizontal orientation. Full body visible with margins, including feet/ears/spikes. No loose props. Final rest may have subtle settling but no resurrection.
32cels total in4columns/8rows. Fixed camera, continuous anatomy and exact installed-guard proportions. Each row is animation, not a turnaround.
'''
    prompt=prompt.replace('exactly32','exactly 32').replace('last8','last 8').replace('32cels','32 cels').replace('in4columns/8rows','in 4 columns / 8 rows')
    requests.append({'index':n+100,'fighter':ident,'name':r['display_name'],'reference':r['local_reference'], 'params':{'model':'nano_banana_2_1','resolution':'1k','thinking_level':'high','aspect_ratio':'2:3','count':1,'use_unlim':False,'prompt':prompt}})
(D/'nano-roster-requests.json').write_text(json.dumps(requests,indent=2)+'\n')
print('Prepared21 requests locally; zero submissions. Confirmed media references must be attached at submission.')
