from pathlib import Path
from PIL import Image
import json,hashlib
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
source=HERE/'raw/world-map.png';runtime=ROOT/'public/story/campaign-map-expanded.webp';image=Image.open(source).convert('RGB');assert image.size==(3840,2160)
image.save(runtime,'WEBP',lossless=True,method=6);decoded=Image.open(runtime).convert('RGB');assert decoded.size==image.size and decoded.tobytes()==image.tobytes()
preview=image.copy();preview.thumbnail((1600,900));preview.save('/Users/kenhiraoka/Documents/Codex/2026-11-01/u/outputs/world-map-eight-zones.png')
info=dict(source=str(source.relative_to(ROOT)),runtime=str(runtime.relative_to(ROOT)),size=list(image.size),sourceSHA256=hashlib.sha256(source.read_bytes()).hexdigest(),runtimeSHA256=hashlib.sha256(runtime.read_bytes()).hexdigest(),conversion='Lossless WebP, exact decoded RGB pixel match, no crop or resize',zoneOrder=['trenches','circuit','yacht','ranch','throne','bar','hatchery','verse'],routes='art/world-map-zones-nov02/routes.json',originalsRetained=['public/story/campaign-map.webp','art/story-map/expanded/Sproto-Arena-Expanded-Campaign-Map-150.png'])
(HERE/'integration.json').write_text(json.dumps(info,indent=2)+'\n');print('Installed 4K map, verified lossless pixels. Eight distinct zones.')
