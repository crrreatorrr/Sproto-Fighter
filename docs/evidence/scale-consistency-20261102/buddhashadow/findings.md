# Buddha Shadow independent static review

Reviewed all **104 installed drawings in both facings**: 32 core, 8 walk, intro 4, special 8, cast 4, recoil 4, defeat 12, entrance 8, death 16 and ranged 8. This is 208 facing views, plus repeated core references. All seven baseline contact sheets were opened with the image-view tool. The source portrait and all four raw authored sheets in `art/buddhashadow` were also opened. Every installed PNG exactly matches its processed source copy.

No confirmed uniform body/head scale discontinuity or clipped artwork was found. Core jump/kick drawings, special strikes, recoil, bowing, cheek inflation, mouth opening and the side-fall preserve a coherent body. Small eye-shape/drawing variations remain in the authored sheets; they do not warrant rescaling. There are no installed dedicated jump, heavy or airKick clips: their applicable core poses were included in the complete core review.

Two horizontal registration defects were confirmed and corrected. The original manifest used anchor `[112,210]` throughout:

- **Walking, medium:** all eight cels place the head, torso and hips approximately 30 source pixels forward of the canonical gait. At scale 1.25 this is a 37.5-world-pixel registration change. Applied fixed walk anchor: **`[142,210]` for all eight frames**.
- **Standing events, medium:** the comparable guard returns in intro 3, special 7, cast 3 and recoil 3 place head/torso approximately 16 source pixels forward of core. Applied anchor: **`[128,210]` for event source files `00.png`–`22.png`**. Keep **`[112,210]` for event `23.png`–`31.png`**: the processor explicitly switches to bounding-box-centered floor registration at source index 23. Identity clips use the original anchor and already agree with core.

The proposed anchors were rendered without modifying repository images or the manifest. All 8 proposed walk cels and all 32 event cels were inspected again in both facings. The registration changes align the guard returns, preserve intended reach/crouch/fall changes, and introduce no visible clipping or vertical floor shift. Root applied this exact mapping. Independent readback verifies all 104 live entries against the reviewed proposal: 8 walk anchors and 23 event anchors changed, 9 floor-event anchors preserved, and all 104 PNG bytes/URLs and the 1.25 atlas scale remain unchanged. Live browser acceptance remains with root.

| Mean source-pixel x landmark | Core gait 2–5 | Walk 0–7 | Walk minus core | Event guard returns | Events minus core |
|---|---:|---:|---:|---:|---:|
| Yellow eyes | 124.16 | 153.78 | +29.62 | 139.80 | +15.64 |
| Yellow hip belt | 110.72 | 140.59 | +29.87 | 126.47 | +15.75 |
| White medallion | 122.58 | 152.22 | +29.64 | 138.66 | +16.08 |

The foot-sole centroids also move forward: core gait mean 107.57 versus walk 143.63. Their +36.06-pixel difference includes different stride/support phases, so the fixed correction uses agreement of the head, belt and medallion. Idle foot centroid 115.07 versus walk 0 at 143.56 gives +28.49 pixels, consistent with that choice. No per-pose fitting was used.

The event guard means use intro 3, special 7, cast 3 and recoil 3. Source files are events `03.png`, `11.png`, `15.png` and `19.png`. Identity entrance 7 and ranged 7 have eye centroids 125.63/125.91 and belt centroids 112.25/112.11, close to core idle 125.56/112.60. They need no registration change.

Evidence:

- [Compact before/after registration comparison](registration-comparison.png)
- [All proposed walk cels, both facings](proposed-walk-01.png)
- [Proposed events 00–15](proposed-events-01.png), [proposed events 16–31](proposed-events-02.png)
- Original [core 00–15](core-01.png), [core 16–31](core-02.png), [walk](walk-01.png), [events page 1](events-01.png), [events page 2](events-02.png), [identity page 1](identity-01.png), [identity page 2](identity-02.png)
- [Exact frame coverage, anchors and hashes](coverage.json), [registration measurements](registration-landmarks.json), [machine-readable findings](findings.json)

The event registration rule is in `art/sprotos-expansion/process.py:120–121`: event source frames 23 onward use `(r-l)/2`; earlier frames use the head estimate plus the sheet's fixed offset. This is why translating all 32 event anchors would incorrectly move already centered floor poses.

This review covers all installed source cels, but does **not** establish browser motion, frame timing, transition smoothness, physics/rotation transforms, projectile alignment or camera acceptance. Those remain root's runtime checks. The prior `art/buddhashadow/QA.md` claims were treated as context, not substituted for this independent inspection.

Installed snapshot: `293a4aa1abf69cadd25b5dc055f7ca8fb954848d3fa60feb467f5271792a46bf`. [Exact installed readback](installed-verification.json). No unresolved static size/framing defect remains in the reviewed 104 drawings and corrected registration.
