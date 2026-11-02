import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
jobs=json.loads((HERE/'jobs.json').read_text());template=(ROOT/'art/gpm/install.py').read_text();smoke=(ROOT/'scripts/gpm-smoke.mjs').read_text()
for info in json.loads((HERE/'plan.json').read_text()):
 id=info['id'];p=ROOT/info['artDirectory'];(p/'jobs.json').write_text(json.dumps([j for j in jobs if j['entity']==id],indent=2)+'\n')
 if id=='captain':continue
 i=info['ordinal'];shape=['orb','prism','ring','arrow','chadCoin','pixel','orb'][i]
 roster={'name':info['name'],'color':info['color'],'dark':'#253783','speed':5.5,'jump':15.8,'partner':'rivet','special':info['special'],'role':info['role'],'description':f'Reference-based pixel art and a four-contact {info["special"].title()}.'}
 kit=f" {id}:kit({json.dumps(info['role'])},{json.dumps(info['special'])},{json.dumps('Distinct strikes and a four-contact '+info['special'].title()+'.')},{80+i},{{range:{126+i*3},damage:{91+i}}},{{startup:{14+i},recovery:25,damage:{56+i}}},{{speed:{10+i},shape:'{shape}'"+(f",horizontal:true,origin:{{forward:47.5,height:95}}" if id=='michael' else '')+f"}},[15,27,39,51],{{range:{560+i*12},damage:{74+i},push:4}},1),"
 s=template.replace('gpm',id).replace('GPM',id.upper())
 s=re.sub(r'    roster=.*\n','    roster='+repr(id+':'+json.dumps(roster,separators=(',',':'))+',')+'\n',s)
 s=re.sub(r'    kit=.*\n','    kit='+repr(kit)+'\n',s)
 (p/'install.py').write_text(s)
 test=smoke.replace('gpm',id).replace('GPM',info['name']).replace('BULWARK',info['role']).replace('Bright Burst',info['special'].title()).replace('Round blue silhouette and glossy eyes','Reference identity').replace('Blue fur, yellow eye markings, glossy black pupils and black nose','Reference face, clothing, colors and anatomy')
 if not (ROOT/'scripts'/f'{id}-smoke.mjs').exists():(ROOT/'scripts'/f'{id}-smoke.mjs').write_text(test)
# Default Captain installation now consumes the cape revision; old sources are preserved.
s=(ROOT/'art/captain/install.py').read_text();s=s.replace('HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]','HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]\nHERE=ROOT/\'art/captain-cape\'')
if 'eye-aligned' in s:
 (ROOT/'art/captain-cape/install.py').write_text(s)
 sys.exit(0)
a=s.index('    release=Image.open(');b=s.index("    (HERE/'laser-origin.json')",a)
s=s[:a]+"    # Reviewed near-eye point in cast release cel14; the second beam begins 25 world pixels behind it.\n    point=[147.0,123.0];emitter={'forward':round((point[0]-112)*cfg['scale'],3),'height':round((210-point[1])*cfg['scale'],3)}\n"+s[b:]
s=s.replace('palm-aligned','eye-aligned').replace('Palm-fired laser bolts','Eye-fired laser bolts and a flowing yellow cape').replace('Straight palm lasers','Straight eye lasers').replace("shape:'laser'","shape:'eyeLaser'")
(ROOT/'art/captain/install.py').write_text(s);(ROOT/'art/captain-cape/install.py').write_text(s)
s=(ROOT/'scripts/captain-smoke.mjs').read_text().replace("'laser'","'eyeLaser'").replace('reviewed palm','reviewed eyes').replace('palm emission','eye emission').replace('r.w>=70','r.w>=60')
(ROOT/'scripts/captain-smoke.mjs').write_text(s)
