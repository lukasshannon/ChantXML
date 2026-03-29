const scoreContainer = document.getElementById('score');
const statusNode = document.getElementById('status');
const fileInput = document.getElementById('musicxmlFile');
const sampleSelect = document.getElementById('sampleSelect');
const loadSampleButton = document.getElementById('loadSample');
const renderButton = document.getElementById('renderXml');
const chantifyButton = document.getElementById('chantifyXml');
const resetButton = document.getElementById('resetView');
const xmlEditor = document.getElementById('xmlEditor');

let osmd;
const SAMPLE_FILES = [
  { label: 'Frere Jacques', file: 'frere-jacques.musicxml' },
  { label: 'Mary Had a Little Lamb', file: 'mary-had-a-little-lamb.musicxml' },
  { label: 'Ode to Joy', file: 'ode-to-joy.musicxml' },
  { label: 'Row, Row, Row Your Boat', file: 'row-row-row-your-boat.musicxml' },
  { label: 'Twinkle, Twinkle, Little Star', file: 'twinkle-twinkle-little-star.musicxml' },
];
const SAMPLE_ROOT = new URL('./samples/', window.location.href);

if (sampleSelect) {
  SAMPLE_FILES.forEach((sample) => {
    const option = document.createElement('option');
    option.value = sample.file;
    option.textContent = sample.label;
    sampleSelect.appendChild(option);
  });
}

function setStatus(message) {
  statusNode.textContent = message;
}

async function ensureRenderer() {
  if (!window.opensheetmusicdisplay || !window.opensheetmusicdisplay.OpenSheetMusicDisplay) {
    throw new Error('OpenSheetMusicDisplay did not load.');
  }

  if (!osmd) {
    osmd = new window.opensheetmusicdisplay.OpenSheetMusicDisplay(scoreContainer, {
      autoResize: true,
      drawTitle: true,
    });
  }
}

async function renderMusicXML(xmlText, description) {
  if (!xmlText.trim()) {
    setStatus('Editor is empty. Load or paste MusicXML first.');
    return;
  }

  try {
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
      notehead.textContent = 'other';
      notehead.setAttribute('smufl', 'chantPunctum');
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
    setStatus('Updated editor to a Gregorian chant profile: four staff lines, C clef, and medieval SMuFL chant noteheads (chantPunctum). Click Render XML.');
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
  setStatus('Cleared viewer and editor.');
});
