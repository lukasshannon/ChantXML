# Bravura font assets

This directory is the local drop-in location for SMuFL fonts used by the MusicXML viewer:

- `bravura.woff2`
- `bravura-text.woff2`
- `LICENSE.txt`

The viewer checks these local files first, then falls back to CDN URLs.

## Upstream source

- Package: `vexflow-fonts`
- URL: https://www.npmjs.com/package/vexflow-fonts
- Version: `1.0.6`
- Upstream repository: https://github.com/vexflow/vexflow-fonts
- Original font project: https://github.com/steinbergmedia/bravura

## Local modification notes (when adding files)

- Rename upstream WOFF2 filenames to stable local names expected by the viewer:
  - `Bravura_1.392.woff2` → `bravura.woff2`
  - `BravuraText_1.393.woff2` → `bravura-text.woff2`
- Do not modify glyph tables.
