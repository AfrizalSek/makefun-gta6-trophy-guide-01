// ProgressStore — the earned-trophy checklist, saved in localStorage and
// exportable to a file / importable back. No network, no account.
export const EARNED_KEY = 'leonida-legends-earned-v1';
export const SETTINGS_KEY = 'leonida-legends-settings-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return {
      spoiler: Boolean(parsed.spoiler),
      kind: typeof parsed.kind === 'string' ? parsed.kind : 'all',
      grade: typeof parsed.grade === 'string' ? parsed.grade : 'all',
      search: '',
      earnedOnly: Boolean(parsed.earnedOnly),
    };
  } catch {
    return { spoiler: false, kind: 'all', grade: 'all', search: '', earnedOnly: false };
  }
}

export function saveSettings(settings) {
  const { search, ...persisted } = settings;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(persisted));
}

export function buildExportFile(earned, total) {
  return JSON.stringify(
    {
      app: 'Leonida Legends — GTA VI trophy tracker',
      exportedAt: new Date().toISOString(),
      total,
      earned: [...earned].sort((a, b) => a - b),
    },
    null,
    2,
  );
}

export function parseImportFile(text, validIds) {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('That file does not hold a list of earned trophies.');
  const ids = list.filter((id) => Number.isInteger(id) && validIds.has(id));
  if (ids.length === 0 && list.length > 0) {
    throw new Error('That file holds no trophy ids this guide recognises.');
  }
  return new Set(ids);
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
