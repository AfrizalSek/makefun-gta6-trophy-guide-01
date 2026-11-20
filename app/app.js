// Leonida Legends — bootstrap. Loads the trophy and roadmap data, wires the
// toolbar, tabs, checklist and export/import, and keeps the settings saved.
// Everything runs offline: the only fetch is data/trophies.json and
// data/roadmap.json from this same app folder.
import {
  loadEarned,
  saveEarned,
  loadSettings,
  saveSettings,
  buildExportFile,
  parseImportFile,
  downloadTextFile,
} from './store.js';
import {
  filterTrophies,
  renderProgress,
  renderTrophyList,
  renderTrophyDetail,
  renderRoadmap,
} from './views.js';

const trophyResponse = await fetch('data/trophies.json');
const trophyData = await trophyResponse.json();
const trophies = trophyData.trophies;
const roadmapResponse = await fetch('data/roadmap.json');
const roadmap = await roadmapResponse.json();

const earned = loadEarned();
const settings = loadSettings();
let selectedId = trophies[0].id;

const listElement = document.getElementById('trophyList');
const detailPanel = document.getElementById('detailPanel');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const progressPct = document.getElementById('progressPct');
const gradeCounts = document.getElementById('gradeCounts');
const resultLine = document.getElementById('resultLine');
const searchInput = document.getElementById('searchInput');
const gradeSelect = document.getElementById('gradeSelect');
const spoilerToggle = document.getElementById('spoilerToggle');
const earnedOnlyToggle = document.getElementById('earnedOnlyToggle');
const kindChips = document.getElementById('kindChips');

function selectedTrophy() {
  return trophies.find((trophy) => trophy.id === selectedId) ?? null;
}

function renderAll() {
  const visible = filterTrophies(trophies, settings, earned);
  renderProgress(trophies, earned, progressText, progressFill, progressPct, gradeCounts);
  renderTrophyList(
    listElement,
    visible,
    earned,
    settings,
    selectedId,
    (id) => {
      selectedId = id;
      renderAll();
    },
    toggleEarned,
  );
  renderTrophyDetail(detailPanel, selectedTrophy(), earned, settings.spoiler, toggleEarned);
  resultLine.textContent = `Showing ${visible.length} of ${trophies.length} trophies` +
    (settings.spoiler ? ' · story spoilers hidden' : '');
}

function toggleEarned(id, isEarned) {
  if (isEarned) earned.add(id);
  else earned.delete(id);
  saveEarned(earned);
  renderAll();
}

function applySettingsToControls() {
  searchInput.value = settings.search;
  gradeSelect.value = settings.grade;
  spoilerToggle.checked = settings.spoiler;
  earnedOnlyToggle.checked = settings.earnedOnly;
  for (const chip of kindChips.querySelectorAll('.chip')) {
    chip.classList.toggle('active', chip.dataset.kind === settings.kind);
  }
}

searchInput.addEventListener('input', () => {
  settings.search = searchInput.value;
  renderAll();
});
gradeSelect.addEventListener('change', () => {
  settings.grade = gradeSelect.value;
  saveSettings(settings);
  renderAll();
});
spoilerToggle.addEventListener('change', () => {
  settings.spoiler = spoilerToggle.checked;
  saveSettings(settings);
  renderAll();
});
earnedOnlyToggle.addEventListener('change', () => {
  settings.earnedOnly = earnedOnlyToggle.checked;
  saveSettings(settings);
  renderAll();
});
kindChips.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  settings.kind = chip.dataset.kind;
  saveSettings(settings);
  applySettingsToControls();
  renderAll();
});

document.getElementById('exportButton').addEventListener('click', () => {
  downloadTextFile('leonida-legends-progress.json', buildExportFile(earned, trophies.length));
});
document.getElementById('importInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const validIds = new Set(trophies.map((trophy) => trophy.id));
    const imported = parseImportFile(await file.text(), validIds);
    earned.clear();
    for (const id of imported) earned.add(id);
    saveEarned(earned);
    renderAll();
    resultLine.textContent = `Imported ${earned.size} earned trophies from ${file.name}.`;
  } catch (error) {
    resultLine.textContent = `Import failed: ${error.message}`;
  }
  event.target.value = '';
});
document.getElementById('resetButton').addEventListener('click', () => {
  earned.clear();
  saveEarned(earned);
  renderAll();
});

const trackerView = document.getElementById('trackerView');
const roadmapView = document.getElementById('roadmapView');
const tabTracker = document.getElementById('tabTracker');
const tabRoadmap = document.getElementById('tabRoadmap');

function showView(which) {
  const showRoadmap = which === 'roadmap';
  trackerView.hidden = showRoadmap;
  roadmapView.hidden = !showRoadmap;
  tabTracker.classList.toggle('active', !showRoadmap);
  tabRoadmap.classList.toggle('active', showRoadmap);
  tabTracker.setAttribute('aria-pressed', String(!showRoadmap));
  tabRoadmap.setAttribute('aria-pressed', String(showRoadmap));
}
tabTracker.addEventListener('click', () => showView('tracker'));
tabRoadmap.addEventListener('click', () => showView('roadmap'));

renderRoadmap(
  roadmap,
  document.getElementById('roadmapSummary'),
  document.getElementById('roadmapStages'),
  document.getElementById('roadmapWarnings'),
);
applySettingsToControls();
renderAll();
