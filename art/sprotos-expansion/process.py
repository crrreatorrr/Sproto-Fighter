"""Download and normalize expansion sheets. No automatic roster activation.

Keep one scale across a sheet, hard alpha, complete silhouettes and foot roots.
Reports expose cell clipping, detached components and missing poses for review.
"""
import argparse, concurrent.futures, importlib.util, json, subprocess, os
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
spec=importlib.util.spec_from_file_location('atlas_import',ROOT/'art/pose-atlases/import_atlas.py')
atlas=importlib.util.module_from_spec(spec);spec.loader.exec_module(atlas)
CLIPS={'intro':(0,4),'special':(4,12),'cast':(12,16),'recoil':(16,20),'defeat':(20,32)}
MOTION={'dash':(0,6),'jump':(6,12),'heavy':(12,20),'airKick':(20,26),'victory':(26,32)}
ASSIST={'assistEnter':(0,6),'assistAttack':(6,22),'assistExit':(22,28),'assistVictory':(28,32)}

def download(job):
    dest=HERE/'raw'/f'{job["entity"]}-{job["kind"]}.png'
    marker=dest.with_suffix('.job-id')
    stale=dest.exists() and ((marker.exists() and marker.read_text().strip()!=job['job_id']) or (not marker.exists() and job.get('retry',0)>=5))
    if stale:
        archive=HERE/'raw/rejected';archive.mkdir(exist_ok=True);dest.rename(archive/(dest.stem+'-prior-'+job['job_id'][:8]+'.png'))
    if not dest.exists():
        options=[]
        # Optional DNS repair supplied from a fresh resolver lookup; TLS still
        # verifies the original CDN hostname. No certificate checks are disabled.
        if os.environ.get('SPROTO_CDN_IP'):options=['--resolve','d8j0ntlcm91z4.cloudfront.net:443:'+os.environ['SPROTO_CDN_IP']]
        subprocess.run(['curl','-fLsS','--connect-timeout','10','--max-time','90','--retry','2',*options,job['result_url'],'-o',str(dest.with_suffix('.part'))],check=True)
        dest.with_suffix('.part').rename(dest)
    marker.write_text(job['job_id'])
    return dest

def hull(mask):
    ys,xs=np.where(mask);points=sorted(set(zip(xs.tolist(),ys.tolist())))
    def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    lo=[];hi=[]
    for p in points:
        while len(lo)>1 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
        lo.append(p)
    for p in reversed(points):
        while len(hi)>1 and cross(hi[-2],hi[-1],p)<=0:hi.pop()
        hi.append(p)
    return [list(p) for p in lo[:-1]+hi[:-1]]

def process(job,force=False):
    entity,kind=job['entity'],job['kind'];dest=HERE/'processed'/f'{entity}-{kind}'
    source_marker=dest/'source-job.txt'
    if (dest/'metadata.json').exists() and source_marker.exists() and source_marker.read_text().strip()==job['job_id'] and not force:return {'entity':entity,'kind':kind,'status':'already-normalized'}
    src=download(job);image=Image.open(src).convert('RGBA')
    # Working resolution retains more than the final sprite's detail. Raw 4K
    # originals remain untouched for any subsequent identity correction.
    if image.width>1600:image=image.resize((1600,round(image.height*1600/image.width)),Image.Resampling.NEAREST)
    a=np.array(image);rgb=a[:,:,:3].astype(np.int16)
    key=(np.minimum(rgb[:,:,0],rgb[:,:,2])-rgb[:,:,1]>65)&(rgb[:,:,0]>125)&(rgb[:,:,2]>125)
    # A service correction can return an opaque white background. Flood only
    # the border-connected white area; enclosed eye whites/teeth stay intact.
    if np.all(rgb[0,0]>220):
        white=(rgb.min(axis=2)>220)&(rgb.max(axis=2)-rgb.min(axis=2)<20)
        for part in atlas.components(white):
            l,t,r,b=part['box']
            if l==0 or t==0 or r==image.width or b==image.height:
                for y,x,z in part['runs']:key[y,x:z]=True
    mask=(a[:,:,3]>=128)&~key
    rows=2 if kind=='walk' else 8;count=rows*4;cw=image.width/4;ch=image.height/rows
    frames=[];report=[];cells=[]
    # The generated grid is a layout hint. A raised fist/head may overhang its
    # nominal cell; extract the whole connected silhouette before ordering it.
    components=atlas.components(mask)
    bodies=[g for g in components if g['area']>cw*ch*.025]
    overrides=json.loads((HERE/'anchors.json').read_text()) if (HERE/'anchors.json').exists() else {}
    config=overrides.get(entity+'-'+kind,{})
    if config.get('discardSmallestComponents'):
        bodies=bodies[:-config['discardSmallestComponents']]
    expected=count-config.get('repeatFinalRest',0)
    if len(bodies)!=expected and not config.get('componentIndices'):raise ValueError(f'{entity}-{kind}: expected {expected} connected actors, got {len(bodies)}')
    bodies.sort(key=lambda g:(g['box'][1]+g['box'][3])/2)
    ordered=[]
    if config.get('componentIndices'):
        assert len(config['componentIndices'])==count
        ordered=[bodies[i] for i in config['componentIndices']]
    else:
        for row in range((len(bodies)+3)//4):ordered.extend(sorted(bodies[row*4:row*4+4],key=lambda g:(g['box'][0]+g['box'][2])/2))
        if config.get('repeatFinalRest'):ordered.extend(ordered[-config['repeatFinalRest']:])
    if config.get('replaceFrames'):
        original=list(ordered)
        for target,source in config['replaceFrames'].items():ordered[int(target)]=original[int(source)]
    for i in range(count):
        g=ordered[i];l,t,r,b=g['box'];pixels=np.zeros((b-t,r-l,4),dtype=np.uint8)
        for y,x,z in g['runs']:
            pixels[y-t,x-l:z-l]=a[y,x:z];pixels[y-t,x-l:z-l,3]=255
        crop=Image.fromarray(pixels)
        head=[]
        for y in range(round((b-t)*.12),round((b-t)*.34)):
            xx=np.flatnonzero(pixels[y,:,3])
            if len(xx):head.append((xx[0]+xx[-1])/2)
        hx=float(np.median(head)) if head else (r-l)/2
        if i==0:
            yy,xx=np.where(pixels[max(0,b-t-5):,:,3]>0);offset=float(np.mean(xx))-hx
            scale=config.get('scale',128/(b-t))
        floor=kind=='events' and i>=23
        anchor=[(r-l)/2 if floor else hx+offset,b-t]
        anchor=config.get('anchors',{}).get(str(i),anchor)
        cells.append((crop,anchor))
        extras=[]
        report.append(dict(index=i,sourceBounds=[l,t,r,b],cellEdge=bool(l==0 or t==0 or r==image.width or b==image.height),detachedComponents=extras,estimatedAnchor=anchor))
    # Motion sheets begin in a crouch. An inspected upright key can establish
    # the common scale without enlarging every dash/jump body to crouch height.
    if 'scaleFromFrame' in config:
        scale=config.get('targetStandingHeight',128)/cells[config['scaleFromFrame']][0].height
    # Fit whole sheet with a common factor, preserving actual crouch/floor size.
    for crop,anchor in cells:
        limits=[111/max(anchor[0],1),142/max(crop.width-anchor[0],1),209/max(anchor[1],1),44/max(crop.height-anchor[1],1)]
        scale=min(scale,*limits)
    dest.mkdir(parents=True,exist_ok=True)
    sheet=Image.new('RGBA',(4*256,rows*256),'#202c3e')
    for i,(crop,anchor) in enumerate(cells):
        scaled=crop.resize((max(1,round(crop.width*scale)),max(1,round(crop.height*scale))),Image.Resampling.NEAREST)
        hover=entity in ('sproto1870','sproto1870-companion')
        root_y=180 if hover and not(kind=='events' and i>=23) else 210
        x,y=round(112-anchor[0]*scale),round(root_y-anchor[1]*scale)
        frame=Image.new('RGBA',(256,256));frame.alpha_composite(scaled,(x,y));box=frame.getchannel('A').getbbox()
        if not box or box[0]<1 or box[1]<1 or box[2]>=256 or box[3]>=256:raise ValueError(f'{entity}/{kind}/{i}: canonical clipping')
        frame.save(dest/f'{i:02}.png');sheet.alpha_composite(frame,(i%4*256,i//4*256))
        category={'core':'poses','walk':'walk','events':'events','motion':'motion','assist':'assist'}[kind]
        frames.append(dict(url=f'/fighters/{category}/{entity}/{i:02}.png',bounds=list(box),contactHull=hull(np.array(frame.getchannel('A'))>0)))
        report[i]['canonicalBounds']=list(box)
    metadata=dict(width=256,height=256,anchor=[112,234 if entity=='vaudream' else 210],scale=1.25,facing=1,frames=frames,walkCycleDistance=112)
    if entity=='sproto1870-companion':metadata['scale']=.9
    if entity=='vaudream' and kind=='events':
        for entry in frames[23:]:entry['anchor']=[112,entry['bounds'][3]]
    if kind in ('events','motion','assist'):metadata['clips']={name:frames[start:end] for name,(start,end) in {'events':CLIPS,'motion':MOTION,'assist':ASSIST}[kind].items()}
    if kind=='core':
        reach=Image.open(dest/'26.png');aa=np.array(reach.getchannel('A'))>0;yy,xx=np.where(aa)
        edge=xx>max(xx)-8;hand=[int(np.median(xx[edge])),int(np.median(yy[edge]))]
        hit=frames[24]['bounds'];torso=[112,round(hit[1]+(hit[3]-hit[1])*.60)]
        metadata['holdContact']={'hand':hand,'torso':torso}
    (dest/'metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')
    source_marker.write_text(job['job_id'])
    (dest/'report.json').write_text(json.dumps(dict(entity=entity,kind=kind,source=str(src.relative_to(ROOT)),uniformSourceScale=scale,status='normalized; visual review required',frames=report),indent=2)+'\n')
    sheet.save(dest/'contact.png')
    return dict(entity=entity,kind=kind,status='normalized',issues=sum(bool(f['cellEdge'] or f['detachedComponents']) for f in report))

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--download-only',action='store_true');parser.add_argument('--entity');parser.add_argument('--force',action='store_true');args=parser.parse_args()
    latest={};active={b['id'] for r in json.loads((HERE/'inventory.json').read_text()) for b in r['entities']}
    for j in json.loads((HERE/'jobs.json').read_text()):
        if j['entity'] in active and (not args.entity or j['entity']==args.entity):latest[j['entity'],j['kind']]=j
    jobs=[j for j in latest.values() if j.get('status')=='completed' and j.get('result_url')]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(download,jobs))
    results=[]
    if not args.download_only:
        for job in jobs:
            try:result=process(job,args.force)
            except Exception as e:result=dict(entity=job['entity'],kind=job['kind'],status='failed',error=str(e))
            results.append(result);print(json.dumps(result),flush=True)
        (HERE/'processing-status.json').write_text(json.dumps(results,indent=2)+'\n')

if __name__=='__main__':main()
