import json,importlib.util
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
plan={x['id']:x for x in json.loads((HERE/'plan.json').read_text())};jobs=json.loads((HERE/'jobs.json').read_text());results=[]
for j in jobs:
 if j.get('status')!='completed':continue
 spec=importlib.util.spec_from_file_location('processor',ROOT/'art/sprotos-expansion/process.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);m.HERE=ROOT/plan[j['entity']]['artDirectory']
 try:
  result=m.process(j);results.append(result);print(result,flush=True)
  im=Image.open(m.HERE/'processed'/f'{j["entity"]}-{j["kind"]}'/'contact.png');im.thumbnail((640,1280));im.save('/Users/kenhiraoka/Documents/Codex/2026-11-01/u/work/'+j['entity']+'-'+j['kind']+'.png')
 except Exception as e:print('ERROR',j['entity'],j['kind'],str(e),flush=True);results.append({'entity':j['entity'],'kind':j['kind'],'error':str(e)})
(HERE/'process-report.json').write_text(json.dumps(results,indent=2)+'\n')
