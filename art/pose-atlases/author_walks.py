#!/usr/bin/env python3
"""Author complete lower-body pixels for four guard-walk poses.
No cropped/rotated source limbs: upper pixels are preserved and each leg/foot is
redrawn as one connected outline with explicit hip, knee, ankle landmarks.
Only processed slots 02–05 are overwritten. Root installs anchors/assets.
"""
from pathlib import Path
import argparse,json,math,hashlib
from PIL import Image,ImageDraw,ImageFilter
ROOT=Path(__file__).resolve().parent
SLOTS=['02-walkNear','03-passNear','04-walkFar','05-passFar']
def rgb(s):return tuple(bytes.fromhex(s.lstrip('#')))
def tone(c,f):return tuple(max(0,min(255,round(x*f))) for x in c)
def point(p):return tuple(round(x) for x in p)
def outline_leg(d,hip,knee,ankle,width,color,edge):
    # Explicit tapered thigh, knee and calf contours, not rotated sprite pieces.
    nodes=[hip,((hip[0]*.55+knee[0]*.45),(hip[1]*.55+knee[1]*.45)),knee,((knee[0]*.4+ankle[0]*.6),(knee[1]*.4+ankle[1]*.6)),ankle]
    radii=[width*.54,width*.57,width*.42,width*.43,width*.28]
    left=[];right=[]
    for i,(v,r) in enumerate(zip(nodes,radii)):
        a=nodes[max(0,i-1)];b=nodes[min(len(nodes)-1,i+1)];dx=b[0]-a[0];dy=b[1]-a[1];length=math.hypot(dx,dy) or 1
        nx=dy/length;ny=-dx/length;left.append(point((v[0]-nx*r,v[1]-ny*r)));right.append(point((v[0]+nx*r,v[1]+ny*r)))
    poly=left+right[::-1];d.polygon(poly,fill=color);d.line(poly+[poly[0]],fill=edge,width=1)
    # Bounded interior palette facets follow the limb's authored joint flow.
    d.line([point((hip[0]-1,hip[1]+3)),point((knee[0]-1,knee[1]-2))],fill=tone(color,1.13),width=max(1,round(width*.22)))
    d.line([point((knee[0]+1,knee[1]+2)),point((ankle[0]+1,ankle[1]-1))],fill=tone(color,.84),width=max(1,round(width*.21)))
    return poly

def foot(d,ankle,y,cfg,far):
    c=rgb(cfg['shoe']);c=tone(c,.72) if far else c;edge=rgb(cfg['outline']);x=ankle[0];length=cfg.get('footLength',13);height=cfg.get('footHeight',6)
    poly=[(x-6,y-height+2),(x-3,y-height),(x+3,y-height-1),(x+length-11,y-height+1),(x+length-6,y-height+2),(x+length-3,y-height+4),(x+length-3,y-2),(x+length-5,y),(x-6,y),(x-7,y-2)]
    d.polygon([point(v) for v in poly],fill=c);d.line([point(v) for v in poly+[poly[0]]],fill=edge,width=1)
    if cfg['footStyle']=='bare':
        for offset in [length-6,length-3]:d.line([(round(x+offset),round(y-2)),(round(x+offset),round(y-1))],fill=tone(c,.5),width=1)
    elif cfg['footStyle'] in ['sneaker','trim']:
        sole=tone(rgb(cfg['sole']),.72 if far else 1);d.line([(round(x-3),round(y-1)),(round(x+length-3),round(y-1))],fill=sole,width=1)
        if cfg['footStyle']=='sneaker':d.line([(round(x+2),round(y-4)),(round(x+6),round(y-3))],fill=sole,width=1)
    else:d.line([(round(x-2),round(y-3)),(round(x+length-5),round(y-3))],fill=tone(c,1.12),width=1)

def frame(src,cfg,index):
    out=Image.new('RGBA',src.size);d=ImageDraw.Draw(out);cx=cfg['center'];cut=cfg['cut'];floor=cfg.get('floor',208);hip_y=cut+2;stride=cfg['stride'];width=cfg['thigh'];edge=rgb(cfg['outline']);base=rgb(cfg['leg']);hips=[(cx-6,hip_y),(cx+6,hip_y)]
    # Phase order: near forward contact, near stance/far swing, far forward
    # contact, far stance/near swing. Far limb always paints behind near limb.
    if index==0:targets=[(cx-stride,floor),(cx+stride,floor)]
    elif index==1:targets=[(cx+5,floor-cfg['lift']),(cx-3,floor)]
    elif index==2:targets=[(cx+stride,floor),(cx-stride,floor)]
    else:targets=[(cx-3,floor),(cx+5,floor-cfg['lift'])]
    joints=[]
    for side in [0,1]:
        foot_x,foot_y=targets[side];hip=hips[side];ankle=(foot_x,foot_y-cfg.get('footHeight',6)+1);swing=foot_y<floor
        knee=((hip[0]+ankle[0])*.5+(5 if swing else 2),hip_y+(ankle[1]-hip_y)*.48-(2 if swing else 0))
        color=tone(base,.72) if side==0 else base
        outline_leg(d,hip,knee,ankle,width,color,edge);foot(d,ankle,foot_y,cfg,side==0)
        joints.append({'side':'far' if side==0 else 'near','hip':point(hip),'knee':point(knee),'ankle':point(ankle),'contactY':foot_y,'grounded':foot_y==floor})
    # Connect the two complete legs to the unchanged waist silhouette.
    left,right=cfg['waist'];pelvis=[(left,cut),(right,cut),(right-2,cut+3),(cx+width,hip_y+2),(cx,hip_y+5),(cx-width,hip_y+2),(left+2,cut+3)]
    d.polygon([point(v) for v in pelvis],fill=base)
    d.line([point(v) for v in [(left,cut),(left+2,cut+3),(cx-width,hip_y+2)]],fill=edge,width=1)
    d.line([point(v) for v in [(right,cut),(right-2,cut+3),(cx+width,hip_y+2)]],fill=edge,width=1)
    # Preserve original upper-body art byte-for-byte, including hands and costume.
    out.alpha_composite(src.crop((0,0,src.width,cut+1)),(0,0))
    if cfg.get('belly'):
        mask=Image.new('L',src.size);pix=mask.load();sp=src.load();x0,y0,x1,y1=cfg['belly']
        for y in range(y0,y1):
            for x in range(x0,x1):
                r,g,b,a=sp[x,y]
                if a and r>140 and g>90 and b<100:pix[x,y]=255
        mask=mask.filter(ImageFilter.MaxFilter(3));patch=src.copy();patch.putalpha(Image.composite(src.getchannel('A'),Image.new('L',src.size),mask));out.alpha_composite(patch)
    for poly in cfg.get('preservePolygons',[]):
        mask=Image.new('L',src.size);ImageDraw.Draw(mask).polygon([tuple(v) for v in poly],fill=255);patch=src.copy();patch.putalpha(Image.composite(src.getchannel('A'),Image.new('L',src.size),mask));out.alpha_composite(patch)
    out.paste(src.crop((0,0,src.width,cut+1)),(0,0))
    return out,joints

def main():
    p=argparse.ArgumentParser();p.add_argument('--fighter',action='append');p.add_argument('--preview-dir',default='/tmp/authored-walk-review');args=p.parse_args()
    configs=json.loads((ROOT/'walk-authoring.json').read_text())['fighters'];preview=Path(args.preview_dir);preview.mkdir(parents=True,exist_ok=True);reports={}
    for id,cfg in configs.items():
        if args.fighter and id not in args.fighter:continue
        path=ROOT/'processed'/id/'00-guard.png'
        assert hashlib.sha256(path.read_bytes()).hexdigest()==cfg['guardSha256'],id+' guard changed: inspect and re-author cutline before rerunning'
    for id,cfg in configs.items():
        if args.fighter and id not in args.fighter:continue
        folder=ROOT/'processed'/id;src=Image.open(folder/'00-guard.png').convert('RGBA');strip=Image.new('RGB',(4*256,280),'#e5e5e5');label=ImageDraw.Draw(strip);reports[id]=[]
        for i,name in enumerate(SLOTS):
            im,joints=frame(src,cfg,i);im.save(folder/(name+'.png'));strip.paste(im,(i*256,20),im);label.text((i*256+6,4),id+' '+name,fill='black');reports[id].append(joints)
            assert im.crop((0,0,256,cfg['cut']+1)).tobytes()==src.crop((0,0,256,cfg['cut']+1)).tobytes(),id+' upper pixels changed'
        strip.save(preview/(id+'-walk.png'))
    (preview/'joints.json').write_text(json.dumps(reports,indent=2));print('Authored',len(reports),'four-frame lower bodies; review strips in',preview)
if __name__=='__main__':main()
