"""Guarded, idempotent application of six browser-reviewed contact remaps.
Default validates only; --apply updates six clip arrays and revision. No PNG edits.
"""
from copy import deepcopy
import argparse, hashlib, json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
SUFFIX='-paired-contact-c2-20261102'
def apply_reviewed_contacts(manifest):
    result=deepcopy(manifest)
    review=json.loads((HERE/'review.json').read_text())
    for finding in review['findings']:
        body=finding['body'];clip=finding['clip'];before=finding['before']
        desired=[deepcopy(before[index]) for index in finding['sourceIndices']]
        current=result['fighters'][body]['clips'][clip]
        if current!=before and current!=desired:
            raise ValueError(f'{body} {clip}: changed since review; inspect again')
        for url, expected in finding['reviewedSourceHashes'].items():
            if hashlib.sha256((ROOT/'public'/url.lstrip('/')).read_bytes()).hexdigest()!=expected:
                raise ValueError(f'{body}: source pixels changed: {url}')
        result['fighters'][body]['clips'][clip]=desired
    if SUFFIX not in result.get('revision',''):
        result['revision']=result.get('revision','')+SUFFIX
    return result
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--apply',action='store_true');args=parser.parse_args()
    path=ROOT/'public/fighters/pose-atlas.json';original=path.read_text();result=apply_reviewed_contacts(json.loads(original))
    if args.apply:
        if path.read_text()!=original:raise ValueError('Manifest changed during validation; retry only after reviewing concurrent changes')
        path.write_text(json.dumps(result,indent=2)+('\n' if original.endswith('\n') else ''))
        print('Applied six reviewed contact mappings. Source PNGs, registration and core timing unchanged.')
    else: print('DRY RUN: six mappings and source hashes valid; no files changed.')
