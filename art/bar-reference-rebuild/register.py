"""Refresh only Bar venue metadata and put the main reference bar on its story route."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
rows=json.loads((HERE/'requests.json').read_text());names={r['id']:r['name'] for r in rows}
p=ROOT/'src/stage.ts';s=p.read_text()
for ident,name in names.items():
 if ident=='bar':continue
 pattern=r'^    (\{"id": "'+ident+r'"[^\n]+\}),$';m=re.search(pattern,s,re.M);assert m
 item=json.loads(m[1]);item.update(name=name,theme='The Bar / '+name);s=s[:m.start(1)]+json.dumps(item)+s[m.end(1):]
# The regenerated panorama provides its own clear floor, matching the reference.
s=s.replace("        if(id==='bar')drawBarApron(ctx);\n",'')
a=s.index('/** A clear fighting floor in front of the bar');b=s.index('export function drawStage(',a);s=s[:a]+s[b:];p.write_text(s)
p=ROOT/'src/stageVariants.ts';s=p.read_text();m=re.search(r'(STORY_LOCATIONS:readonly StoryLocation\[\]=)(\[.*?\]);',s,re.S);locations=json.loads(m[2])
for x in locations:
 for ident,name in names.items():
  if x['image']=='/stages/higgsfield/'+ident+'.png':x['title']=name
index=next((i for i,x in enumerate(locations) if x['id']=='reference-main-bar'),len(locations))
if index==len(locations):locations.append(dict(id='reference-main-bar',stage='bar',title=names['bar'],image='/stages/higgsfield/bar.png',width=1280,height=720))
s=s[:m.start(2)]+json.dumps(locations,indent=2)+s[m.end(2):];m=re.search(r'(^ bar:\[)([^\]]*)(\],)',s,re.M);assert m
pool=[int(i) for i in m[2].split(',') if i.strip()];pool=[index]+[i for i in pool if i!=index];s=s[:m.start(2)]+','.join(map(str,pool))+s[m.end(2):];p.write_text(s)
print('Updated six Bar arenas; first Bar story location is now the main reference bar.')
