import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent;sys.path.insert(0,str(ROOT/'art/sprotos-expansion'));import make_requests as m
jobs=json.loads((HERE/'jobs.json').read_text());requests=[]
for info in json.loads((HERE/'plan.json').read_text()):
 p=ROOT/info['artDirectory'];base=json.loads((p/'core-request.json').read_text())[0]['params'];core=next(j for j in jobs if j['entity']==info['id'] and j['kind']=='core');own=[]
 for offset,kind,poses in [(1,'walk',m.WALK),(2,'events',m.EVENTS)]:
  params={**base,'resolution':'2k' if kind=='walk' else '4k','aspect_ratio':'4:3' if kind=='walk' else '9:16','medias':base['medias']+[{'role':'image','value':core['job_id']}],'prompt':m.STYLE+'\n\nIDENTITY: '+info['identity']+' Reference image 2 is the approved combat sheet: match its proportions and pixel style exactly.\n\n'+poses+info['appearanceRule']}
  req={'index':info['ordinal']*3+offset,'entity':info['id'],'fighter':info['id'],'kind':kind,'params':params};requests.append(req);own.append(req)
 (p/'sequence-requests.json').write_text(json.dumps(own,indent=2)+'\n')
(HERE/'sequence-requests.json').write_text(json.dumps(requests,indent=2)+'\n')
