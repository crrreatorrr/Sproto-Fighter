import json,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent;BASE=HERE.parent
jobs=json.loads((HERE/'jobs.json').read_text());assert all(j['status']=='completed' for j in jobs if not j.get('superseded'))
for kind in ['core','walk','motion']:
 name='solanadelray-'+kind;src=HERE/'processed'/name;assert (src/'metadata.json').exists()
 expected=next(j for j in reversed(jobs) if j['kind']==kind and not j.get('superseded'))
 assert (src/'source-job.txt').read_text().strip()==expected['job_id'],kind+' source mismatch'
 backup=HERE/'previous-processed'/name
 if not backup.exists():backup.parent.mkdir(exist_ok=True);shutil.copytree(BASE/'processed'/name,backup)
 shutil.copytree(src,BASE/'processed'/name,dirs_exist_ok=True)
old=json.loads((BASE/'jobs.json').read_text());old=[{**j,**({'superseded':True} if j['entity']=='solanadelray' and j['kind']!='events' else {})} for j in old]
seen={j.get('job_id') for j in old};old.extend(j for j in jobs if j['job_id'] not in seen)
(BASE/'jobs.json').write_text(json.dumps(old,indent=2)+'\n')
p=json.loads((BASE/'plan.json').read_text());p[0]['currentArtRevision']='art/solanadelray/face-revision';p[0]['refinedParts']=['core','walk','motion'];p[0]['retainedEventSource']='88d91aa3-76ea-431e-8f5d-beeec4a0e789';(BASE/'plan.json').write_text(json.dumps(p,indent=2)+'\n')
print('Reference-matched face revision staged for scoped install.')
