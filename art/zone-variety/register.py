"""Register these arenas without replacing existing zones or location artwork."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
rows=json.loads((HERE/'requests.json').read_text());path=ROOT/'src/stage.ts';s=path.read_text()
m=re.search(r'export type StageId = ([^;]+);',s);value=m[1]
for row in rows:
 if repr(row['id']) not in value:value+=' | '+repr(row['id'])
s=s[:m.start(1)]+value+s[m.end(1):]
at=s.index('\n];',s.index('export const STAGES:'))
entries=[]
for row in rows:
 if "id:'"+row['id']+"'" in s or '"id": "'+row['id']+'"' in s:continue
 parent=re.search(r"\{id:'"+row['zone']+r"',[^\n]+",s)[0];accent=re.search(r"accent:'([^']+)'",parent)[1]
 entries.append('    '+json.dumps(dict(id=row['id'],name=row['name'],theme=row['zone'].title()+' / '+row['name'],accent=accent,chapter=None))+',')
s=s[:at]+'\n'+'\n'.join(entries)+s[at:];path.write_text(s)
path=ROOT/'src/stageVariants.ts';s=path.read_text();match=re.search(r'(STORY_LOCATIONS:readonly StoryLocation\[\]=)(\[.*?\]);',s,re.S);locations=json.loads(match[2]);added={}
for row in rows:
 ident='zone-variety-'+row['id'];index=next((i for i,x in enumerate(locations) if x['id']==ident),len(locations))
 if index==len(locations):locations.append(dict(id=ident,stage=row['zone'],title=row['name'],image='/stages/higgsfield/'+row['id']+'.png',width=1280,height=720))
 added.setdefault(row['zone'],[]).append(index)
s=s[:match.start(2)]+json.dumps(locations,indent=2)+s[match.end(2):]
for zone,indices in added.items():
 pattern=r'(^ '+zone+r':\[)([^\]]*)(\],)';match=re.search(pattern,s,re.M)
 if match:
  old=[int(i) for i in match[2].split(',') if i.strip()];values=old+[i for i in indices if i not in old];s=s[:match.start(2)]+','.join(map(str,values))+s[match.end(2):]
 else:
  at=s.index('\n};',s.index('const regionOrder:'));s=s[:at]+'\n '+zone+':['+','.join(map(str,indices))+'],'+s[at:]
s=s.replace(' * Regions without variations (Bar and Hatchery) retain their original scenery.',' * Every story zone has themed locations, including Bar and Hatchery.')
path.write_text(s)
print('Registered 14 free-play stages and story locations across seven zones.')
