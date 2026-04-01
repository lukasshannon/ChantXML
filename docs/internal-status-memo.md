# Internal status memo (April 1, 2026)

## Already implemented
- `opensheetmusicdisplay` `develop` parses `notehead@smufl` and maps chant noteheads to VexFlow glyph codes.
- ChantXML viewer preloads Bravura fonts and includes chant sample tooling.

## Workaround state before this update
- ChantXML viewer was pinned to OSMD `1.9.6` and rewrote chant noteheads to `square` as fallback.

## Unverified / missing before this update
- End-to-end confirmation that SMuFL notehead mapping survived all the way into VexFlow v5 notehead rendering.
- Build stability in OSMD fork (TypeScript namespace breakages from VexFlow v5 migration).

## Desired architecture
- Primary path: ChantXML viewer loads OSMD fork (`develop`) and renders chant noteheads directly from MusicXML `notehead@smufl`.
- Optional fallback path: explicit compatibility mode rewrites noteheads to `square` for stable upstream behavior.
- Regression checks include parser + rendering-path assertions for chant noteheads.
