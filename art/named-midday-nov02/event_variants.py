ENTRANCES={
'reverend':'straightens blazer lapels; adjusts clock tie with one hand; courteous forward bow; raises open-handed guard',
'zepump':'rolls broad shoulders; pounds one blue fist into the other palm; heavy planted step; confident guard',
'zepump-companion':'long-neck head tilt; jaunty one-foot hop; low pivot; elastic high guard',
'sprotopotamus':'broad muzzle grin; hearty chest pat; deep grounded hip bounce; solid wide guard',
'willuminati':'tilts round spiked head; spreads spotted sleeves in welcome; jaunty heel pivot; springy guard',
'pirate':'swishes attached red cape; proud forward chest pose; quick boarding-step lunge; pirate fighting guard',
'prim':'tilts asymmetric eyes inquisitively; broad red grin; quick forearm flourish; compact guard',
'benjamin':'smooths red shirt collar; adjusts black tie; polite head nod; careful guard',
'maxbiggums':'twitches pointed cat ears; cracks broad shoulders; stomps a boot; sturdy brawler guard',
'xav':'sleepy long slow blink; lazy yellow-arm stretch; sly head tilt; relaxed yellow-hand guard',
'emix':'yellow arm gestures forward; red arm folds across chest; quick shoulder switch; balanced two-color guard',
'peterpan':'swept crest nod; exuberant chest lift; quick low springing step; adventurous guard',
'peterpan-companion':'flame-hair head toss; graceful fingered-hand flourish; brisk pivot on planted foot; jaunty acrobatic guard',
'anni':'tall crest bends with jaunty head tilt; broad toothed grin; tugs red scarf; springy guard',
'pinewaffle':'adjusts attached blue brooch; cheerful red-nose head nod; bounces on heels; friendly guard',
'rainman':'wide-eyed double take; tiny red-nose chin lift; fast shoulder shake; nimble guard',
'wifebeater':'adjusts yellow bow tie; squares tall broad head; opens blue hands; wide grounded guard',
'fiatfudder':'attached cape sweep; points both chest ornaments forward; superhero chest lift; planted guard',
'moonshiller':'slow heavy belly bounce; rubs one red eyelid; broad shoulder roll; low sturdy guard',
'godether':'raises red rear fin proudly; touches yellow collar; dramatic blue-head turn; regal open-hand guard',
'aleksander':'tilts yellow 3-shaped ear ornament; playful red-face grin; smooths black shirt; lively guard',
'cyberviber':'upper yellow eye pair widens while lower red eyes blink; huge toothy grin; confident shoulder swivel; open-hand guard',
'realityarchitect':'smooths blue rear hair strands; taps yellow ear stud; slow surveying head turn; precise guard',
'mrgoldrobe':'touches black-red chest brooch; red-lidded friendly blink; formal small bow; calm guard',
}
def customize(item,text):
 id=item['id']
 text=text.replace(next(l for l in text.splitlines() if l.startswith('Row 1 INTRO:')),'Row 1 INTRO: '+ENTRANCES[id]+'. Exactly these four full-body key poses. Keep feet grounded except the specified small hop.')
 if id=='pirate':
  text=text.replace(next(l for l in text.splitlines() if l.startswith('Row 4 CAST:')),'Row 4 CAST: front hand coils near shoulder; elbow winds back with planted hips; vigorous forward THROW toward RIGHT with open releasing fingers; hand retracts to guard. No projectile or skull drawn; engine supplies it.')
 else:
  text=text.replace('gloves','hands').replace('glove','hand')
  text+=' SPIT is clearly emitted from the MOUTH: exaggerated puffed cheeks and pursed lips, then a sharp head snap and wide open mouth aimed RIGHT. Arms stay near ribs. No extended casting palm.'
 # Full bespoke anatomy and outfit are retained through different weight/shape falls.
 flavor=('heavy round body rocks backward then knees fold, arms brace the descent' if id in ('zepump','sprotopotamus','maxbiggums','moonshiller','wifebeater') else 'long torso twists, one knee dips, attached arms catch the controlled side fall' if id in ('zepump-companion','peterpan-companion','xav','cyberviber') else 'distinctive head tips back, knees buckle and one hand braces the controlled sideways collapse')
 text+=' PERSONAL DEATH CHOREOGRAPHY: '+flavor+'. Rows 6-8 preserve the exact 12 collapse-to-floor beats above; final eight drawings fully lie on side, head LEFT and feet RIGHT. Face, ear shapes, crest, clothing and attached accessories remain recognizable in the floor silhouette. No disappearing body or replacement generic silhouette.'
 return text
