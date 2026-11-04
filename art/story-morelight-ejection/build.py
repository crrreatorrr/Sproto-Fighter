"""Extract the generated transition as transparent, game-sized pixel frames.
Run after inspecting the source video. Source MP4 stays in the task's output folder.
"""
from pathlib import Path
import json, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

source=Path(sys.argv[1]);repo=Path(__file__).resolve().parents[2]
out=source.parent;frames_dir=out/'frames';frames_dir.mkdir(exist_ok=True)
subprocess.run(['ffmpeg','-y','-v','error','-i',str(source),'-vf','fps=16,scale=320:240:flags=neighbor',str(frames_dir/'%03d.png')],check=True)
frames=[]
for path in sorted(frames_dir.glob('*.png')):
    data=np.array(Image.open(path).convert('RGB'))
    r,g,b=(data[:,:,i].astype(float) for i in range(3))
    background=(g>70)&(g>r*1.25)&(g>b*1.25)
    rgba=np.dstack([data,np.where(background,0,255).astype('uint8')])
    frames.append(Image.fromarray(rgba))
assert 120<=len(frames)<=132,len(frames)
# Exact existing poses at both boundaries give the runtime no position/scale jump.
def cell(id,index):
    spec=json.loads((repo/'src/storyAnimationManifest.json').read_text())[id]
    sheet=Image.open(repo/'public/story-animations'/spec['image']).convert('RGBA')
    x=index%spec['columns']*spec['width'];y=index//spec['columns']*spec['height']
    return sheet.crop((x,y,x+spec['width'],y+spec['height']))
start=Image.new('RGBA',(320,240));start.alpha_composite(cell('morelight-mecha',239),(0,8))
end=Image.new('RGBA',(320,240));end.alpha_composite(cell('morelight-wizard',0),(13,34))
# Keep the exact supplied mecha intact until the first actual generated blast.
# The generator added a chest orb/white flash at frames 23-25; those frames are
# deliberately replaced, not accepted as a redesign of the reference mech.
for i in range(26):frames[i]=start.copy()
# The prompt holds the ending; settle into the exact live sprite in the final quarter-second.
for i in range(4):frames[-4+i]=Image.blend(frames[-4+i],end,(i+1)/4)
columns=8;atlas=Image.new('RGBA',(320*columns,240*((len(frames)+columns-1)//columns)))
for i,frame in enumerate(frames):atlas.alpha_composite(frame,(i%columns*320,i//columns*240))
atlas.save(repo/'public/story-animations/morelight-ejection.png',optimize=True)
approved=out/'approved-frames';approved.mkdir(exist_ok=True)
for i,frame in enumerate(frames):
    green=Image.new('RGB',frame.size,'#00ff00');green.paste(frame,(0,0),frame)
    green.save(approved/f'{i+1:03d}.png',optimize=True)
subprocess.run(['ffmpeg','-y','-v','error','-framerate','16','-i',str(approved/'%03d.png'),'-vf','scale=1280:960:flags=neighbor','-c:v','libx264','-crf','12','-pix_fmt','yuv420p',str(out/'morelight-ejection-approved.mp4')],check=True)
frames[0].save(out/'morelight-ejection-preview.webp',save_all=True,append_images=frames[1:],duration=[63 if i%2==0 else 62 for i in range(len(frames))],loop=0,lossless=True)
boxes=[frame.getbbox() for frame in frames if frame.getbbox()]
spec={'image':'morelight-ejection.png','width':320,'height':240,'columns':columns,'frames':len(frames),'fps':16,'x':139,'y':209,'scale':1.4,'left':min(b[0] for b in boxes),'right':max(b[2] for b in boxes),'referenceMechaFrames':26}
p=repo/'src/storyAnimationManifest.json';manifest=json.loads(p.read_text());manifest['morelight-ejection']=spec;p.write_text(json.dumps(manifest,indent=2)+'\n')
qa=Image.new('RGB',(960,4*240),'#182030');draw=ImageDraw.Draw(qa)
for i in range(12):
    n=round(i*(len(frames)-1)/11);x=i%3*320;y=i//3*240
    qa.paste(frames[n],(x,y),frames[n]);draw.text((x+6,y+6),f'{n/16:.2f}s',fill='white')
qa.save(out/'contact-sheet.png')
print(json.dumps({'frames':len(frames),'size':atlas.size,'runtime':str(repo/'public/story-animations/morelight-ejection.png'),'preview':str(out/'morelight-ejection-preview.webp')}))
