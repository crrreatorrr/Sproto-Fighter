"""Apply individually reviewed whole-body contact poses, without redrawing art.

Default is a validation-only dry run. Pass --apply to update the local manifest.
The script refuses changed source pixels or an unreviewed current clip layout.
"""
from copy import deepcopy
import argparse
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SUFFIX = '-paired-contact-20261102'


def apply_reviewed_contacts(manifest):
    result = deepcopy(manifest)
    review = json.loads((HERE / 'review.json').read_text())
    for body, finding in review['bodies'].items():
        before = finding['before']
        desired = [deepcopy(before[index]) for index in finding['sourceIndices']]
        current = result['fighters'][body]['clips'][finding['clip']]
        if current != before and current != desired:
            raise ValueError(f'{body}: clip changed since review; inspect it again')
        for url, expected_hash in finding['reviewedSourceHashes'].items():
            data = (ROOT / 'public' / url.lstrip('/')).read_bytes()
            if hashlib.sha256(data).hexdigest() != expected_hash:
                raise ValueError(f'{body}: source pixels changed: {url}')
        result['fighters'][body]['clips'][finding['clip']] = desired
    if SUFFIX not in result.get('revision', ''):
        result['revision'] = result.get('revision', '') + SUFFIX
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    path = ROOT / 'public/fighters/pose-atlas.json'
    text = path.read_text()
    result = apply_reviewed_contacts(json.loads(text))
    if args.apply:
        path.write_text(json.dumps(result, indent=2) + ('\n' if text.endswith('\n') else ''))
        print('Applied five reviewed clip mappings. Source PNGs and simulation timing unchanged.')
    else:
        print('DRY RUN: five mappings and source hashes valid. No files changed. Use --apply to install.')
