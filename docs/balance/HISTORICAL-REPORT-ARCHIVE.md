# Historical simulation report archive

Fifteen historical simulation reports are stored as lossless gzip files. Their original Git blobs, raw/compressed SHA-256 values and sizes are recorded in [the manifest](historical-report-archive-manifest.json). Source kit metadata, geometry measurements, manifests and UI evidence remain JSON. No historical commit or PR base was rewritten.

The archive preserves 40,478,613 raw bytes (1,862,571 lines) in 1,847,577 compressed bytes. Every decompressed payload equals its original tracked Git blob byte for byte.

The primary implementation master was intentionally left untouched. Other Markdown report references now point to archives. Commands that expect JSON, including `--compare`, still need a decompressed file; do not pass `.gz` directly to a JSON-only reader.

```sh
python3 -c 'import gzip,pathlib; pathlib.Path("/tmp/sproto-previous-report.json").write_bytes(gzip.decompress(pathlib.Path("docs/balance/report-2026-11-05-baseline.json.gz").read_bytes()))'
```

| Original report | Archive | Raw bytes | Compressed bytes |
| --- | --- | ---: | ---: |
| `cpu-calibration-checkpoint-after.json` | [gzip](cpu-calibration-checkpoint-after.json.gz) | 296,701 | 17,960 |
| `cpu-calibration-checkpoint-before.json` | [gzip](cpu-calibration-checkpoint-before.json.gz) | 296,090 | 17,126 |
| `cpu-calibration-checkpoint-reviewed.json` | [gzip](cpu-calibration-checkpoint-reviewed.json.gz) | 296,448 | 17,707 |
| `cpu-calibration-curve-after.json` | [gzip](cpu-calibration-curve-after.json.gz) | 1,740,947 | 92,296 |
| `cpu-calibration-curve-before.json` | [gzip](cpu-calibration-curve-before.json.gz) | 1,758,245 | 92,138 |
| `curve-2026-11-05-cpu-seeded.json` | [gzip](curve-2026-11-05-cpu-seeded.json.gz) | 841,054 | 41,648 |
| `report-2026-11-05-balance.json` | [gzip](report-2026-11-05-balance.json.gz) | 2,296,466 | 120,799 |
| `report-2026-11-05-baseline.json` | [gzip](report-2026-11-05-baseline.json.gz) | 17,899,979 | 634,836 |
| `report-2026-11-05-cpu-seeded.json` | [gzip](report-2026-11-05-cpu-seeded.json.gz) | 2,590,364 | 163,196 |
| `report-2026-11-05-defense.json` | [gzip](report-2026-11-05-defense.json.gz) | 2,296,634 | 124,569 |
| `report-2026-11-05-depth-default.json` | [gzip](report-2026-11-05-depth-default.json.gz) | 2,296,561 | 124,522 |
| `report-2026-11-05-difficulty.json` | [gzip](report-2026-11-05-difficulty.json.gz) | 2,296,835 | 130,124 |
| `report-2026-11-05-fast.json` | [gzip](report-2026-11-05-fast.json.gz) | 1,177,521 | 53,920 |
| `report-2026-11-05-flow.json` | [gzip](report-2026-11-05-flow.json.gz) | 2,296,043 | 120,905 |
| `report-2026-11-05-reference.json` | [gzip](report-2026-11-05-reference.json.gz) | 2,098,725 | 95,831 |
