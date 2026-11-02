from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import numpy as np, json, math, hashlib
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
MANIFEST=json.load(open(OUT/'repair-inputs.json'))
FONT=ImageFont.truetype('/System/Library/Fonts/Menlo.ttc',13)
def read(fr): return Image.open(ROOT/'public'/fr['url'].lstrip('/')).convert('RGBA')
def comps(mask):
    h,w=mask.shape;seen=np.zeros((h,w),dtype=bool);parts=[]
    for yy,xx in zip(*np.nonzero(mask)):
        if seen[yy,xx]:continue
        stack=[(int(yy),int(xx))];seen[yy,xx]=1;pts=[]
        while stack:
            y,x=stack.pop();pts.append((x,y))
            for ny,nx in [(y-1,x),(y+1,x),(y,x-1),(y,x+1)]:
                if 0<=ny<h and 0<=nx<w and mask[ny,nx] and not seen[ny,nx]:seen[ny,nx]=1;stack.append((ny,nx))
        if len(pts)>6:parts.append({'area':len(pts),'bounds':[min(x for x,y in pts),min(y for x,y in pts),max(x for x,y in pts)+1,max(y for x,y in pts)+1]})
    return sorted(parts,key=lambda p:p['area'],reverse=True)
def features(im):
    a=np.array(im).astype(int)
    return {'red':comps((a[:,:,0]>130)&(a[:,:,0]>a[:,:,1]*1.7)&(a[:,:,0]>a[:,:,2]*1.7)&(a[:,:,3]>128)),'yellow':comps((a[:,:,0]>150)&(a[:,:,1]>140)&(a[:,:,2]<100)&(a[:,:,3]>128))}
def hull(im):
    a=np.array(im.getchannel('A'));ys,xs=np.nonzero(a>16);pts=sorted(set(zip(xs.tolist(),ys.tolist())))
    def cross(o,a,b):return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
    lo=[]
    for p in pts:
        while len(lo)>=2 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
        lo.append(p)
    hi=[]
    for p in reversed(pts):
        while len(hi)>=2 and cross(hi[-2],hi[-1],p)<=0:hi.pop()
        hi.append(p)
    return [list(p) for p in lo[:-1]+hi[:-1]]
def sheet(body,seq,old,new,dest):
    # World coordinates on both facings; no silhouette fit or individual centering.
    f=MANIFEST['fighters'][body];scale=f.get('scale',1); cw,ch=440,390;cols=6
    entries=[('idle',f['frames'][0])]+[(f'before[{i}]',x) for i,x in enumerate(old)]
    entries+=[('idle',f['frames'][0])]+[(f'after[{i}]',x) for i,x in enumerate(new)]
    # Individual before/after blocks stay on their own rows.
    rows=(len(old)+1+cols-1)//cols;out=Image.new('RGBA',(cw*cols,ch*rows*4+40),(24,29,39,255));d=ImageDraw.Draw(out)
    d.text((10,8),f'{body} {seq} | fixed atlas scale {scale}; root/floor cyan; before then after; R and L',font=FONT,fill='white')
    for faceindex,facing in enumerate([1,-1]):
      for status,frames in enumerate([old,new]):
        cells=[('idle',f['frames'][0])]+[(f'{"BEFORE" if status==0 else "AFTER"} {i}',x) for i,x in enumerate(frames)]
        for n,(label,fr) in enumerate(cells):
          x=n%cols*cw;y=(faceindex*rows*2+status*rows+n//cols)*ch+40
          im=read(fr);a=fr.get('anchor',f['anchor']);ox=x+220;oy=y+320
          sz=(round(im.width*scale),round(im.height*scale));im=im.resize(sz,Image.Resampling.NEAREST);ax=a[0]*scale;ay=a[1]*scale
          if facing<0:im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT);ax=sz[0]-ax
          out.alpha_composite(im,(round(ox-ax),round(oy-ay)));d.line((x,oy,x+cw,oy),fill=(40,130,145));d.line((ox,y+24,ox,oy),fill=(35,70,80))
          d.text((x+7,y+5),f'{label} facing {facing:+}',font=FONT,fill='white');d.text((x+7,y+340),Path(fr['url']).name,font=FONT,fill=(200,208,216));d.text((x+7,y+360),f'anchor {a}',font=FONT,fill=(170,180,190))
    out.convert('RGB').save(dest)
# Deliberate whole-body uniform corrections; calibrated from unoccluded head/eye and shoulder components.
BRONT_FACTORS={8:1.10,9:1.12,16:1.12,17:1.12,18:1.12,19:1.08,22:1.42,23:1.42,29:1.12,30:1.22,31:1.22}
bront=MANIFEST['fighters']['bront'];newframes=json.loads(json.dumps(bront['frames']));metrics=[]
folder=ROOT/'public/fighters/poses/bront/scale-fix';folder.mkdir(parents=True,exist_ok=True)
for slot,s in BRONT_FACTORS.items():
    old=bront['frames'][slot];im=read(old);oa=old.get('anchor',bront['anchor']);na=[176,274]
    fixed=im.transform((416,336),Image.Transform.AFFINE,(1/s,0,oa[0]-na[0]/s,0,1/s,oa[1]-na[1]/s),resample=Image.Resampling.NEAREST)
    dest=folder/Path(old['url']).name;fixed.save(dest)
    fr={**old,'url':'/'+str(dest.relative_to(ROOT/'public')),'width':fixed.width,'height':fixed.height,'anchor':na,'bounds':list(fixed.getbbox())}
    if 'contactHull' in old:fr['contactHull']=hull(fixed)
    newframes[slot]=fr
    metrics.append({'slot':slot,'source':old['url'],'replacement':fr['url'],'uniformFactor':s,'sourceSHA256':hashlib.sha256((ROOT/'public'/old['url'].lstrip('/')).read_bytes()).hexdigest(),'before':features(im),'after':features(fixed),'bounds':fr['bounds'],'floorDeltaPx':fr['bounds'][3]-na[1],'paddingClear':min(fr['bounds'][0],fr['bounds'][1],fixed.width-fr['bounds'][2],fixed.height-fr['bounds'][3])})
patch={'schemaVersion':1,'note':'Merge replacements fields into latest manifest. No manifest writes performed by builder; all original assets preserved.','bodies':{'bront':{'expectedFrameUrls':[x['url'] for x in bront['frames']],'replacements':{'frames':newframes}}}}
json.dump(patch,open(OUT/'manifest-patch.json','w'),indent=2);json.dump(metrics,open(OUT/'bront-correction-metrics.json','w'),indent=2)
slots=[7,8,9,10,16,17,18,19,22,23,29,30,31]
sheet('bront','jump-attacks',[bront['frames'][i] for i in slots],[newframes[i] for i in slots],OUT/'bront-jump-attacks-candidate-both-facings.png')
print('bront candidates',list(BRONT_FACTORS),'patch',OUT/'manifest-patch.json')
