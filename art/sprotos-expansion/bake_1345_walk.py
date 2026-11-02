"""Existing-roster guarded-step authoring from the Higgsfield neutral sprite.

These are locally baked footwork frames, not eight independently generated poses.
"""
import hashlib,importlib.util,json
from pathlib import Path
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
spec=importlib.util.spec_from_file_location('steps',ROOT/'art/pose-atlases/author_textured_steps.py');steps=importlib.util.module_from_spec(spec);spec.loader.exec_module(steps)
src=HERE/'processed/sproto1345-core/00.png';im=Image.open(src).convert('RGBA')
cfg={'center':112,'cut':172,'footHeight':8,'pinPelvis':True,'reachLimit':6}
frames,joints=steps.build(im,cfg,'sproto1345');dest=HERE/'processed/sproto1345-walk';dest.mkdir(exist_ok=True)
entries=[];sheet=Image.new('RGBA',(4*256,2*256),'#202c3e')
for i,frame in enumerate(frames):
    frame.save(dest/f'{i:02}.png');box=frame.getchannel('A').getbbox();assert box and min(box)>0 and box[2]<256 and box[3]<256
    entries.append(dict(url=f'/fighters/walk/sproto1345/{i:02}.png',bounds=list(box)))
    sheet.alpha_composite(frame,(i%4*256,i//4*256))
metadata=dict(width=256,height=256,anchor=[112,210],scale=1.25,facing=1,frames=entries,walkCycleDistance=112)
(dest/'metadata.json').write_text(json.dumps(metadata,indent=2)+'\n');sheet.save(dest/'contact.png')
(dest/'report.json').write_text(json.dumps(dict(source=str(src.relative_to(ROOT)),sourceSha256=hashlib.sha256(src.read_bytes()).hexdigest(),authoring=cfg,joints=joints,provenance='Eight locally baked guarded steps from Higgsfield guard; same method as existing roster',status='visual review required'),indent=2)+'\n')
print('Baked eight guarded steps for #1345 from its Higgsfield guard.')
