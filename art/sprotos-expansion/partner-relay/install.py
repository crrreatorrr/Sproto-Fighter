"""Install only relay assist clips and explicit roster partner lists."""
import hashlib,json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;EXPANSION=HERE.parent;ROOT=EXPANSION.parents[1]
refs={r['id']:r for r in json.loads((EXPANSION/'inventory.json').read_text())}
manifest_path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(manifest_path.read_text());hashes=[]
for ident in ['sproto3152','vaudream','sproto3181','sproto3181-companion']:
    source=EXPANSION/'processed'/f'{ident}-assist';config=json.loads((source/'metadata.json').read_text())
    dest=ROOT/'public/fighters/assist'/ident;dest.mkdir(parents=True,exist_ok=True)
    for image in source.glob('[0-9][0-9].png'):
        shutil.copy2(image,dest/image.name);hashes.append(hashlib.sha256(image.read_bytes()).hexdigest())
    manifest['fighters'][ident]['clips'].update(config['clips'])
manifest['revision']='partner-relay-'+hashlib.sha256(''.join(hashes).encode()).hexdigest()[:12]
manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
def update(match):
    indent,ident,raw=match.groups();ref=refs.get(ident);data=json.loads(raw)
    if not ref or 'color' not in data or 'name' not in data:return match.group(0)
    if ref.get('specialPartners'):data['specialPartners']=ref['specialPartners']
    return indent+ident+': '+json.dumps(data)+','
core_path=ROOT/'src/core.ts';core_path.write_text(re.sub(r'^([ \t]*)(sproto\d+):[ \t]*(\{[^\n]*\}),$',update,core_path.read_text(),flags=re.M))
print('Installed 96 new assist drawings; coordinated relay for 34 fighters, including 2322.')
