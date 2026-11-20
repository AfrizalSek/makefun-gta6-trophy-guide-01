// TrophyViews — renders the checklist, the trophy detail panel and the
// platinum roadmap from the loaded trophy and roadmap data. Pure DOM building;
// no string-built HTML, so nothing from the data can run as code.
export function isStoryTrophy(trophy) {
  return trophy.kinds.includes('story');
}

export function isHiddenBySpoilers(trophy, spoilerOn, earned) {
  return spoilerOn && isStoryTrophy(trophy) && !earned.has(trophy.id);
}

export function filterTrophies(trophies, settings, earned) {
  const query = settings.search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (settings.kind === 'missable' && !trophy.missable) return false;
    if (settings.kind !== 'all' && settings.kind !== 'missable' && !trophy.kinds.includes(settings.kind)) return false;
    if (settings.grade !== 'all' && trophy.grade !== settings.grade) return false;
    if (settings.earnedOnly && !earned.has(trophy.id)) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kinds.join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function makeBadge(text, className) {
  const badge = document.createElement('span');
  badge.className = `badge ${className}`;
  badge.textContent = text;
  return badge;
}

export function renderProgress(trophies, earned, progressText, progressFill, progressPct, gradeCounts) {
  progressText.textContent = `${earned.size} of ${trophies.length} earned`;
  const pct = Math.round((earned.size / trophies.length) * 100);
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const total = trophies.filter((t) => t.grade === grade).length;
    const got = trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
    return `${gradeLabel(grade)} ${got}/${total}`;
  });
  gradeCounts.textContent = parts.join('  ·  ');
}

export function renderTrophyList(listElement, trophies, earned, settings, selectedId, onSelect, onToggleEarned) {
  listElement.replaceChildren();
  for (const trophy of trophies) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'trophy-item';
    if (trophy.id === selectedId) button.classList.add('selected');
    if (earned.has(trophy.id)) button.classList.add('earned');

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'trophy-check';
    check.checked = earned.has(trophy.id);
    check.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    check.addEventListener('click', (event) => {
      event.stopPropagation();
      onToggleEarned(trophy.id, check.checked);
    });

    const body = document.createElement('span');
    const hidden = isHiddenBySpoilers(trophy, settings.spoiler, earned);
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = hidden ? 'Hidden trophy — earn it to reveal it' : trophy.name;
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.style.display = 'block';
    desc.textContent = hidden
      ? 'Story trophy hidden by the spoiler setting.'
      : trophy.description;
    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    meta.append(makeBadge(gradeLabel(trophy.grade), trophy.grade));
    for (const kind of trophy.kinds) meta.append(makeBadge(kind, 'kind'));
    if (trophy.missable) meta.append(makeBadge('Missable', 'missable'));
    if (earned.has(trophy.id)) meta.append(makeBadge('Earned', 'earned-badge'));
    body.append(name, desc, meta);

    const count = document.createElement('span');
    count.className = 'trophy-count';
    count.textContent = `#${trophy.id} of 55`;

    button.append(check, body, count);
    button.addEventListener('click', () => onSelect(trophy.id));
    item.append(button);
    listElement.append(item);
  }
  if (trophies.length === 0) {
    const note = document.createElement('li');
    note.className = 'empty-note';
    note.textContent = 'No trophies match these filters. Clear the search or pick another kind or grade.';
    listElement.append(note);
  }
}

export function renderTrophyDetail(panel, trophy, earned, spoilerOn, onToggleEarned) {
  panel.replaceChildren();
  if (!trophy) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'Pick a trophy on the left to read its guide, steps and sources.';
    panel.append(hint);
    return;
  }
  const hidden = isHiddenBySpoilers(trophy, spoilerOn, earned);
  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden trophy' : trophy.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden
    ? 'Official name and description hidden by the spoiler setting until earned.'
    : `Official: “${trophy.description}”`;
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.append(makeBadge(gradeLabel(trophy.grade), trophy.grade));
  for (const kind of trophy.kinds) meta.append(makeBadge(kind, 'kind'));
  if (trophy.missable) meta.append(makeBadge('Missable', 'missable'));
  panel.append(title, official, meta);

  if (trophy.missable) {
    const warn = document.createElement('div');
    warn.className = 'missable-box';
    const strong = document.createElement('strong');
    strong.textContent = 'Missable — read this first. ';
    const text = document.createElement('span');
    text.textContent = trophy.missable_reason;
    warn.append(strong, text);
    panel.append(warn);
  }

  if (hidden) {
    const note = document.createElement('p');
    note.textContent = 'Turn the spoiler setting off, or earn this trophy, to read its guide. The other trophies stay visible.';
    panel.append(note);
  } else {
    const guideHead = document.createElement('h3');
    guideHead.textContent = 'How to get it';
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    panel.append(guideHead, guide);

    if (trophy.steps && trophy.steps.length > 0) {
      const stepsHead = document.createElement('h3');
      stepsHead.textContent = 'Steps';
      const steps = document.createElement('ol');
      for (const step of trophy.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        steps.append(li);
      }
      panel.append(stepsHead, steps);
    }

    const sourcesHead = document.createElement('h3');
    sourcesHead.textContent = 'Sources';
    const sources = document.createElement('ul');
    sources.className = 'sources';
    for (const source of trophy.sources) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = source.name;
      li.append(link);
      sources.append(li);
    }
    panel.append(sourcesHead, sources);
  }

  const row = document.createElement('div');
  row.className = 'earn-row';
  const button = document.createElement('button');
  button.type = 'button';
  const isEarned = earned.has(trophy.id);
  button.textContent = isEarned ? '✓ Earned — tap to undo' : 'Mark as earned';
  if (isEarned) button.classList.add('earned');
  button.addEventListener('click', () => onToggleEarned(trophy.id, !isEarned));
  row.append(button);
  panel.append(row);
}

export function renderRoadmap(roadmap, summaryElement, stagesElement, warningsElement) {
  summaryElement.textContent = `Difficulty ${roadmap.estimated_difficulty} · ${roadmap.estimated_time} · ${roadmap.minimum_playthroughs} playthrough · ${roadmap.online_trophies} online trophies.`;
  stagesElement.replaceChildren();
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const title = document.createElement('h3');
    title.textContent = stage.title;
    const time = document.createElement('p');
    time.className = 'stage-time';
    time.textContent = stage.time;
    const body = document.createElement('p');
    body.textContent = stage.body;
    const items = document.createElement('ul');
    for (const item of stage.items) {
      const itemLi = document.createElement('li');
      itemLi.textContent = item;
      items.append(itemLi);
    }
    li.append(title, time, body, items);
    stagesElement.append(li);
  }
  warningsElement.replaceChildren();
  for (const warning of roadmap.warnings) {
    const li = document.createElement('li');
    li.textContent = warning;
    warningsElement.append(li);
  }
}
