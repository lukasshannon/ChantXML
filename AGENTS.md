# AGENTS instructions for ChantXML

These instructions apply to the whole repository.

## Mission

ChantXML exists to minimally extend MusicXML for Gregorian chant while supporting practical conversion workflows with existing chant formats and tools.

## Working style

1. **Documentation first**
   - Update docs before or with code changes.
   - Keep `README.md` and `docs/` documentation consistent.

2. **Minimal extension principle**
   - Prefer the smallest possible MusicXML extension/profile that preserves chant semantics.
   - Avoid introducing novel structures if existing MusicXML constructs plus clear metadata can work.

3. **Round-trip priority**
   - Design with `gabc -> chantxml -> gabc` fidelity in mind.
   - Explicitly document known lossy transformations.

4. **Reuse over reinvention**
   - Prefer adapting proven existing projects/libraries over writing new parsers from scratch.
   - Record the upstream source, version/commit, and license in docs when code or assets are reused.

5. **Accreditation and licensing**
   - Every third-party dependency, snippet, or dataset must have attribution.
   - Keep license compatibility explicit in documentation.

## Documentation requirements for converter work

If you change conversion behavior, include:

- Input example (GABC and/or ChantXML).
- Output example.
- Notes on assumptions and edge cases.
- Round-trip expectations.

## GitHub Pages (`docs/`)

- Treat `docs/` as user-facing documentation and tool entrypoint.
- Keep language plain and implementation-agnostic where possible.
- Prefer incremental updates over large one-shot rewrites.
