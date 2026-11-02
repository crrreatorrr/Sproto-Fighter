import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
# Deliberate little pixel objects; letters are palette indices, spaces transparent.
icons={
'fist':[' aaaa','aaaaaa','abbbbbba','abbbbbba',' abbbba','  aaaa'],
'bottle':['  aa','  ab',' aaaa','abbbba','abccba','abccba',' abba'],
'yoyo':['  aaaa',' abbbba','abcaacba','abcaacba',' abbbba','  aaaa'],
'grin':['aa      aa','abbaaaabba',' abbbbbba','  acccca','   aaaa'],
'camera':['   aaa',' aaaaaaaa','abbbbbbbba','abbaccabba','abbaccabba','abbbbbbbba',' aaaaaaaa'],
'chain':[' aaa   aaa','abbba abbba','ab abbba ba','abbba abbba',' aaa   aaa'],
'case':['   aaaa','  aaaaaa',' aaaaaaaa','abbbbbbbba','abbbccbbba','abbbbbbbba',' aaaaaaaa'],
'fan':['    a','  aabaaa',' aabbbaaa','aabbbbbaaa','   abb','    aa'],
'shield':['aaaaaaaa','abbbbbba','abccbcba','abccbcba',' abbbba','  abba','   aa'],
'feather':['     aa','   aabba','  abbbba',' abbbaa','abbaa',' aaa','aa'],
'bubble':[' aaaaaaaa','abbbbbbbba','abccbbccba','abbbbbbbba',' abbaaaba','   aa'],
'envelope':['aaaaaaaaaa','abbbaabbba','abbbccbbba','abbbbbbbba','aaaaaaaaaa'],
'cone':['      a','   aaaba','aaabbbba','   aaaba','      a'],
'crown':['a   a   a','ab ab ab a','abbbbbbbba','abccbbccba',' aaaaaaaa'],
'torch':['   b','  bcb',' bcccb','  bbb','  aaa','   a','   a'],
'pendant':['a      a',' a    a','  a  a','  abba',' abccba','  abba','   aa'],
'beetle':[' aa aa','  aaa',' abbba','abbabba','abbb bba',' abbba',' aa aa'],
'nunchuk':[' aa      aa',' abaaaaaaab',' ab      ab',' ab      ab',' aa      aa'],
'mask':[' aaaa aaaa','abbbbabbbba','abccbabccba','abbbbabbbba',' aaaaaaaa'],
'scepter':['   aaa','  abcba','   aaa','    a','    a','   aaa','    a'],
'monocle':[' aaaa','abbbba','abccbaaa','abbbba',' aaaa a','      a'],
'teeth':['aaaaaaaaaa','abcbcbcbca','abcbcbcbca',' aaaaaaaa'],
'planet':['    aaaa',' aabbbbaaa','abbbbbbbba',' aaaabbbaa','    aaaa'],
'ribbon':['a       a','ab     ba','abba abba',' abbbbba','  aabaa',' ab  ba',' a    a'],
'fish':['  aa    a',' abba aaba','abbbbbbbba','abccbbbbba',' abba aaba','  aa    a'],
'bat':['a        a','ab aaaa ba','abbabbabba',' abbbbbba','  abbbba','   aaaa'],
'sun':['  a a a',' aaaaaaa',' aabbbaa','aabccbbbaa',' aabbbaa',' aaaaaaa','  a a a'],
'column':[' aaaaaa','abccbcba','abbbbbba',' aaaaaa','abbbbbba','abccbcba',' aaaaaa'],
'staff':['   aaaa','  abbbba','  ab a a','   aaa','    a','    a','    a','    a'],
'lasso':[' aaaaa','abbbbba','ab aa ba','abbbbba',' aaaaaa','      a','      a'],
'comb':['a a a a a','aba aba aba','abbbbbbbba',' aaaaaaaa'],
'spring':['      aa','   aaabb',' aaabb',' abbaa','   abbaa','    abb',' aaaabb','aa'],
'marble':['   aaa',' aabbbba','abccbbbba','abbbbbcba','abbbbbbaa',' aabbbba','   aaa'],
'eye':['   aaaaa',' aabbbbbaa','abbaccbbba',' aabbbbbaa','   aaaaa'],
'domino':['aaaaaa','abccba','abccba','abbbba','aaaaaa','abccba','aaaaaa'],
'button':[' aaa  aaa','abcbaabcba',' abc  abc','  aaaaa','   aba','   aaa'],
'pin':['  aa',' abba',' abba','  aa',' abba','abbbba',' aaaa'],
'star':['    a','   aba','aaabbbaaa',' abbbbba','  abbba',' abb bba','aa   aa'],
'axe':['      aaa',' aaaabccca','abbabcccca',' aaaabccca','    a aaa','    a','    a'],
'crescent':['   aaaa',' aabbaa',' abb','abb',' abb',' aabbaa','   aaaa'],
'pinwheel':[' aa   a',' abba aa','  abbaaba','aaabbbbaaa',' ababba',' aa abba',' a   aa'],
'medal':['aa    aa',' ab  ba','  abba',' abccba','  abba','   aa'],
'tie':['  aaaa','   ab','  abba','  abba',' abbbba','  abba','   aa'],
'collar':['aa      aa',' ab    ba',' abbaabba','  abbbba','   abba','    aa'],
'mitten':['   aaa','  abbba','aaabbba','abbbbba',' abbbba','  aaaa'],
'snow':['a   a   a',' aa a aa','  aaaaa','aaaabaaaa','  aaaaa',' aa a aa','a   a   a'],
'heart':[' aaa aaa','abbbabbba','abbbbbbba',' abbbbba','  abbba','   aba','    a'],
'cap':[' aaaaaaa','abbbbbbba','abbbbbbba',' aaaaaaaaaaa'],
'satellite':[' aa      aa','abbaaaaabba',' abbcccbba','abbaaaaabba',' aa      aa','     a','    aaa'],
'cape':['aaa   aaa',' abaaaba',' abbbbba','abbbbbbba','abbbbbbba','aabbbbbaa','a  aaa  a'],
'bow':['aaa   aaa','abbaaabba','abbacabba','abbaaabba','aaa   aaa'],
'horn':['       aa',' aaaaabbb','abbbbbaaa',' aaaaabbb','       aa'],
'cartridge':[' aaaaaaaa','abbbbbbbba','abccccccba','abccccccba','abbbbbbbba',' aaaaaaaa','  a a a'],
'claw':['a  a  a','ab ab ab','abbabbab',' abbbba','  abba','   aa'],
'crest':['aaaaaa','abbbba','abaaaa','abbba','abaaa','ab','aa'],
'glasses':[' aaaa aaaa','abbbbabbbba','abccbabccba',' aaaa aaaa','a         a'],
'mic':['  aaaa',' abccba',' abccba','  aaaa','   ab','   ab','   aa'],
'gear':['  aa  aa',' aaa aaaa','aabbbbbbaa',' abccbcba','aabbbbbbaa',' aaa aaaa','  aa  aa'],
'brain':['  aaaaaa',' aabcabba','abccabcba','abacccabba',' aabccbaa','   aaaa'],
'cup':[' aaaaaaa','abbbbbbaa','abbbbba ba','abbbbbaaa',' abbbba',' aaaaaaaa'],
'jester':['aa  aa  aa',' ab ab ab',' abbbbbba','  abbbba','   aaaa'],
'fang':['aaaaaa','abbbba',' abbbba','  abbba','   aba','    a']}
# One explicit semantic recipe per owner, based on its face, outfit, prop or name.
recipes=[(0,'fist','star','gold knuckle meteor'),(5,'bottle','bubble','bong smoke flask'),(7,'yoyo','ribbon','corded yo-yo'),(8,'grin','teeth','red smile boomerang'),(13,'camera','star','camera flash'),(21,'chain','fist','linked duet gauntlets'),(22,'fist','claw','bare-knuckle fist'),(25,'case','tie','executive briefcase'),(26,'fan','collar','gold robe fan'),(27,'shield','eye','eye-emblem shield'),(28,'feather','star','levitating feather'),(29,'bubble','grin','meme speech bubble'),(31,'envelope','crest','sealed ENS envelope'),(32,'cone','eye','long-nose dart'),(34,'crown','heart','royal crown'),(35,'torch','medal','resolve torch'),(36,'pendant','teeth','toothy pendant'),(37,'beetle','eye','red-eyed beetle'),(38,'nunchuk','chain','red-blue nunchucks'),(39,'mask','glasses','double-face mask'),(41,'scepter','crown','tiny-king scepter'),(42,'mitten','fist','red palm glove'),(43,'monocle','eye','asymmetric monocle'),(44,'teeth','ribbon','gold-tooth comb'),(45,'planet','button','orbital eyes'),(46,'ribbon','horn','red ribbon dart'),(47,'fish','grin','strange-lipped flying fish'),(48,'bat','fang','vampire bat'),(49,'sun','cape','sun-hair flare'),(50,'column','mask','stacked-face totem'),(51,'staff','crescent','spiral staff glyph'),(52,'lasso','button','shoulder-loop lasso'),(53,'comb','crown','yellow crest comb'),(54,'spring','fang','zigzag fang spring'),(55,'fan','feather','orange spike fan'),(56,'marble','ribbon','blue belly marble'),(57,'eye','star','eye-mark disc'),(58,'domino','teeth','twin-tooth domino'),(59,'button','marble','figure-eight buttons'),(60,'pin','bow','duet juggling pin'),(61,'star','sun','yellow-hair shooting star'),(62,'axe','fang','hooked halberd blade'),(63,'crescent','mask','floating crescent mask'),(64,'pinwheel','sun','red-yellow pinwheel'),(65,'medal','shield','vest relay medal'),(66,'tie','pendant','yellow tie pendant'),(67,'collar','star','white collar star'),(68,'mitten','sun','giant yellow mitten'),(69,'snow','eye','mint snow-eye crystal'),(70,'heart','cape','red-blue heart brooch'),(71,'sun','grin','golden grin sun'),(73,'pinwheel','teeth','toothy windmill'),(74,'staff','monocle','sage staff seal'),(75,'staff','ribbon','twisted candy staff'),(76,'cap','grin','yellow-cap spinner'),(79,'satellite','mask','stomach-creature satellite'),(80,'cape','shield','hero mantle crest'),(81,'bow','teeth','red bow-tie blade'),(82,'horn','grin','lip trumpet'),(83,'cartridge','eye','machine game cartridge'),(84,'claw','pendant','claw medallion'),(85,'crest','bow','duet F crest'),(86,'medal','heart','blue-gold robe medallion'),(87,'button','collar','yellow belt buckle'),(88,'glasses','claw','cat spectacles'),(89,'mic','ribbon','stage microphone'),(91,'mask','eye','triclops face shield'),(92,'gear','pin','robot bolt gear'),(93,'column','eye','stacked-eye tower'),(94,'tie','case','formal red necktie'),(95,'fang','claw','cat-fang crescent'),(96,'brain','heart','orange brain pulse'),(97,'heart','eye','cyclops heart sigil'),(98,'cup','medal','sober tea-cup seal'),(99,'jester','horn','clown horn cap'),(100,'grin','mask','double-mouth chatter'),(101,'button','eye','yellow belly-button disc')]
assert len(recipes)==77
catalog={str(i):dict(icon=icon,detail=detail,name=name,color=('#efbd44' if i in [0,26,27,28,34,35,36,41,44,49,53,54,55,57,59,60,61,64,65,66,68,71,73,74,76,84,86,87,101] else '#e84d55' if i in [8,38,42,46,62,70,81,82,94,95] else '#d5e7e8' if i in [22,25,43,63,67,69,88,89,91,92] else '#6a9ee9')) for i,icon,detail,name in recipes}
(root/'art/identity-actions/projectile-catalog.json').write_text(json.dumps(dict(icons=icons,projectiles=catalog),indent=2)+'\n')
p=root/'src/powerArt.ts';s=p.read_text();start=s.index(" else if(shape.startsWith('signature:')){")+len(" else if(shape.startsWith('signature:')){")+1;end=s.index('\n }\n else if',start);s=s[:start]+"  drawSignatureObject(c,Number(shape.split(':')[1]),age,color);"+s[end:]
append='''
/** Individually selected object silhouettes, tied to costume, anatomy and props. */
const SIGNATURE_ICONS:Record<string,string[]> = ICON_DATA;
export const SIGNATURE_OBJECTS:Record<number,{icon:string;detail:string;name:string;color:string}> = CATALOG_DATA;
function drawSignatureObject(c:CanvasRenderingContext2D,index:number,age:number,color:string){
 const item=SIGNATURE_OBJECTS[index];if(!item)return;
 const palette:Record<string,string>={a:'#152036',b:item.color,c:'#ffe05a'};
 const draw=(name:string,ox:number,oy:number,scale:number,detail=false)=>{
  const lines=SIGNATURE_ICONS[name],width=Math.max(...lines.map(r=>r.length));
  for(let y=0;y<lines.length;y++)for(let x=0;x<lines[y].length;x++){
   const bit=lines[y][x];if(bit===' ')continue;
   c.fillStyle=detail&&bit==='b'?'#e34c4b':palette[bit];
   c.fillRect(Math.round(ox+(x-width/2)*scale),Math.round(oy+(y-lines.length/2)*scale),scale,scale);
  }
 };
 // The secondary object is a meaningful attached ornament, not an ID stamp.
 draw(item.icon,-3,1,3);draw(item.detail,14,-10,2,true);
}
'''.replace('ICON_DATA',json.dumps(icons)).replace('CATALOG_DATA',json.dumps(catalog))
s=s.split('/** Individually selected object silhouettes',1)[0];s+='\n'+append;p.write_text(s)
