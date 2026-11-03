"""Deterministic cutout preprocessing for supplied Higgsfield renders.
No generated replacements: hand-authored semantic masks, nearest-neighbor grid
normalization, and small solid-color joint overlap caps from source palette.
Run with system python3 (Pillow)."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageChops,ImageFilter
import json,math,hashlib
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/fighters';OUT.mkdir(parents=True,exist_ok=True)
# Coordinates are in original 1024-square renders. Pivots use 128-grid pixels.
DATA={
'rivet':{'ground':125,'root':[65,88],'neck':[65,53], 'shoulders':[[46,59],[79,60]],'elbows':[[34,73],[84,77]],'wrists':[[42,78],[90,73]],'hips':[[57,89],[73,89]],'knees':[[46,104],[80,102]],'ankles':[[41,118],[75,118]], 'colors':{'arm':'#25252b','leg':'#26252c','hand':'#fbd121'},'parts':{
'head':([(333,46),(359,46),(359,55),(404,61),(437,85),(468,81),(503,62),(555,55),(594,65),(627,90),(662,73),(693,50),(720,47),(714,91),(696,129),(712,157),(744,159),(748,172),(716,185),(733,235),(736,285),(708,325),(714,356),(682,400),(648,422),(594,440),(515,430),(450,412),(403,383),(380,353),(303,345),(315,326),(362,297),(354,249),(364,219),(319,201),(283,179),(284,164),(343,161),(361,129),(345,95)],[65,53],None),
'torso':([(382,374),(425,400),(490,427),(564,437),(620,422),(633,469),(652,489),(658,570),(643,650),(655,718),(602,730),(545,699),(511,699),(466,724),(387,721),(380,645),(388,568),(356,475)],[65,88],[65,53]),
'pelvis':([(399,683),(480,690),(525,695),(603,690),(638,709),(648,735),(589,753),(523,729),(469,754),(393,737)],[65,88],None),
'backUpperArm':([(331,440),(373,449),(394,494),(376,542),(346,577),(291,569),(280,541),(305,483)],[46,59],[34,73]),
'backForearm':([(244,551),(291,543),(330,571),(353,612),(351,651),(312,672),(272,660),(237,635),(224,605)],[34,73],[42,78]),
'backHand':([(322,571),(349,551),(391,546),(421,561),(444,586),(442,608),(422,616),(429,637),(408,652),(362,666),(320,651)],[42,78],None),
'frontUpperArm':([(611,468),(648,476),(665,514),(690,557),(677,600),(641,614),(618,576)],[79,60],[84,77]),
'frontForearm':([(647,589),(686,570),(721,585),(743,621),(729,653),(689,676),(649,659),(632,632)],[84,77],[90,73]),
'frontHand':([(700,551),(718,527),(740,514),(773,515),(795,537),(800,567),(787,598),(768,622),(732,639),(703,623),(694,584)],[90,73],None),
'backThigh':([(408,704),(479,700),(506,729),(472,775),(440,817),(408,856),(335,841),(334,810),(370,755)],[57,89],[46,104]),
'backShin':([(337,820),(407,835),(397,885),(385,930),(366,962),(289,948),(299,909),(319,861)],[46,104],[41,118]),
'backFoot':([(288,943),(348,934),(377,947),(390,972),(366,1008),(261,1006),(258,981),(269,963)],[41,118],None),
'frontThigh':([(531,711),(606,701),(643,748),(685,796),(665,839),(593,840),(551,789)],[73,89],[80,102]),
'frontShin':([(594,815),(669,813),(653,860),(635,888),(641,943),(550,952),(546,912),(569,863)],[80,102],[75,118]),
'frontFoot':([(562,929),(620,929),(650,941),(671,949),(711,951),(741,970),(744,994),(548,994),(538,971)],[75,118],None)
}},
'vela':{'ground':123,'root':[67,95],'neck':[67,55], 'shoulders':[[50,64],[83,65]],'elbows':[[36,78],[94,80]],'wrists':[[35,88],[96,88]],'hips':[[57,96],[78,96]],'knees':[[44,109],[82,106]],'ankles':[[39,118],[79,117]],'colors':{'arm':'#1337e8','leg':'#173adf','hand':'#173be7'},'parts':{
'head':([(254,80),(307,81),(340,94),(366,99),(399,107),(439,99),(479,89),(535,83),(588,89),(626,111),(655,139),(680,177),(698,218),(708,246),(739,242),(758,253),(773,280),(769,313),(741,350),(708,376),(716,409),(675,435),(622,451),(597,464),(537,449),(498,439),(458,449),(416,433),(377,426),(338,429),(306,465),(280,475),(273,447),(285,399),(291,368),(259,384),(235,415),(207,434),(196,413),(196,368),(208,325),(232,288),(198,284),(192,275),(225,239),(255,208),(278,188),(245,175),(213,175),(218,163),(265,149),(306,141),(330,141),(312,128),(278,122),(255,112)],[67,55],None),
'torso':([(424,447),(476,455),(526,474),(568,496),(607,475),(653,477),(680,512),(699,579),(695,636),(709,673),(681,731),(641,764),(593,784),(537,784),(483,768),(448,739),(423,702),(409,660),(424,601),(435,554),(409,519)],[67,95],[67,55]),
'pelvis':([(446,715),(500,750),(552,776),(609,772),(661,737),(687,779),(653,809),(607,817),(569,793),(528,787),(482,788),(441,764)],[67,95],None),
'backUpperArm':([(400,472),(441,482),(448,525),(419,567),(382,604),(357,635),(302,633),(284,606),(312,564),(351,518)],[50,64],[36,78]),
'backForearm':([(291,599),(344,619),(351,657),(325,704),(277,716),(232,693),(237,658),(256,625)],[36,78],[35,88]),
'backHand':([(240,670),(282,657),(316,674),(343,701),(348,728),(321,748),(295,759),(263,752),(234,731),(217,709),(217,687)],[35,88],None),
'frontUpperArm':([(648,484),(687,499),(716,551),(754,600),(769,644),(721,661),(693,622),(670,581)],[83,65],[94,80]),
'frontForearm':([(716,619),(765,620),(786,663),(797,703),(763,733),(720,711),(707,678)],[94,80],[96,88]),
'frontHand':([(742,668),(777,663),(801,685),(820,713),(814,741),(788,754),(758,754),(730,741),(712,720),(718,688)],[96,88],None),
'backThigh':([(446,725),(487,763),(500,787),(463,839),(419,877),(382,901),(320,874),(342,829),(382,781)],[57,96],[44,109]),
'backShin':([(338,850),(400,865),(416,892),(393,919),(381,954),(309,964),(266,937),(282,899),(311,873)],[44,109],[39,118]),
'backFoot':([(283,916),(321,925),(368,924),(407,926),(432,952),(440,975),(403,982),(354,977),(322,980),(282,982),(256,972),(252,947)],[39,118],None),
'frontThigh':([(604,749),(661,725),(690,749),(716,785),(716,817),(684,849),(624,858),(595,826),(603,791)],[78,96],[82,106]),
'frontShin':([(623,826),(690,835),(685,864),(673,890),(697,913),(682,944),(622,949),(584,930),(595,887)],[82,106],[79,117]),
'frontFoot':([(595,901),(640,904),(685,893),(721,894),(749,916),(781,918),(807,944),(803,968),(769,969),(731,974),(680,975),(635,974),(586,964),(571,947)],[79,117],None)
}}}
for path in sorted((ROOT/'art/higgsfield/processed/configs').glob('*.json')):
    DATA[path.stem]=json.loads(path.read_text())
for path in sorted((ROOT/'art/higgsfield').glob('landmarks-batch*.json')):
    DATA.update(json.loads(path.read_text()))
# Refine overlaps at the source neck and right face boundary.
DATA['rivet']['parts']['head'][0][14:19]=[(736,285),(737,315),(748,339),(741,366),(720,392),(685,414),(648,432)]
DATA['vela']['parts']['torso'][0][:5]=[(424,430),(486,427),(549,438),(610,441),(653,460)]
DATA['rivet']['occlusionSubtract']={'torso':['backHand']}
DATA['rivet']['occlusionFills']=[{'part':'torso','polygon':[[380,543],[452,543],[452,667],[380,667]],'color':'#242428'}]
revision_hash=hashlib.sha256(Path(__file__).read_bytes()+json.dumps(DATA,sort_keys=True).encode()+(ROOT/'src/higgsfieldRig.ts').read_bytes())
for name in sorted(DATA):revision_hash.update((ROOT/'art/higgsfield/raw'/f'{name}.png').read_bytes())
revision=revision_hash.hexdigest()[:16]
(ROOT/'src/higgsfieldRevision.ts').write_text('// Generated by build_rigs.py. Changes invalidate loaded rig textures.\nexport const HIGGSFIELD_REVISION = '+repr(revision)+';\n')
metadata={'revision':revision,'version':1,'source':'Higgsfield supplied renders; no alternate image generation','normalization':{'sourceSize':1024,'gridSize':128,'sampler':'nearest','alpha':'semantic polygon mask intersect original alpha >=192; binary cutout alpha','occlusion':'Small circular overlap caps sampled from source palette; unseen limbs not hallucinated as new reference art'},'fighters':{}}
for name,d in DATA.items():
    source=Image.open(ROOT/'art/higgsfield/raw'/f'{name}.png').convert('RGBA')
    folder=OUT/name;folder.mkdir(parents=True,exist_ok=True)
    info={k:v for k,v in d.items() if k!='parts'};info['parts']={}
    nx,ny=[round(v*8)for v in d['neck']];neck_pixels=[]
    for yy in range(max(0,ny-5),min(1024,ny+6)):
        for xx in range(max(0,nx-5),min(1024,nx+6)):
            px=source.getpixel((xx,yy))
            if px[3]>=192:neck_pixels.append(px[:3])
    if neck_pixels:
        from collections import Counter
        color=Counter(neck_pixels).most_common(1)[0][0];info['neckColor']='#%02x%02x%02x'%color
    else:info['neckColor']=d['colors']['arm']
    info['hierarchy']={'pelvis':'root','torso':'pelvis','head':'torso'}
    for side in ['back','front']:
        info['hierarchy'].update({side+'UpperArm':'torso',side+'Forearm':side+'UpperArm',side+'Hand':side+'Forearm',side+'Thigh':'pelvis',side+'Shin':side+'Thigh',side+'Foot':side+'Shin'})
    sheet=Image.new('RGBA',(128*5,128*3),(26,29,40,255));sd=ImageDraw.Draw(sheet)
    composite=Image.new('RGBA',(128,128))
    for i,(part,(points,pivot,end)) in enumerate(d['parts'].items()):
        semantic=Image.new('L',source.size);ImageDraw.Draw(semantic).polygon(points,fill=255)
        source_alpha=source.getchannel('A').point(lambda a:255 if a>=192 else 0)
        mask=ImageChops.multiply(semantic,source_alpha)
        # Child foreground belongs to the articulated child, not a second baked
        # fist/foot on its parent. Overlap caps below restore the joint itself.
        children={side+'UpperArm':[side+'Forearm'] for side in ['back','front']}
        children.update({side+'Forearm':[side+'Hand'] for side in ['back','front']})
        children.update({side+'Thigh':[side+'Shin'] for side in ['back','front']})
        children.update({side+'Shin':[side+'Foot'] for side in ['back','front']})
        exclusions=children.get(part,[])+d.get('occlusionSubtract',{}).get(part,[])
        for child in exclusions:
            removal=Image.new('L',source.size);ImageDraw.Draw(removal).polygon(d['parts'][child][0],fill=255)
            if part=='torso':removal=removal.resize((128,128),Image.Resampling.NEAREST).filter(ImageFilter.MaxFilter(3)).resize(source.size,Image.Resampling.NEAREST)
            mask=ImageChops.subtract(mask,removal)
        for erased in d.get('occlusionErase',[]):
            if erased['part']==part:
                removal=Image.new('L',source.size);ImageDraw.Draw(removal).polygon(erased['polygon'],fill=255);mask=ImageChops.subtract(mask,removal)
        cut=source.copy();cut.putalpha(mask)
        patches=Image.new('RGBA',source.size);pd=ImageDraw.Draw(patches)
        for patch in d.get('occlusionFills',[]):
            if patch['part']==part:
                pm=Image.new('L',source.size);ImageDraw.Draw(pm).polygon(patch['polygon'],fill=255)
                if part=='torso':pm=pm.resize((128,128),Image.Resampling.NEAREST).filter(ImageFilter.MaxFilter(3)).resize(source.size,Image.Resampling.NEAREST)
                paint=Image.new('RGBA',source.size,patch['color']);paint.putalpha(pm);patches.alpha_composite(paint)
        patches.putalpha(ImageChops.multiply(patches.getchannel('A'),semantic))
        patches.alpha_composite(cut);cut=patches.resize((128,128),Image.Resampling.NEAREST)
        # Expand joints only beneath the real source cutout; these small caps prevent
        # transparent wedges when rotating a joint that was occluded in the render.
        under=Image.new('RGBA',(128,128));ud=ImageDraw.Draw(under)
        if part.endswith(('UpperArm','Forearm','Thigh','Shin')):
            color=d['colors']['arm' if ('Arm' in part or 'Forearm' in part) else 'leg']
            radius=3 if ('Arm' in part or 'Forearm' in part) else 4
            for p in [pivot,end]:
                if p:ud.ellipse((p[0]-radius,p[1]-radius,p[0]+radius,p[1]+radius),fill=color)
        under.alpha_composite(cut);cut=under
        bounds=cut.getbbox();cropped=cut.crop(bounds);cropped.save(folder/f'{part}.png')
        info['parts'][part]={'url':f'/fighters/{name}/{part}.png','rect':list(bounds),'pivot':[pivot[0]-bounds[0],pivot[1]-bounds[1]],'bindPivot':pivot,'end':end,'bindAngle':math.atan2(end[1]-pivot[1],end[0]-pivot[0]) if end else 0}
        sheet.alpha_composite(cut,((i%5)*128,(i//5)*128));sd.text(((i%5)*128+3,(i//5)*128+3),part,fill='white')
    # Composite at bind pose supplies a transparent menu/full-body preview.
    order=['backThigh','backShin','backFoot','backUpperArm','backForearm','backHand','frontThigh','frontShin','frontFoot','pelvis','torso','head','frontUpperArm','frontForearm','frontHand']
    for part in order:
        p=info['parts'][part];asset=Image.open(folder/f'{part}.png');composite.alpha_composite(asset,tuple(p['rect'][:2]))
    composite.save(folder/'bind.png');composite.crop((18,0,106,75)).save(folder/'portrait.png')
    sheet.save(ROOT/'art/higgsfield/processed'/f'{name}-parts.png')
    metadata['fighters'][name]=info
(ROOT/'art/higgsfield/rig-data.json').write_text(json.dumps(metadata,indent=2)+'\n')
(OUT/'rig-data.json').write_text(json.dumps(metadata,indent=2)+'\n')
print('Built',len(metadata['fighters']),'rigs, 15 transparent parts each, metadata and contact sheets.')
