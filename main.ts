// Leonida Legends — a GTA VI trophy guide and tracker (gta6-trophy-guide-01).
// Node 22, standard library only. The guide itself is plain static files in
// app/ (index.html, style.css, ES modules, data/trophies.json, data/roadmap.json)
// that run offline in a desktop browser with no network requests at all.
// This program hands the entry in: it copies app/ and screenshots/ from beside
// this file into the output directory and writes dossier.json there, using the
// vendored make.fun library (vendor/makefun-frontend.ts, the kit's copy, kept
// byte for byte unchanged). Outside the grader, MAKEFUN_OUTPUT_DIR stands in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

if (!existsSync(join(repoRoot, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing — the guide was not built.');
}
if (!existsSync(join(repoRoot, 'app', 'data', 'trophies.json'))) {
  throw new Error('app/data/trophies.json is missing — the trophy data was not built.');
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps matching the scorer's gate: the dossier text is capped, at most four
// screenshots of at most 256 KiB each, app/ at most 993 files and 48 MiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
