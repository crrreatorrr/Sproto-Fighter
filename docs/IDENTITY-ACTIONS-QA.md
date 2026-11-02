# Character identity actions QA

Installed 102 character owners / 118 independently animated bodies, totaling 3,584 new Higgsfield sprite frames. Every body has entrance8 and death16. The 78 owners previously using generic ranged attacks have 94 new body ranged8 sequences and distinct projectile designs. Existing signature attacks, including Pissing Sproto, remain intact.

Picasso throws framed paintings and has painted defeat poses with splatter effects. Sproto Sales mechanically dismantles his arms and feet during defeat. Sales standing/ranged extraction was repaired to retain complete boots; the disassembly sequence was preserved.

Validation passed: 102-owner inventory and sequence uniqueness; 312 ranged cases and 156 hitstop cases; 204 entrance facing cases; 1,632 death facing, impact, wall and floor cases; 78 projectile silhouettes; 12 legacy event groups; 510 gameplay cases; asset paths, hard alpha, padding, anchors, and production build. Visual review includes source contact sheets and targeted browser playback; automated coverage does not replace a full human playthrough of every animation.

Sources and reproducible normalization are under art/identity-actions/batch_a and batch_b. install.py preserves existing gameplay and signature clips and installs complete body groups atomically. The expansion installer preserves the new identity clips on later art refreshes.
