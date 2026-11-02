import json,hashlib,re
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3];HERE=Path(__file__).resolve().parent
rows=json.load(open(ROOT/'art/identity-actions/audit.json'))[:51];profiles=json.load(open(ROOT/'art/identity-actions/profiles.json'));inventory=json.load(open(ROOT/'art/sprotos-expansion/inventory.json'));desc={b['id']:b['description'] for r in inventory for b in r['entities']}
legacy={x['id']:x['job'] for x in json.load(open(ROOT/'art/pose-atlases/generations.json'))};legacy.update(vela='e128cc32-b361-451a-be1e-1bb654e1c6af',duo='7a271219-45aa-44c3-8f9c-05eb213ee40f',**{'duo-blue':'6e705245-be1a-427d-bee5-6d33ca406f6f'});desc['duo']='ONLY RED character LEFT: bright red swept spiky head, huge yellow eyes, red nose, broad smile, thin red body and arms, red feet, EMPTY RED hands with no hook token. Yellow only in eyes. Preserve huge head and compact torso. Exclude blue figure.';desc['duo-blue']='ONLY BLUE figure RIGHT: very large blue swept spiky head, tiny attached yellow top hat, huge yellow eyes with black pupils, yellow muzzle and broad smile, rounded low blue belly, RED BOXING GLOVES with yellow cuffs on both hands and RED SHOES. Never yellow hands/feet. Preserve huge head, compact small torso and short low legs. Exclude red figure.'
# Character-specific gestures and collapses, kept distinct from shared mechanics.
acts=[
('crack knuckles then drive one fist into the opposite palm','proud chest brace fails, sink onto one knee then roll onto shoulder','wind a fist behind hip and snap a golden knuckle shot'),
('pat round yellow belly twice and give a loose open-hand greeting','belly wobble, hands clutch belly, sit heavily and roll onto side','puff cheeks and send a clearly egg-shaped spit'),
('wide muscular double-biceps flex followed by shoulder shrug','legs brace wide, knees shake, broad shoulders slump onto back','lift and shove a heavy boulder with both palms'),
('sweep an arm under the spiky head and make a theatrical autumn bow','frightened upward glance, hands over head, fold sideways','cradle then underhand-lob an imaginary pumpkin'),
('stroke pointed chin beard, show three fangs, step into long fencing guard','black nose dips, long knees fold asymmetrically, fall onto hip','pinch and flick a sharp narrow fang dart'),
('roll shoulders lazily and trace a small crescent with one hand','sleepy blink, hand to temple, slow spiraling kneel and side fall','cup hands low then bloom a crescent smoke shot'),
('lick lips, flick the fingers and bounce once onto toes','surprised jaw drop, elbows tuck, feet slip into seated roll','wipe mouth and flick a juicy droplet from the lips'),
('twirl wrist twice like winding a yo-yo and catch an imaginary string','reach for a missed catch, pivot, fall backward over folded knees','wind wrist then snap a returning yo-yo disc'),
('display the huge toothy smile, spread palms and tap the yellow collar','smile falters, hands cover teeth, sink chest-first to side','wind one elbow across torso and drive a red grin-shaped shot'),
('tip Santa hat carefully then tug coat belt and present an open palm','hat droops as boots slide, grasp belt and topple onto side','reach into coat and underhand-toss a wrapped gift'),
('press hands over heart and open them in a tender flourish','clutch heart, tilt head sadly, fold to curled side rest','draw hands from chest and blow a heart-shaped kiss'),
('rub thumb against fingers like counting coins and brush a shoulder','look down at empty palms, shrug, sit and roll backward','flip a coin off the thumb with a crisp wrist follow-through'),
('snake one wrist around the other then raise a pointed finger','arms coil defensively, knees twist inward, unwind onto belly','coil hands and release a slender serpent'),
('trace a little square frame in air and point through it','look through a cracked imaginary frame, stagger, recline sideways','frame a square between hands and push a pixel panel'),
('dust hands, kick one heel against ground and sweep a forearm','cough into elbow, shoulders buckle, slump in a heavy sideways heap','scoop the floor and fling a little scrap cluster'),
('wipe muzzle with forearm then plant a smug thumbs-up','sour face, clutch midsection, stumble and curl on one side','draw head back and spit a compact acidic blob'),
('push narrow glasses up and brush metal shoulder spikes','glasses slip, palm to forehead, drop slowly to curled side rest','draw a broken heart in air then flick it away'),
('count three raised fingers then snap both hands into lucky guard','count fails, hands open in disbelief, knees buckle and roll','trace a seven shape with fingertip and snap forward'),
('cross wrists, pull them apart and extend open hands calmly','wrists cross over chest, step falters, lie on side with hands open','loop wrists and cast a linked chain'),
('press huge palms together and expand into a giant chest flex','mighty fist hangs midair, shoulders sag, collapse heavily onto back','hoist an imaginary rock from low hips and shove it forward'),
('tiny toe taps, quick cat paw salute, low playful guard','ankles wobble, small crouch, tumble softly onto curled side','chamber a paw near chest and spring it outward'),
('exchange a jaunty shoulder salute with the off-sheet partner','reach toward the off-sheet partner, stumble and curl on side','alternate near and far hands in a paired cross release'),
('show uncovered fingers, roll wrists and slap one palm with the other','fingers shake, inspect sore knuckles, sink onto elbows and side','curl bare fingers and flick a sharp knuckle crescent'),
('lift chin, spread the yellow cape proudly and settle a heroic stance','cape wraps around bent knees as head droops and body settles sideways','aim with both eyes, chin slightly raised and hands held clear'),
('tilt smoking hand with relaxed wrist, nod slowly and settle','lazy head tilt, cough into shoulder, sit and roll gently','hold the joint near chest and flick it forward from the fingers'),
('straighten suit lapels, adjust tie and offer a crisp business nod','tie tug, knees give way, sit carefully before falling to side','take an invisible business card from lapel and snap it outward'),
('lift robe sleeves slightly, smooth the yellow collar and make a gracious bow','robe hem tangles the feet, hand to collar, fold into a robed side rest','gather robe sleeves then sweep a golden ribbon outward'),
('tap the broad chest with both fists and make a sturdy nod','round belly rocks, hands brace thighs, sit and roll onto one side','brace thick arms and punch a rotating blue cog'),
('raise one hand as if levitating and follow it with a calm head tilt','levitating poise fails, knees sag, drift gently into side rest','lift a palm and float an angular rune forward'),
('give a crooked little grin and double finger-point then guarded bounce','confused double-take, palms up, slump onto hip and roll','sweep one hand across face and fling a comic speech tile'),
('dry one-handed salute followed by slow knowing head turn','bemused shrug, hand behind head, sit and tip onto side','draw an angular prism from shoulder and flick it away'),
('trace a circle over pendant and straighten posture elegantly','pendant gaze, legs cross awkwardly, settle on side with one hand tucked','circle a finger and release a signet ring'),
('stretch the long neck, fan fingers and make a low awkward bow','long neck folds, elbows flail, knees drop and body folds sideways','sweep a long forearm and throw a bright pennant'),
('tap chest emblem, point upward and nod with determination','hand on medallion, final resolute nod, lower to knee and side','hold the coin low then release a confident round coin flip'),
('brush an imaginary crown, present a grand open-arm royal greeting','grand gesture freezes, ankles buckle, fold royally onto side','draw a folded banner from shoulder and flourish it outward'),
('raise a fist gently, touch yellow collar and bow the spiky head','drowsy eyes close, fist lowers, sit and roll softly to side','cradle hands near collar and push a radiant resolve emblem'),
('tap both sides of head, waggle fingers and step confidently','head wobbles, hands brace cheeks, drop to knees and roll','curl one fist beside cheek and flick a notched sun token'),
('brush swept violet spikes, touch cheek and make a sly open-hand wave','sleepy stare turns dizzy, one hand to brow, fall onto tucked side','cup a violet crescent near shoulder and sling it forward'),
('tap opposite shoulder then offer an energetic off-sheet partner salute','glance toward partner, brace one elbow, tumble onto side','coil both hands in a crossed twin release'),
('turn the wide connected two-face head left then right, show both hands','both facial regions react at once, knees buckle, wide body rolls to side','raise hands beside both faces and push a double mask token'),
('mime loading a paintbrush, make two bold air-brush strokes and present the work','stagger as if struck by paint, wipe the face, slip onto hip and lie amid attached paint stains','take a small framed canvas from under arm, wind up like a discus and throw the PAINTING forward'),
('small fist bump toward off-sheet companion, springy toe rise and guard','failed toe bounce, clasp elbows, settle onto curled side','gather hands at chin and cast a curling paired wave'),
('rub nose with wrist, tilt the head and open both palms in a cheeky shrug','nose dips, shrug collapses, stumble into a sideways seat and rest','hook fingers under chin then flick a hooked red token'),
('pull elbows back, stretch one forearm and offer a jaunty salute','arms lose tension, knees bend, fall to side with one hand cushioning head','draw elbow behind ribs and launch a broad feather'),
('tap cheek, make a quick two-finger peace sign and settle low','peace sign trembles, hips sag, kneel and roll onto tucked shoulder','pinch fingers at cheek then release a sharp spiral seed'),
('trade an imaginary low-five with off-sheet partner and step into guard','missed low-five turns into stumble, feet fold and lie on side','pull near hand back and toss a narrow paired ribbon'),
('slow ear flick, wave both hands low and give a mischievous nod','ears dip, feet skid, hands cradle head as body tips sideways','cup a small crest shape between hands and shove it forward'),
('exaggerated long muzzle nod, tiny cheek scratch and bizarre palm flourish','long muzzle overbalances, yellow cheek hook tilts, fall onto hip and side','draw long lips back then flick a curved whisker crescent'),
('raise one brow, sweep an arm overhead and finish in compact guard','overhead hand droops, spine bends, low knees fold into side rest','coil hand above shoulder and throw a notched fin'),
('feminine head tilt, small hip pivot and graceful wrist wave','lashes blink, palm to cheek, knees fold neatly and settle to side','sweep an elegant wrist arc and release a petal blade'),
('upper face nods as lower belly face looks forward, give two raised thumbs','both connected facial regions sag, one knee touches down, roll as ONE body','touch the yellow forehead flourish then send a curled medallion')]
assert len(acts)==51
out=[]
for i,r in enumerate(rows):
 for bi,body in enumerate(r['bodies']):
  current=ROOT/'public'/r['atlas']['frames'][0]['url'].lstrip('/') if bi==0 else ROOT/'public/fighters/pose-atlas.json'
  markers=list((ROOT/'art').glob('**/'+body+'-core/source-job.txt'))
  reference=None
  if markers:reference=max(markers,key=lambda p:p.stat().st_mtime).read_text().strip()
  if not reference:reference=legacy.get(body)
  if not reference:
   for p in (ROOT/'art').glob('**/*jobs*.json'):
    try:data=json.loads(p.read_text())
    except:continue
    if isinstance(data,list):
     for j in data:
      if isinstance(j,dict) and j.get('entity')==body and j.get('kind')=='core' and j.get('status')=='completed':reference=j.get('job_id')
  if not reference:raise ValueError('Missing reference '+body)
  ranged=profiles[r['id']]['replaceRanged'];entry,death,cast=acts[i];count=32 if ranged else 24;deathStart=16 if ranged else 8
  identity=desc.get(body,'Copy the attached CURRENT full-body fighting sprite exactly: same face, eyes, head silhouette, outfit, hands and feet.')
  if bi:entry='Give the lead partner an acrobatic small hop salute, then '+entry;death='React to the off-sheet partner, then '+death
  frames=['relaxed upright readiness','anticipation for '+entry,'begin '+entry,'continue the signature gesture','complete the broadest readable gesture','small follow-through of the gesture','settle with hands rising','upright standard combat guard with both feet planted']
  if ranged:frames+=['prepare to '+cast,'draw the held object or casting hands back','coil torso for '+cast,'full windup with wrist and object ready','release toward RIGHT: '+cast,'hold the release follow-through','retract hands and shoulders','regain combat guard']
  frames+=['first surprised impact reaction: '+death,'head/shoulder reaction matching '+death,'weight shifts awkwardly as knees bend','one knee or hip lowers toward floor','hands reach to cushion the fall','body tipping almost horizontally','low collapsing body, head LEFT feet RIGHT','entire body reaches floor, head LEFT feet RIGHT']
  frames+=['fully lying on side, head LEFT feet RIGHT, signature resting silhouette for '+death,'lying body settles with small shoulder drop','lying body shifts one relaxed hand','lying knees/feet relax slightly','lying eyes and face soften','still lying with a tiny final hand release','same fully lying relaxed body','final motionless complete lying rest']
  prompt=f'''Existing-game PIXEL ART animation sheet. EXACTLY {count} complete separate drawings, FOUR COLUMNS and {count//4} ROWS, exactly FOUR drawings per row. Preserve the attached CURRENT SPRITE design, exact face/eye count, outfit, accessories, skin colors and body proportions. Each drawing is ONE complete individual actor, facing RIGHT. No extra figures, no opponents, no detached pieces, no floating effects, text, grid, floor or shadow. Pure MAGENTA #ff00ff background. Dark stepped pixel outlines and limited pixel shading, not smooth vector art. All hands, feet, horns, held identity accessories and limbs attached and fully inside each cell. Same upright body/head size across every drawing; lying actors remain lower, never stretched upright. Preserve anatomy and low-rooted legs.\nIDENTITY: {identity}\nSIGNATURE ENTRANCE: {entry}. SIGNATURE DEFEAT: {death}.'''
  if body=='sproto651':prompt+=' Picasso throws framed ART PAINTINGS, not energy orbs. Defeat shows colorful paint stains ATTACHED to his body/clothes, never detached background splashes; runtime supplies flying splatter.'
  prompt+='\nExact ordered cells, left-to-right then top-to-bottom:\n'+'\n'.join(f'{k+1}. {f}.' for k,f in enumerate(frames))
  out.append(dict(index=10000+len(out),entity=body,fighter=r['id'],kind='identity',frameCount=count,deathStart=deathStart,ranged=ranged,standingHeight=128,identity=identity,entrance=entry,death=death,cast=cast if ranged else None,params=dict(model='gpt_image_2_5',variant='sunburst',quality='high',resolution='4k',aspect_ratio='9:16' if ranged else '2:3',count=1,use_unlim=False,medias=[dict(role='image',value=reference)],prompt=prompt)))
(HERE/'requests.json').write_text(json.dumps(out,indent=2)+'\n');print(len(out))
