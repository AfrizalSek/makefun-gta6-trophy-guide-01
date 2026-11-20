[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/AfrizalSek/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/AfrizalSek/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).

# Leonida Legends — GTA VI Trophy Guide & Tracker

An offline web app: the best guide + tracker for the 55 PS5 trophies of GTA VI.
Static files, works in desktop Chrome with the network off. Every trophy has
its official name, description and grade, a guide in my own words with cited
sources, a checklist saved in the browser (localStorage) with export/import,
filters by kind and grade, a spoiler setting that hides story trophies until
earned, a platinum roadmap, and missable flags.

## Features

- All 55 trophies: official name, description, grade (1 platinum / 2 gold /
  6 silver / 46 bronze)
- Checklist persisted in localStorage, with export/import
- Filters by kind, grade, search and earned-only; spoiler toggle hides the
  18 story trophies
- Platinum roadmap (7 stages) + missable flags
- Zero network requests at runtime

## Verification

Verified with Playwright + Chromium: 20/20 checks pass — all 55 trophies
render, grade split 1 platinum / 2 gold / 6 silver / 46 bronze, checklist
persists across reload, spoiler hides the 18 story trophies, zero console
errors, zero external requests.

## Run it

Open `app/index.html` in desktop Chrome, or serve the `app/` folder with any
static server.

## Sources

Guides are written in my own words, citing PowerPyx's GTA 6 Trophy Guide &
Roadmap and Planet GTA 6, cross-checked against KeenGamer, Sixshore and
Exophase/PSNProfiles. One trophy ("Bad Luck, I Guess") is honestly marked
unconfirmed — its method is not publicly known, so no step is invented for it.

## License

MIT
