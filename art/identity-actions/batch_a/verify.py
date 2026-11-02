import hashlib,json
from pathlib import Path
from PIL import Image
p=Path(__file__).resolve().parent
requests=json.load(open(p/'requests.json'));results=[];signatures=set()
for r in requests:
 folder=p/'processed'/f"{r['entity']}-identity";meta=folder/'metadata.json'
 if not meta.exists():results.append({'entity':r['entity'],'status':'missing'});continue
 cfg=json.load(open(meta));assert len(cfg['clips']['entrance'])==8;assert len(cfg['clips']['death'])==16
 if r['ranged']:assert len(cfg['clips']['ranged'])==8
 assert len(list(folder.glob('[0-9][0-9].png')))==r['frameCount']
 dig=[]
 for n in range(r['frameCount']):
  f=folder/f'{n:02}.png';im=Image.open(f);assert im.mode=='RGBA' and im.size==(256,256);a=im.getchannel('A');assert set(a.getdata())<={0,255};b=a.getbbox();assert b and min(b[:2])>0 and max(b[2:])<256
  if n<8:dig.append(hashlib.sha256(f.read_bytes()).hexdigest())
 sig=hashlib.sha256(''.join(dig).encode()).hexdigest();assert sig not in signatures;signatures.add(sig)
 results.append({'entity':r['entity'],'status':'passed','frameCount':r['frameCount'],'sourceJob':(folder/'source-job.txt').read_text().strip()})
(p/'qa.json').write_text(json.dumps(results,indent=2)+'\n');print('passed',sum(x['status']=='passed' for x in results),'missing',[x['entity'] for x in results if x['status']=='missing'])
