import json,sys,importlib.util,concurrent.futures
from pathlib import Path
from PIL import Image,ImageDraw
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[2]
plan={x['id']:x for x in json.loads((HERE.parent/'plan.json').read_text())}
def run(j):
 spec=importlib.util.spec_from_file_location('proc',ROOT/'art/sprotos-expansion/process.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);m.HERE=HERE
 (m.HERE/'raw').mkdir(exist_ok=True)
 if j['kind']=='motion':
  p=m.HERE/'anchors.json';a=json.loads(p.read_text()) if p.exists() else {};a[j['entity']+'-motion']={'scaleFromFrame':30};p.write_text(json.dumps(a,indent=2)+'\n')
 try:return m.process(j)
 except Exception as e:return {'entity':j['entity'],'kind':j['kind'],'error':str(e)}
jobs=[j for j in json.loads((HERE/'jobs.json').read_text()) if not j.get('superseded') and j.get('status')=='completed' and (len(sys.argv)<2 or j['kind']==sys.argv[1])]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(run,jobs))
for r in results:print(json.dumps(r),flush=True)
(HERE/'process-report.json').write_text(json.dumps(results,indent=2)+'\n')
