const scoreContainer = document.getElementById('score');
const statusNode = document.getElementById('status');
const fileInput = document.getElementById('musicxmlFile');
const sampleSelect = document.getElementById('sampleSelect');
const noteGlyphSelect = document.getElementById('noteGlyphSelect');
const glyphMetadata = document.getElementById('glyphMetadata');
const glyphPreview = document.getElementById('glyphPreview');
const loadSampleButton = document.getElementById('loadSample');
const renderButton = document.getElementById('renderXml');
const chantifyButton = document.getElementById('chantifyXml');
const resetButton = document.getElementById('resetView');
const xmlEditor = document.getElementById('xmlEditor');
const chantpunctumGlyph = document.getElementById('chantpunctumGlyph');
const chantpunctumStatus = document.getElementById('chantpunctumStatus');
const chantpunctumCheck = document.getElementById('chantpunctumCheck');

let osmd;
const SMUFL_FONT_FAMILY = 'Bravura';
const SMUFL_TEXT_FONT_FAMILY = 'Bravura Text';
const SMUFL_FONT_SOURCES = {
  [SMUFL_FONT_FAMILY]: [
    './assets/fonts/bravura/bravura.woff2',
    'https://cdn.jsdelivr.net/npm/vexflow-fonts@1.0.6/bravura/Bravura_1.392.woff2',
    'https://unpkg.com/vexflow-fonts@1.0.6/bravura/Bravura_1.392.woff2',
  ],
  [SMUFL_TEXT_FONT_FAMILY]: [
    './assets/fonts/bravura/bravura-text.woff2',
    'https://cdn.jsdelivr.net/npm/vexflow-fonts@1.0.6/bravura/BravuraText_1.393.woff2',
    'https://unpkg.com/vexflow-fonts@1.0.6/bravura/BravuraText_1.393.woff2',
  ],
};
const loadedSmuflFonts = new Set();
const SAMPLE_FILES = [
  { label: 'Frere Jacques', file: 'frere-jacques.musicxml' },
  { label: 'Mary Had a Little Lamb', file: 'mary-had-a-little-lamb.musicxml' },
  { label: 'Ode to Joy', file: 'ode-to-joy.musicxml' },
  { label: 'Row, Row, Row Your Boat', file: 'row-row-row-your-boat.musicxml' },
  { label: 'Twinkle, Twinkle, Little Star', file: 'twinkle-twinkle-little-star.musicxml' },
];
const SAMPLE_ROOT = new URL('./samples/', window.location.href);
const CHANT_GLYPH_CHOICES = [
  { label: 'Punctum', smufl: 'chantPunctum', codePoint: 'U+E990', glyph: '\uE990' },
  { label: 'Virga', smufl: 'chantVirga', codePoint: 'U+E994', glyph: '\uE994' },
  { label: 'Quilisma', smufl: 'chantQuilisma', codePoint: 'U+E99B', glyph: '\uE99B' },
  { label: 'Oriscus', smufl: 'chantOriscusAscending', codePoint: 'U+E99C', glyph: '\uE99C' },
  { label: 'Stropha', smufl: 'chantStropha', codePoint: 'U+E9A4', glyph: '\uE9A4' },
];

if (sampleSelect) {
  SAMPLE_FILES.forEach((sample) => {
    const option = document.createElement('option');
    option.value = sample.file;
    option.textContent = sample.label;
    sampleSelect.appendChild(option);
  });
}

if (noteGlyphSelect) {
  CHANT_GLYPH_CHOICES.forEach((choice) => {
    const option = document.createElement('option');
    option.value = choice.smufl;
    option.textContent = `${choice.glyph} ${choice.label} (${choice.smufl})`;
    option.dataset.codePoint = choice.codePoint;
    option.dataset.glyph = choice.glyph;
    noteGlyphSelect.appendChild(option);
  });
}

function setStatus(message) {
  statusNode.textContent = message;
}

function updateGlyphPreview() {
  if (!noteGlyphSelect || !glyphMetadata || !glyphPreview) {
    return;
  }

  const selectedIndex = noteGlyphSelect.selectedIndex;
  const selectedOption = noteGlyphSelect.options[selectedIndex];
  if (!selectedOption || !selectedOption.value) {
    glyphMetadata.textContent = 'Select a glyph to view the SMuFL name and code point.';
    glyphPreview.textContent = '♪';
    return;
  }

  const glyph = selectedOption.dataset.glyph || '♪';
  const smuflName = selectedOption.value;
  const codePoint = selectedOption.dataset.codePoint || 'unknown';
  glyphPreview.textContent = glyph;
  glyphMetadata.textContent = `Selected ${smuflName} (${codePoint}). Use this with MusicXML notehead smufl="${smuflName}".`;
}

function updateChantpunctumDemo(isLoaded, isVerifiedVisible = null) {
  if (!chantpunctumGlyph || !chantpunctumStatus || !chantpunctumCheck) {
    return;
  }

  chantpunctumGlyph.textContent = '\uE990';
  if (isLoaded) {
    chantpunctumStatus.textContent = 'Bravura loaded — chantPunctum (U+E990) should be visible at left.';
  } else {
    chantpunctumStatus.textContent = 'Bravura not yet available — glyph may show as fallback until loading finishes.';
  }

  if (isVerifiedVisible === true) {
    chantpunctumCheck.textContent = 'Verification check: chantpunctum glyph rendering confirmed.';
  } else if (isVerifiedVisible === false) {
    chantpunctumCheck.textContent = 'Verification check: glyph did not render distinctly from fallback.';
  } else {
    chantpunctumCheck.textContent = 'Verification pending.';
  }
}

function hasVisibleInk(imageData) {
  const data = imageData.data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 0) {
      return true;
    }
  }
  return false;
}

function canVerifyGlyphInCanvas() {
  return typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined';
}

function verifyChantpunctumVisible() {
  if (!canVerifyGlyphInCanvas()) {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  const drawGlyph = (char, family) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = `64px "${family}", serif`;
    context.textBaseline = 'alphabetic';
    context.fillStyle = '#000';
    context.fillText(char, 8, 72);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  };

  const punctum = drawGlyph('\uE990', SMUFL_FONT_FAMILY);
  if (!hasVisibleInk(punctum)) {
    return false;
  }

  const replacement = drawGlyph('\uFFFD', SMUFL_FONT_FAMILY);
  const punctumData = punctum.data;
  const replacementData = replacement.data;
  for (let index = 0; index < punctumData.length; index += 1) {
    if (punctumData[index] !== replacementData[index]) {
      return true;
    }
  }

  return false;
}

async function ensureRenderer() {
  if (!window.opensheetmusicdisplay || !window.opensheetmusicdisplay.OpenSheetMusicDisplay) {
    throw new Error('OpenSheetMusicDisplay did not load.');
  }

  if (!osmd) {
    osmd = new window.opensheetmusicdisplay.OpenSheetMusicDisplay(scoreContainer, {
      autoResize: true,
      drawTitle: true,
      defaultMusicFont: SMUFL_FONT_FAMILY,
      defaultWordFontFamily: SMUFL_TEXT_FONT_FAMILY,
    });
  }
}

async function ensureSmuflFontsLoaded() {
  if (!document.fonts || typeof document.fonts.load !== 'function' || typeof FontFace === 'undefined') {
    return;
  }

  async function loadFontFaceFamily(fontFamily, options = {}) {
    const { required = true } = options;
    if (loadedSmuflFonts.has(fontFamily)) {
      return;
    }

    const hasSystemFont = document.fonts.check(`16px "${fontFamily}"`);
    if (hasSystemFont) {
      loadedSmuflFonts.add(fontFamily);
      return;
    }

    const candidateUrls = SMUFL_FONT_SOURCES[fontFamily] ?? [];
    for (const url of candidateUrls) {
      try {
        const fontFace = new FontFace(fontFamily, `url(${url}) format("woff2")`, {
          style: 'normal',
          weight: '400',
        });
        await fontFace.load();
        document.fonts.add(fontFace);
        await document.fonts.load(`16px "${fontFamily}"`);
        if (document.fonts.check(`16px "${fontFamily}"`)) {
          loadedSmuflFonts.add(fontFamily);
          return;
        }
      } catch (error) {
        console.warn(`Failed loading ${fontFamily} from ${url}`, error);
      }
    }

    if (!required) {
      console.warn(`Optional SMuFL font family "${fontFamily}" is unavailable. Falling back to generic text fonts.`);
      return;
    }

    throw new Error(`Could not load required SMuFL font family "${fontFamily}" from any configured source.`);
  }

  // Ensure required SMuFL glyph font is loaded before rendering.
  await loadFontFaceFamily(SMUFL_FONT_FAMILY, { required: true });
  // Bravura Text improves lyric/text shaping but is optional for notation rendering.
  await loadFontFaceFamily(SMUFL_TEXT_FONT_FAMILY, { required: false });
  updateChantpunctumDemo(true, verifyChantpunctumVisible());
}

async function renderMusicXML(xmlText, description) {
  if (!xmlText.trim()) {
    setStatus('Editor is empty. Load or paste MusicXML first.');
    return;
  }

  try {
    setStatus(`Loading SMuFL fonts for ${description}...`);
    await ensureSmuflFontsLoaded();
    await ensureRenderer();
    await osmd.load(xmlText);
    osmd.render();
    setStatus(`Rendered ${description}.`);
  } catch (error) {
    console.error(error);
    setStatus(`Could not render ${description}: ${error.message}`);
  }
}


function upsertTextElement(parent, tagName, value) {
  let node = parent.querySelector(tagName);
  if (!node) {
    node = parent.ownerDocument.createElement(tagName);
    parent.appendChild(node);
  }
  node.textContent = value;
}

function convertToGregorianChant(xmlText) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(xmlText, 'application/xml');
  const parseError = documentNode.querySelector('parsererror');
  if (parseError) {
    throw new Error('MusicXML is not valid XML. Please fix the editor content first.');
  }

  const firstMeasure = documentNode.querySelector('part > measure');
  if (!firstMeasure) {
    throw new Error('Could not find a measure to update.');
  }

  let attributes = firstMeasure.querySelector('attributes');
  if (!attributes) {
    attributes = documentNode.createElement('attributes');
    firstMeasure.insertBefore(attributes, firstMeasure.firstChild);
  }

  let staffDetails = attributes.querySelector('staff-details');
  if (!staffDetails) {
    staffDetails = documentNode.createElement('staff-details');
    attributes.appendChild(staffDetails);
  }
  upsertTextElement(staffDetails, 'staff-lines', '4');

  let clef = attributes.querySelector('clef');
  if (!clef) {
    clef = documentNode.createElement('clef');
    attributes.appendChild(clef);
  }
  upsertTextElement(clef, 'sign', 'C');
  upsertTextElement(clef, 'line', '3');

  const notes = Array.from(documentNode.querySelectorAll('note'));
  notes.forEach((note) => {
    let notehead = note.querySelector('notehead');
    if (!notehead && !note.querySelector('rest')) {
      notehead = documentNode.createElement('notehead');
      const typeNode = note.querySelector('type');
      if (typeNode) {
        typeNode.insertAdjacentElement('afterend', notehead);
      } else {
        note.appendChild(notehead);
      }
    }

    if (notehead) {
      // OSMD currently parses notehead shape text but ignores notehead@smufl,
      // and treats unsupported values like "other" as a normal round notehead.
      // Use a supported square shape so the rendered output stays punctum-like,
      // while still preserving chant SMuFL metadata for downstream tools.
      notehead.textContent = 'square';
      notehead.setAttribute('smufl', 'chantPunctum');
      notehead.setAttribute('font-family', 'Bravura');
    }
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(documentNode);
}

fileInput.addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    xmlEditor.value = text;
    setStatus(`Loaded local file \"${file.name}\" into editor. Click Render XML.`);
  } catch (error) {
    console.error(error);
    setStatus(`Could not read \"${file.name}\": ${error.message}`);
  }
});

loadSampleButton.addEventListener('click', async () => {
  const selectedFile = sampleSelect.value;
  if (!selectedFile) {
    setStatus('Choose a sample from the dropdown first.');
    return;
  }

  const selectedSample = SAMPLE_FILES.find((sample) => sample.file === selectedFile);
  const sampleLabel = selectedSample ? selectedSample.label : selectedFile;
  setStatus(`Loading ${sampleLabel} sample...`);
  try {
    const response = await fetch(new URL(selectedFile, SAMPLE_ROOT));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    xmlEditor.value = await response.text();
    setStatus(`Loaded ${sampleLabel} into editor. Click Render XML.`);
  } catch (error) {
    console.error(error);
    setStatus(`Could not load "${sampleLabel}": ${error.message}`);
  }
});

chantifyButton.addEventListener('click', () => {
  if (!xmlEditor.value.trim()) {
    setStatus('Editor is empty. Load or paste MusicXML first.');
    return;
  }

  try {
    xmlEditor.value = convertToGregorianChant(xmlEditor.value);
    setStatus('Updated editor to a Gregorian chant profile: four staff lines, C clef, and punctum-like square noteheads carrying SMuFL metadata (smufl="chantPunctum") with Bravura font hinting. Click Render XML.');
  } catch (error) {
    console.error(error);
    setStatus(`Could not convert XML: ${error.message}`);
  }
});

renderButton.addEventListener('click', async () => {
  await renderMusicXML(xmlEditor.value, 'editor contents');
});

resetButton.addEventListener('click', () => {
  scoreContainer.textContent = '';
  fileInput.value = '';
  xmlEditor.value = '';
  if (noteGlyphSelect) {
    noteGlyphSelect.value = '';
  }
  updateGlyphPreview();
  setStatus('Cleared viewer and editor.');
});

if (noteGlyphSelect) {
  noteGlyphSelect.addEventListener('change', updateGlyphPreview);
}
updateGlyphPreview();
updateChantpunctumDemo(document.fonts ? document.fonts.check(`16px "${SMUFL_FONT_FAMILY}"`) : false, null);
ensureSmuflFontsLoaded().catch((error) => {
  console.warn('Could not fully preload SMuFL fonts on startup.', error);
  updateChantpunctumDemo(false, null);
});
