# Gregorian chant rendering regression workflow

Date: April 4, 2026

This document is the reproducible end-to-end checklist for the ChantXML + OSMD fork pipeline.

## Scope

- Confirms ChantXML viewer default path uses the OSMD fork (`develop`) instead of stable OSMD fallback.
- Confirms direct MusicXML `notehead@smufl` chant noteheads are represented in fixtures used by the viewer.
- Confirms compatibility fallback mode remains deliberate and opt-in.
- Documents OSMD fork fixes for VexFlow v5 compatibility.

## Fixtures used

- `docs/samples/chant-smufl-minimal.musicxml` (synthetic single-note punctum).
- `docs/samples/chant-smufl-virga-minimal.musicxml` (single-note virga).
- `docs/samples/chant-smufl-quilisma-minimal.musicxml` (single-note quilisma).
- `docs/samples/chant-smufl-oriscusascending-minimal.musicxml` (single-note oriscus ascending).
- `docs/samples/chant-smufl-stropha-minimal.musicxml` (single-note stropha).
- `docs/samples/chant-smufl-direct.musicxml` (direct SMuFL chant glyph names).
- `docs/samples/chant-smufl-punctum.musicxml` (lyrics/rest mixed sample).

## Quick static checks

1. Verify viewer loads from local bundle (for offline/cached use):
   - `docs/musicxml-viewer.html` includes:
     - `./assets/opensheetmusicdisplay.min.js`
2. Verify compatibility fallback is opt-in:
   - `docs/musicxml-viewer.html` exposes checkbox `compatSquareFallback`.
   - `docs/musicxml-viewer.js` sets notehead text to:
     - `normal` on default/fork path,
     - `square` only when compatibility checkbox is checked.
3. Verify chant fixtures encode direct SMuFL metadata:
   - `notehead smufl="chantPunctum"` (and other chant names) with `font-family="Bravura"`.

## OSMD Fork Fixes Applied

The following fixes were applied to the OSMD fork (`/home/lukas/code/opensheetmusicdisplay`):

### 1. `applyCustomNoteheads()` always called (MusicSheetCalculator.ts:886-890)
**Problem:** SMuFL notehead customization was only applied when `ColoringEnabled` was true.
**Fix:** Moved `applyCustomNoteheads()` call outside the coloring conditional block.

### 1b. SMuFL glyph format for VexFlow v5 (Notehead.ts:8-14)
**Problem:** SMuFL codes were stored as strings like "ue990" but VexFlow v5 expects Unicode format.
**Fix:** Changed mapping to use JavaScript Unicode escapes: `"\uE990"` instead of `"ue990"`.

### 1c. VexFlow v5 notehead API (VexFlowVoiceEntry.ts:46-64)
**Problem:** Old code used `note_heads` and `glyph_code` which don't work in VexFlow v5.
**Fix:** Updated to use `noteHeads` getter and `setText()` method for custom glyphs.

### 2. TabSlide constructor parameters (VexFlowMusicSheetCalculator.ts:2165-2167)
**Problem:** Incorrect parameter names `first_indices` and `last_indices`.
**Fix:** Changed to `firstIndexes` and `lastIndexes` to match VexFlow v5 API.

### 3. Unused variable warning (VexFlowConverter.ts:674)
**Problem:** `addAccidental` variable declared but never used due to refactoring.
**Fix:** Removed unused variable declaration.

### 4. `getImageData` not available on VexFlow CanvasContext (SkyBottomLineCalculator.ts:151)
**Problem:** VexFlow v5's CanvasContext doesn't expose `getImageData()`.
**Fix:** Added fallback to native canvas context via `vexFlowCanvasContext` property with try-catch.

### 5. `STAVE_LINE_THICKNESS` read-only error (VexFlowMusicSheetDrawer.ts:67)
**Problem:** VexFlow v5 has read-only constants that can't be assigned.
**Fix:** Wrapped assignments in try-catch blocks.

### 6. Auto-backend selection override (OSMDOptions.ts, OpenSheetMusicDisplay.ts)
**Problem:** `AlwaysSetPreferredSkyBottomLineBackendAutomatically` forced WebGL backend which lacks `getImageData`.
**Fix:** Added option `alwaysSetPreferredSkyBottomLineBackendAutomatically` to allow forcing Plain backend.

## Manual browser verification procedure

1. Start a static file server at repository root:
   ```bash
   cd /home/lukas/code/ChantXML
   python -m http.server 8080
   ```
2. Open `http://localhost:8080/docs/musicxml-viewer.html`.
3. Load and render each chant fixture.
4. Confirm:
   - chant fixtures render on a 4-line staff;
   - C clef appears on the 3rd line;
   - noteheads use SMuFL chant glyphs (punctum, virga, etc.);
   - toggling compatibility mode forces square noteheads.

## Browser automation test

A Playwright test is available to verify rendering:
```bash
cd /home/lukas/code/ChantXML
npx playwright install chromium
node -e "
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve('docs/musicxml-viewer.html'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  // Load sample XML directly
  const xml = \`<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<score-partwise version=\"4.0\">
  <part-list><score-part id=\"P1\"><part-name>Test</part-name></score-part></part-list>
  <part id=\"P1\">
    <measure number=\"1\">
      <attributes>
        <divisions>1</divisions>
        <staff-details><staff-lines>4</staff-lines></staff-details>
        <clef><sign>C</sign><line>3</line></clef>
      </attributes>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type><notehead smufl=\"chantPunctum\" font-family=\"Bravura\">normal</notehead></note>
    </measure>
  </part>
</score-partwise>\`;
  await page.evaluate((x) => { document.getElementById('xmlEditor').value = x; }, xml);
  await page.click('#renderXml');
  await page.waitForTimeout(5000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const svg = await page.\$('#score svg');
  console.log('SVG rendered:', svg ? 'YES' : 'NO');
  console.log('Errors:', errors.length);
  await browser.close();
})();
"
```

If browser automation tooling is unavailable, the manual checklist above is the required fallback.
