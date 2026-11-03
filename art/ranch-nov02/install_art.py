"""Install the three Ranch panoramas without replacing existing scenery."""
import concurrent.futures, hashlib, json, subprocess
from pathlib import Path
from PIL import Image
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
def install(job):
    assert job['status']=='completed'
    source=HERE/'raw'/f'{job["id"]}.png'
    if not source.exists():
        subprocess.run(['curl','-fLsS','--connect-timeout','10','--max-time','120',job['result_url'],'-o',str(source)],check=True)
    original=Image.open(source)
    assert original.size==(3840,2160)
    image=original.convert('RGB').resize((1280,720),Image.Resampling.NEAREST)
    destination=ROOT/'public/stages/higgsfield'/f'{job["id"]}.png'
    image.save(destination,optimize=True)
    return dict(id=job['id'],name=job['name'],image='/stages/higgsfield/'+job['id']+'.png',size=list(image.size),sourceSize=list(original.size),sha256=hashlib.sha256(destination.read_bytes()).hexdigest(),job_id=job['job_id'])
if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        report=list(pool.map(install,json.loads((HERE/'jobs.json').read_text())))
    (HERE/'art-report.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
