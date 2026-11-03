"""Restore inspected kick contact artwork after a deliberate atlas re-import.

This remaps existing images only. It does not resize, redraw or synthesize art.
Both active timing slots deliberately hold the authored extended-leg drawing.
"""
from copy import deepcopy
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]

def apply_reviewed_kicks(manifest):
    result = deepcopy(manifest)
    review = json.loads((HERE / 'aerial-kick-review.json').read_text())
    for body, finding in review['bodies'].items():
        clip = result['fighters'][body]['clips']['airKick']
        assert len(clip) == 6, f'{body}: action timing contract changed'
        contact = clip[3]
        assert contact['url'] == finding['approvedContactUrl'], f'{body}: contact source changed; inspect again'
        data = (ROOT / 'public' / contact['url'].lstrip('/')).read_bytes()
        assert hashlib.sha256(data).hexdigest() == finding['approvedContactSha256'], f'{body}: contact pixels changed; inspect again'
        clip[2] = deepcopy(contact)
    suffix = '-reviewed-airkick-20261102'
    if not result.get('revision', '').endswith(suffix):
        result['revision'] = result.get('revision', '') + suffix
    return result

if __name__ == '__main__':
    path = ROOT / 'public/fighters/pose-atlas.json'
    original = path.read_text()
    ending = '\n' if original.endswith('\n') else ''
    path.write_text(json.dumps(apply_reviewed_kicks(json.loads(original)), indent=2) + ending)
    print('Remapped first active kick slots for four inspected bodies; original PNGs unchanged.')
