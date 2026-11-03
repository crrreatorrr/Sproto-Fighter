"""Sproto #1870 is explicitly legless. Slot mechanics use floating body rams."""
STYLE='''PIXEL ART fighting-game sprite atlas. One complete floating Sproto HEAD per cell. The HEAD is the entire character: absolutely NO legs, feet, shoes, arms, hands, neck or humanoid torso. This overrides all ordinary fighter anatomy. Preserve exact head outline, eye count, pupils, face colors, muzzle and expression across all poses. Crisp stepped pixels, dark outlines, compact shading, no smooth vector art. Face RIGHT consistently. Controlled banks and turns, not face morphing. Solid magenta #ff00ff background, no labels, motion trails, particles, grid lines or detached effects. Generous empty separation; never clip any head spike or muzzle. Preserve the complete single character identity specified below; multiple joined facial regions are part of that one character when explicitly described.'''
CORE='''Exactly 32 separate complete floating heads in a FOUR-COLUMN by EIGHT-ROW grid. Exactly four drawings per row.
Row 1: neutral hover; subtle upward bob; forward glide bank; glide transition.
Row 2: opposite bank; return through level hover; fast forward lunge; downward coil hover.
Row 3: rising airborne bank; falling level head; settle low hover; recoil back to charge a ram.
Row 4: forward face-first ram; ram retract; upward bank anticipation; rising upward head strike.
Row 5: rotate back to chamber; half-drive forward; fully extended forward body ram; retract to level.
Row 6: low swooping sweep; swoop recover; aerial coil; forceful diagonal forward aerial ram.
Row 7: hit recoil with squint; braced defensive head tuck; forward grab/catch lunge; braced close hold pose.
Row 8: toss follow-through head flick; power charge with determined eyes; power release face forward, no projectile; triumphant special impact bank. Every drawing is a HEAD ONLY; no hands or legs.'''
WALK='''Exactly EIGHT separate complete floating heads in a FOUR-COLUMN by TWO-ROW grid. A smooth repeating HOVER GLIDE cycle: level hover; bank forward slightly; rise a little; return level at top of bob; bank opposite slightly; fall a little; return level at bottom of bob; transition into first pose. Keep head and muzzle size constant. No walking, no footprints, no legs, no feet, no torso. Entire head visible in every cell.'''
EVENTS='''Exactly 32 complete floating HEAD drawings, FOUR columns and EIGHT rows. Exactly four per row.
Row 1 INTRO: neutral hover; look determined; confident slight bank; settle neutral hover.
Row 2 SPECIAL A: backward bank coil; drive forward; full forward ram impact; ram retract.
Row 3 SPECIAL B: rotate upward with dynamic expression; retract through low bank; emphatic diagonal forward ram finish; recover level hover.
Row 4 CAST: eyes focus; head tilts back slightly; forward power exhale, no projectile; return neutral.
Row 5 RECOIL: face flinches and head tilts back; continuing bank recoil; stabilize lower hover; return neutral.
Row 6 DEFEAT: drooping hover; loses lift; dropping turned head; settles on side at floor. No body or limbs.
Row 7 FLOOR REST: whole head resting sideways; settles; eyes soften; entirely still resting head.
Row 8 FINAL REST: same complete sideways resting head; same head with small eye relaxation; hold resting head; final still resting head. Remain a head-only character.'''
MOTION='''Exactly 32 complete floating HEAD drawings, FOUR columns and EIGHT rows. Exactly four per row.
Row 1 DASH: back-bank anticipation; drive forward; fast forward tilt; stretched forward lunge by position, never deform face.
Row 2 DASH/JUMP: braking bank; level hover recovery; rising glide; rising bank.
Row 3 JUMP: upper-arc head; level at apex; descending head; descending recovery bank.
Row 4 HEAVY RAM: low backward coil; windup bank; turn forward; strong forward ram contact.
Row 5 HEAVY RECOVERY: sustain ram contact; retract bank; stabilize; level hover guard.
Row 6 AIR RAM: aerial back-bank coil; drive upward; rotate forward; forceful diagonal aerial head ram.
Row 7 AIR/VICTORY: retract from ram; balanced glide; proud floating guard; victory bank coil.
Row 8 VICTORY: celebratory upward swoop; tilt proudly; settle confident floating head; final proud level hover. Absolutely no arms, hands, legs or feet.'''
