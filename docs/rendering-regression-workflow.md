# Gregorian chant rendering regression workflow

Date: April 1, 2026

This document is the reproducible end-to-end checklist for the ChantXML + OSMD fork pipeline.

## Scope

- Confirms ChantXML viewer default path uses the OSMD fork (`develop`) instead of stable OSMD fallback.
- Confirms direct MusicXML `notehead@smufl` chant noteheads are represented in fixtures used by the viewer.
- Confirms compatibility fallback mode remains deliberate and opt-in.
- Records current fork build limitation observed while rebuilding OSMD from source locally.

## Fixtures used

- `docs/samples/chant-smufl-minimal.musicxml` (synthetic single-note punctum).
- `docs/samples/chant-smufl-virga-minimal.musicxml` (single-note virga).
- `docs/samples/chant-smufl-quilisma-minimal.musicxml` (single-note quilisma).
- `docs/samples/chant-smufl-oriscusascending-minimal.musicxml` (single-note oriscus ascending).
- `docs/samples/chant-smufl-stropha-minimal.musicxml` (single-note stropha).
- `docs/samples/chant-smufl-direct.musicxml` (direct SMuFL chant glyph names).
- `docs/samples/chant-smufl-punctum.musicxml` (lyrics/rest mixed sample).

## Quick static checks

1. Verify viewer loads fork build:
   - `docs/musicxml-viewer.html` includes:
     - `https://cdn.jsdelivr.net/gh/lukasshannon/opensheetmusicdisplay@develop/build/opensheetmusicdisplay.min.js`
2. Verify compatibility fallback is opt-in:
   - `docs/musicxml-viewer.html` exposes checkbox `compatSquareFallback`.
   - `docs/musicxml-viewer.js` sets notehead text to:
     - `normal` on default/fork path,
     - `square` only when compatibility checkbox is checked.
3. Verify chant fixtures encode direct SMuFL metadata:
   - `notehead smufl="chantPunctum"` (and other chant names) with `font-family="Bravura"`.

## Local rebuild note for OSMD fork

Attempting a full local `npm install` in `opensheetmusicdisplay` currently triggers its `prepare` build, which fails with TypeScript namespace errors linked to the VexFlow v5 migration (for example `Cannot find namespace 'Vex'` in several `VexFlow*` files).

This is a known blocker for full from-source rebuild in this environment and should be tracked independently from ChantXML fixture and integration wiring.

## Manual browser verification procedure

1. Start a static file server at repository root (`python -m http.server` or equivalent).
2. Open `docs/musicxml-viewer.html`.
3. Load and render each chant fixture listed above.
4. Confirm:
   - chant fixtures render on a 4-line staff;
   - movable C/F clefs appear on configured lines;
   - noteheads differ by SMuFL chant glyph name on fork path;
   - toggling compatibility mode forces square noteheads.

If browser automation tooling is unavailable, this manual checklist is the required fallback.
