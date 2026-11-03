"""Install only Pissing Sproto's new assist art and its explicit partner links."""
import hashlib,json,re,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent
EXPANSION=HERE.parent
ROOT=EXPANSION.parents[1]
refs={r['id']:r for r in json.loads((EXPANSION/'inventory.json').read_text())}
source=EXPANSION/'processed/sproto3152-assist'
config=json.loads((source/'metadata.json').read_text())
dest=ROOT/'public/fighters/assist/sproto3152'
dest.mkdir(parents=True,exist_ok=True)
for image in source.glob('[0-9][0-9].png'):shutil.copy2(image,dest/image.name)
manifest_path=ROOT/'public/fighters/pose-atlas.json'
manifest=json.loads(manifest_path.read_text())
manifest['fighters']['sproto3152']['clips'].update(config['clips'])
manifest['revision']='pissing-assist-'+hashlib.sha256(''.join(hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(dest.glob('*.png'))).encode()).hexdigest()[:12]
manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
core_path=ROOT/'src/core.ts'
def update(match):
    indent,ident,raw=match.groups();ref=refs.get(ident)
    if not ref or 'partner' not in ref:return match.group(0)
    data=json.loads(raw)
    if 'color' not in data or 'name' not in data:return match.group(0)
    data['partner']=ref['partner']
    if ident=='sproto3152':data['name']=ref['name']
    return indent+ident+': '+json.dumps(data)+','
core=re.sub(r'^([ \t]*)(sproto\d+):[ \t]*(\{[^\n]*\}),$',update,core_path.read_text(),flags=re.M)
core_path.write_text(core)
print('Installed 32 assist drawings and partner links for '+str(sum(r.get('partner')=='sproto3152' for r in refs.values()))+' fighters.')
