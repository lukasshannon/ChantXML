# Internal status memo (April 1, 2026)

## Current truth across both repositories

### Already implemented (confirmed)
- `opensheetmusicdisplay` `develop` reads MusicXML `notehead@smufl` into OSMD note data (`Note.CustomNoteheadVFCode`) and applies that code to VexFlow noteheads during graphical rendering.
- ChantXML viewer (`docs/musicxml-viewer.html` + `.js`) loads the OSMD fork from `lukasshannon/opensheetmusicdisplay@develop` by default.
- ChantXML viewer includes explicit sample fixtures for direct chant SMuFL noteheads, including `chant-smufl-minimal.musicxml` and `chant-smufl-direct.musicxml`.

### Explicit workaround behavior (intentionally retained)
- The viewer still offers an opt-in compatibility checkbox that rewrites noteheads to `square` while keeping `smufl="chantPunctum"` metadata.
- This fallback is no longer the default rendering path; it is a documented compatibility mode for stable upstream OSMD behavior.

### Recently closed verification gaps
- Added a regression fixture and parser test in OSMD for mixed-case `notehead@smufl` values (for example `ChAnTpUnCtUm`) to guarantee robust name normalization before glyph mapping.
- Added explicit Notehead unit tests for all supported chant SMuFL notehead names, mixed-case variants, and unknown-name fallback to `undefined`.
- Added one-note minimal viewer fixtures for each supported chant glyph (`chantVirga`, `chantQuilisma`, `chantOriscusAscending`, `chantStropha`) to complement the existing `chantPunctum` sample.

### Active tasks now being tackled
- Stabilize the OSMD fork TypeScript build against VexFlow 5 namespace/type changes so `npm run build` and `npm test` can run cleanly.
- Run end-to-end manual glyph verification for all five supported chant single-note SMuFL forms with compatibility mode toggled on/off.

### Remaining risk areas
- Browser-level visual snapshots are still manual in this repo (no screenshot CI harness yet).
- Chant neume grouping beyond single-note forms (ligatures, episema variants, advanced spacing rules) remains outside this specific single-note SMuFL notehead milestone.

## Final desired architecture (unchanged)
- Primary path: ChantXML viewer loads OSMD fork (`develop`) and renders chant noteheads directly from MusicXML `notehead@smufl`.
- Optional fallback path: deliberate compatibility mode rewrites noteheads to `square`.
- Regression coverage includes parser mapping and rendering-path assignment checks in OSMD, plus reproducible ChantXML fixtures and manual verification steps.
