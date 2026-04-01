# ChantXML

ChantXML is a pragmatic, minimal extension profile for [MusicXML 4.0](https://www.w3.org/2021/06/musicxml40/) aimed at representing **Gregorian chant** without breaking existing MusicXML tooling.

## Project goal

The goal is to support a complete round-trip workflow:

1. **GABC → ChantXML** for importing the large existing chant corpus.
2. **ChantXML → GABC** for compatibility with current chant engraving and editing tools.
3. **ChantXML → TeX (GregorioTeX)** so chant can be typeset in publication-grade documents.

This project prioritizes:

- A **minimal** spec extension rather than inventing a brand-new format.
- Reuse of established projects and parsers where possible.
- Interchange with mainstream notation software workflows, including Dorico and Sibelius.
- Proper attribution and license compliance for all borrowed/adapted code.

## Why MusicXML + a chant profile?

MusicXML is already a widely used interchange format in notation software. A chant-focused profile lets us:

- Preserve interoperability with modern notation ecosystems.
- Encode chant semantics that plain MusicXML cannot express cleanly.
- Keep converters understandable and maintainable.

## Scope and non-goals

### In scope

- Chant-specific notation metadata (neumes, episema-like marks, liquescents, text underlay behavior, etc.).
- Mapping strategy between GABC tokens and ChantXML elements/attributes.
- Conversion tooling and round-trip tests.
- TeX export path compatible with Gregorio/GregorioTeX workflows.

### Out of scope (for now)

- Replacing existing chant engraving engines.
- Building a full-featured graphical editor from scratch.
- Extending MusicXML far beyond what is needed for chant.

## Existing ecosystem and accreditation targets

We will integrate with or adapt ideas from these projects whenever practical, always preserving attribution, license notices, and upstream references:

- [MusicXML 4.0 (W3C Community Group)](https://www.w3.org/2021/06/musicxml40/)
- [MusicXML `<notehead>` reference (`smufl` support)](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/notehead/)
- [SMuFL medieval and renaissance clefs](https://w3c.github.io/smufl/latest/tables/medieval-and-renaissance-clefs.html) (an important chant asset, usable from MusicXML through SMuFL glyph metadata)
- [SMuFL plainchant single-note glyphs](https://w3c.github.io/smufl/latest/tables/medieval-and-renaissance-plainchant-single-note-forms.html)
- [The Gregorio Project](https://gregorio-project.github.io/)
- [GABC format documentation](https://gregorio-project.github.io/gabc/)
- [GregorioTeX documentation](https://gregorio-project.github.io/gregoriotex/)
- [TeXShop](https://en.wikipedia.org/wiki/TeXShop) (target LaTeX editor/program for ChantXML-generated TeX workflows)
- [LilyPond early music examples](https://lilypond.org/examples.html#Early-Music)
- [Illuminare Score Editor](http://dev.illuminarepublications.com/gregorio/)
- [Source & Summit chant editor](https://www.sourceandsummit.com/editor/alpha/)
- [GregoBase chant corpus](http://gregobase.selapa.net/)
- [GregoWiki resource index](http://gregoriochant.org/)

If code/assets are imported from external repositories, include:

- upstream project URL,
- commit/version reference,
- original license,
- local modification notes.

## Repository layout

- `README.md` — project charter, contributor workflow, and roadmap.
- `AGENTS.md` — instructions for coding agents and contributors (documentation-first workflow).
- `docs/` — GitHub Pages root for documentation and browser-based tools.
  - `docs/index.html` — documentation landing page.
- `docs/musicxml-viewer.html` — in-browser MusicXML notation viewer.
- `docs/musicxml-viewer.js` — viewer logic including sample-dropdown loading, a plainchant SMuFL glyph picker (with `smufl` names/code points for quick notehead metadata lookup), a persistent on-page `chantPunctum` (`U+E990`) visibility demo chip with runtime glyph-verification messaging, and the chant conversion transform (4-line staff, C clef, and SMuFL chant punctum metadata via `smufl="chantPunctum"` while using `square` noteheads as an OpenSheetMusicDisplay-compatible punctum fallback). The viewer HTML is wired to load a pinned stable OSMD release (`opensheetmusicdisplay@1.9.6`) from jsDelivr to avoid upstream breakages from development-branch artifacts, plus explicit Bravura/Bravura Text preloading with local-first runtime fallback URLs and OSMD default font configuration for more reliable SMuFL rendering.
- `docs/assets/fonts/bravura/` — local drop-in directory for Bravura/Bravura Text SMuFL fonts and license metadata (`vexflow-fonts@1.0.6`) that the viewer checks before CDN fallbacks.
- `docs/samples/` — bundled public-domain MusicXML sample melodies for the viewer dropdown.

## Documentation-first roadmap

### Phase 0: Foundation (current)

- Define project charter and collaboration rules.
- Publish initial documentation site scaffold under `docs/`.
- Document conversion boundaries and assumptions.

### Phase 1: ChantXML profile draft

- Enumerate the smallest set of MusicXML extension points needed.
- Document use of MusicXML `<staff-lines>` for four-line chant staves where appropriate.
- Evaluate MusicXML `<solo/>` instrument metadata for solo-voice chant use cases.
- Support movable chant clefs by allowing MusicXML `<sign>` values `C` and `F` with flexible `<line>` placement.
- Provide normative mapping tables: GABC token ↔ ChantXML representation.
- Add canonical examples with expected round-trip behavior.

### Phase 2: Converter MVP

- Implement CLI conversion pipeline for:
  - `gabc -> chantxml`
  - `chantxml -> gabc`
  - `chantxml -> tex` (GregorioTeX-oriented)
- Add fixture-based regression tests from real chant examples.

### Phase 3: Web documentation + tools

- Host spec docs and examples in GitHub Pages.
- Add simple in-browser conversion playground.
- Publish known limitations and compatibility matrix.

## Proposed converter architecture (initial)

Use a normalized internal model for round-tripping:

- **Parser adapters**
  - GABC parser adapter
  - ChantXML parser/serializer adapter
  - TeX exporter adapter
- **Core chant model**
  - stable representation of pitch groups, text, rhythmic/ornamental marks, structure
- **Mapping layers**
  - explicit, testable mappings per feature

This reduces lossy transformations by keeping each format conversion explicit and separately testable.

## Getting started (documentation phase)

Current repository focus is docs and planning. Immediate contributor tasks:

1. Improve or review the ChantXML profile draft docs in `docs/`.
2. Propose concrete mapping examples (small snippets of GABC, ChantXML, and TeX output).
3. Open issues for unsupported notation edge cases with sample input/output.

## Contribution and quality expectations

- Keep changes small and reviewable.
- Prefer existing libraries/spec references over custom parsers when possible.
- For each converter change, add at least one fixture test once code exists.
- Keep documentation synchronized with behavior.
- Codex-authored pull requests can be auto-merged automatically via `.github/workflows/enable-codex-pr-automerge.yml` when repository auto-merge is enabled.
- Preserve attribution and license text for reused work.

## License

Project license is to be finalized. Until then, do not copy third-party code without explicitly documenting source and license compatibility.
