"""Restore the individually reviewed blue hly3 motion calibration and contacts.

Defaults to validation only; --apply updates only the specified body entry and
manifest revision. Original PNGs are never changed. Refuses unreviewed inputs.
"""
from copy import deepcopy
from pathlib import Path
import argparse
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SUFFIX = '-hly3-blue-20261102'


def apply_reviewed_registration(manifest):
    review = json.loads((HERE / 'review.json').read_text())
    result = deepcopy(manifest)
    body = result['fighters'][review['body']]
    for key, value in review['baseGeometry'].items():
        if body[key] != value:
            raise ValueError(f'Blue hly3 base {key} changed; inspect again')
    if body['frames'][0] != review['coreIdle']:
        raise ValueError('Blue hly3 core idle changed; recheck calibration')
    hashes = {**review['reviewedSourceHashes'], review['coreIdle']['url']: review['coreIdleSha256']}
    for url, expected in hashes.items():
        actual = hashlib.sha256((ROOT / 'public' / url.lstrip('/')).read_bytes()).hexdigest()
        if actual != expected:
            raise ValueError(f'Reviewed source pixels changed: {url}')
    desired_registration = deepcopy(review['beforeRegistration'] or {})
    for name in review['before']:
        desired_registration[name] = deepcopy(review['registration'])
    if body.get('clipRegistration') not in [review['beforeRegistration'], desired_registration]:
        raise ValueError('Blue hly3 registration changed since review')
    for name, original in review['before'].items():
        desired = [deepcopy(original[index]) for index in review['sourceIndices'][name]]
        if body['clips'][name] != original and body['clips'][name] != desired:
            raise ValueError(f'Blue hly3 {name} changed since review')
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
    result = apply_reviewed_registration(json.loads(original))
    if args.apply:
        path.write_text(json.dumps(result, indent=2) + ('\n' if original.endswith('\n') else ''))
        print('Applied only blue hly3 calibration/contact mappings and revision; source PNGs unchanged.')
    else:
        print('DRY RUN: blue hly3 source hashes, calibration and mappings valid; no files changed.')
