#!/usr/bin/env python3
"""Review/apply one serialized pose remap. Default is dry run; root owns --apply."""
import argparse,hashlib,json
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--apply',action='store_true');args=parser.parse_args()
evidence=Path(__file__).resolve().parent;root=evidence.parents[3]
review=json.loads((evidence/'virtuagram-air-kick-review.json').read_text());path=root/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text())
for url,expected in review['sourceHashes'].items():
 actual=hashlib.sha256((root/'public'/url.lstrip('/')).read_bytes()).hexdigest()
 assert actual==expected, f'Authored pose changed: {url}; review again before applying'
frames=manifest['fighters'][review['fighter']]['frames'];current=frames[23]
assert current in (review['original'],review['replacement']), 'Slot23 changed concurrently; reconcile rather than overwriting'
if current==review['replacement']: print('Already applied; unchanged')
elif args.apply:
 frames[23]=review['replacement'];path.write_text(json.dumps(manifest,indent=2)+'\n');print('Applied only Virtuagram slot23 -> reviewed existing slot18; original PNG preserved')
else: print('Dry run: reviewed source hashes match; only Virtuagram slot23 will change with --apply')
