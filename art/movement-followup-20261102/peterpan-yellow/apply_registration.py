"""Apply the reviewed PeterPan yellow body contact/origin correction.

Defaults to validation. --apply changes only this body's optional clip mapping,
constant registration, and manifest revision. Original images remain unchanged.
"""
from copy import deepcopy
from pathlib import Path
import argparse
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SUFFIX = '-peterpan-yellow-20261102'


def apply_reviewed_registration(manifest):
    review = json.loads((HERE / 'review.json').read_text())
    result = deepcopy(manifest)
    body = result['fighters'][review['body']]
    for key, value in review['baseGeometry'].items():
        if body[key] != value:
            raise ValueError(f'PeterPan yellow base {key} changed; inspect again')
    if body['frames'][0] != review['coreIdle']:
        raise ValueError('PeterPan yellow core idle changed; inspect again')
    hashes = {**review['reviewedSourceHashes'], review['coreIdle']['url']: review['coreIdleSha256']}
    for url, expected in hashes.items():
        if hashlib.sha256((ROOT / 'public' / url.lstrip('/')).read_bytes()).hexdigest() != expected:
            raise ValueError(f'Reviewed source pixels changed: {url}')
    desired_registration = deepcopy(review['beforeRegistration'] or {})
    for name in review['before']:
        desired_registration[name] = deepcopy(review['registration'])
    if body.get('clipRegistration') not in [review['beforeRegistration'], desired_registration]:
        raise ValueError('PeterPan yellow registration changed since review')
    for name, original in review['before'].items():
        desired = [deepcopy(original[index]) for index in review['sourceIndices'][name]]
        if body['clips'][name] != original and body['clips'][name] != desired:
            raise ValueError(f'PeterPan yellow {name} changed since review')
        body['clips'][name] = desired
    body['clipRegistration'] = desired_registration
    if SUFFIX not in result.get('revision', ''):
        result['revision'] = result.get('revision', '') + SUFFIX
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    path = ROOT / 'public/fighters/pose-atlas.json'
    original = path.read_text()
    manifest = json.loads(original)
    result = apply_reviewed_registration(manifest)
    untouched_before = deepcopy(manifest)
    untouched_after = deepcopy(result)
    for item in [untouched_before, untouched_after]:
        item.pop('revision', None)
        item['fighters'].pop('peterpan-companion')
    assert untouched_before == untouched_after, 'Unrelated manifest entries changed'
    if args.apply:
        path.write_text(json.dumps(result, indent=2) + ('\n' if original.endswith('\n') else ''))
        print('Applied only PeterPan yellow optional contact/origin and revision; source PNGs unchanged.')
    else:
        print('DRY RUN: PeterPan yellow hashes and isolated mapping/registration valid.')
