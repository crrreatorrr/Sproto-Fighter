"""Fixed-density source comparison. Does not normalize silhouettes or edit art."""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).parent / (sys.argv[1] if len(sys.argv)>1 else 'before')
OUT.mkdir(exist_ok=True)
manifest=json.loads((ROOT/'public/fighters/pose-atlas.json').read_text())['fighters']
names=json.loads((Path(__file__).parent/'roster.json').read_text())['names']
font=ImageFont.truetype('/System/Library/Fonts/Menlo.ttc',13)
ids=list(manifest)
index=[]
for page in range((len(ids)+4)//5):
    sheet=Image.new('RGB',(1520,1150),'#182334');d=ImageDraw.Draw(sheet)
    for row,id in enumerate(ids[page*5:page*5+5]):
        a=manifest[id];y=row*230
        d.text((8,y+3),f'{id} | {names.get(id,id)}',fill='white',font=font)
        cells=[('neutral',a['frames'][0],None),('hit',a['frames'][24],None),('fall',a['frames'][9],None),('get-up',a['frames'][10],None)]
        cells += [(f'recoil {i}',f,'recoil') for i,f in enumerate(a.get('clips',{}).get('recoil',[]))]
        for col,(label,f,clip) in enumerate(cells):
            cal=a.get('clipRegistration',{}).get(clip,{})
            scale=a.get('scale',a.get('worldHeight',256)/a['height'])*cal.get('pixelScale',1)
            anchor=f.get('anchor',a['anchor']);off=cal.get('anchorOffset',[0,0]);anchor=[anchor[i]+off[i] for i in [0,1]]
            im=Image.open(ROOT/('public'+f['url'])).convert('RGBA')
            im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.NEAREST)
            cell=Image.new('RGBA',(190,200));cell.alpha_composite(im,(round(60-anchor[0]*scale),round(188-anchor[1]*scale)))
            sheet.paste(cell,(col*190,y+25),cell)
            d.text((col*190+6,y+24),label,fill='#c6deff',font=font)
            d.line((col*190,y+213,(col+1)*190,y+213),fill='#657f9b')
        index.append({'id':id,'name':names.get(id,id),'page':page+1,'row':row+1,'recoil':len(a.get('clips',{}).get('recoil',[]))})
    sheet.save(OUT/f'{page+1:02}.png')
(OUT/'index.json').write_text(json.dumps(index,indent=2))
print(f'{len(ids)} bodies; {(len(ids)+4)//5} pages: {OUT}')
