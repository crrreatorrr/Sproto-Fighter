"""Retain the supplied Ethereum artwork; trim only transparent source padding."""
from pathlib import Path
from PIL import Image
import json,shutil,hashlib
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
source=HERE/'reference.png'
if not source.exists():shutil.copy2('/var/folders/m7/dcmshhy57bx83804v5dd43vm0000gn/T/codex-clipboard-c6285068-a9d0-4730-8328-2fbda3815212.png',source)
im=Image.open(source).convert('RGBA');box=im.getchannel('A').getbbox();sprite=im.crop(box)
assert im.getpixel((0,0))[3]==0 and sprite.getchannel('A').getextrema()==(0,255)
dest=ROOT/'public/fighters/powers/vitalik-ethereum.png';dest.parent.mkdir(parents=True,exist_ok=True);sprite.save(dest)
report={'source':'art/vitalik-ethereum/reference.png','sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'trim':list(box),'size':list(sprite.size),'processing':'Transparent padding trimmed; original RGBA pixels unchanged.','asset':'public/fighters/powers/vitalik-ethereum.png'}
(HERE/'asset-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
