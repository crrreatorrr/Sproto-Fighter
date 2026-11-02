"""Install new zone scenery; preserve sources and clear foreground floor margins."""
import json,subprocess,concurrent.futures,hashlib
from pathlib import Path
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
def process(job):
 assert job['status']=='completed';source=HERE/'raw'/f'{job["id"]}.png'
 if not source.exists():subprocess.run(['curl','-fLsS','--connect-timeout','10','--max-time','90',job['result_url'],'-o',str(source)],check=True)
 image=Image.open(source).convert('RGB');assert image.width/image.height>1.7 and image.width/image.height<1.85
 image=image.resize((640,360),Image.Resampling.NEAREST).resize((1280,720),Image.Resampling.NEAREST)
 if job['id'] in ('starbridge','chainforge'):
  original=image.copy();bands=[(0,0),(400,400),(600,680),(720,720)]
  for (a,x),(b,y) in zip(bands,bands[1:]):image.paste(original.crop((0,a,1280,b)).resize((1280,y-x),Image.Resampling.NEAREST),(0,x))
 dest=ROOT/'public/stages/higgsfield'/f'{job["id"]}.png';image.save(dest,optimize=True)
 preview=image.copy();preview.thumbnail((960,540));preview.save('/Users/kenhiraoka/Documents/Codex/2026-11-01/u/work/stage-'+job['id']+'.png')
 return {'id':job['id'],'name':job['name'],'size':image.size,'sourceSize':Image.open(source).size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'job_id':job['job_id']}
if __name__=='__main__':
 jobs=json.loads((HERE/'jobs.json').read_text())
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:report=list(pool.map(process,jobs))
 (HERE/'art-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
