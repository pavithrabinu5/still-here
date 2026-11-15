# Still Here

**Team PARALLAX · NASA Space Apps Challenge 2026 · "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars"**

A short interactive science story for ages 10–14 and casual space fans. It asks: *how can equipment left on the Moon decades ago still help us do science without electrical power there?* The answer comes through the Apollo 11 Laser Ranging Retro-Reflector and the Earth-based work that keeps it useful.

**Live site:** https://pavithrabinu5.github.io/still-here/ · **Demo video (≤30 s):** [`demo/still-here-demo.webm`](demo/still-here-demo.webm)

The story has seven chapters and takes about 6–10 minutes: title screen → opening → two neighbours (archival-photo inspection + Moon/Earth sorter) → corner-cube mirror test → timed round trip with c·t/2 → echo-to-evidence steps → three applied questions → ending with a "Mission files" folder of key sources. It is styled as a pixel-art retro desktop with walking characters and five discovery stars earned at real learning milestones. Every factual statement links to a NASA source.

## Run it

Requires Node 18 or later (tested on Node 25.6.1, macOS).

```bash
cd still-here
npm install
npm run dev            # development server at http://localhost:5173
npm run build          # production build into dist/
npm run preview        # serve dist/ at http://localhost:4173
```

`dist/` is a static site: `index.html`, one JS and one CSS file, and two local JPEGs. It makes no network requests at runtime. Host it on any static host, or open it from a local server.

## Test it

```bash
npm run test:unit                      # physics: units, reference cases, edge cases, mirror geometry
npx playwright install chromium        # once
npm run build && npm run preview &     # serve the production build on :4173
npm run test:e2e                       # full journey at 3 widths + reduced motion, offline, keyboard and no-JS
node tests/e2e/measure.mjs             # colour contrast + load metrics
```

The tests save screenshots and `results.json` to `tests/e2e/shots/`.

## Files
| Path | Purpose |
|---|---|
| `index.html` | All story content (works without JS as a long page) and the sources/credits dialog |
| `src/main.js` | Navigation, interactions, quiz, restart |
| `src/physics.js` | Pure, tested functions: c·t/2 and 2-D mirror ray paths |
| `src/style.css` | Base layout, components, accessibility and responsive rules |
| `src/pixel.css` | Pixel / retro-desktop theme: bevelled windows, title bars, starfield desktop, pixel font for headings |
| `src/intro.js` | Title screen (real loading steps → PRESS START), walking characters, discovery stars |
| `src/sprites.js` | Original pixel-art characters (reflector mascot, observatory, scientist, seismometer, astronaut) drawn as SVG |
| `public/fonts/` | Pixelify Sans (SIL OFL 1.1), hosted locally |
| `public/img/` | NASA archival photos AS11-40-5942 and AS11-40-5948 (web-sized copies) |
| `mission.html`, `src/mission.*` | **Rejected prototype** of a low-poly mission scene, kept for the record. Not linked; not in `dist/` |
| `docs/CLAIM-LEDGER.md` | Every claim, number and asset, with its source and qualifications |
| `demo/still-here-demo.webm` | 27.6 s demo video recorded from the real app (`tests/e2e/record-demo.mjs`) |
| `docs/TESTING.md` | What was tested and the actual results |
| `docs/LEARNING-EVALUATION.md` | Assessment questions and a fair-comparison protocol (not yet run) |

## Sources and credits (summary)
Full list in-app (Sources & credits) and in `docs/CLAIM-LEDGER.md`.
- NASA NSSDCA: Apollo 11 LM/EASEP record (1969-059C); Apollo 11 page.
- NASA Goddard Space Geodesy Project: Apache Point lunar laser ranging station.
- NASA (2020): "Laser Beams Reflected Between Earth and Moon Boost Science".
- NASA Image and Video Library: AS11-40-5942 and AS11-40-5948 (photos by Neil Armstrong, Apollo 11, NASA/JSC). NASA still images are generally not under US copyright; use follows NASA media guidelines and implies no endorsement.
- Apollo Lunar Surface Journal (nasa.gov).

## Scientific limitations
This is an educational story, not a ranging instrument, a new result or a reconstruction of a real observation. The c·t/2 calculation ignores the atmosphere, relativity, motion and calibration. Round-trip inputs and the stopwatch are illustrative. The mirror diagram is a 2-D slice. The schematic is not to scale. Recession and fluid-core findings are NASA-reported results from decades of multi-reflector data.

## License
Original work: Apache License 2.0 (https://www.apache.org/licenses/LICENSE-2.0), which is the Space Apps default. NASA photographs are third-party public-domain material and are not relicensed. Dev dependencies: Vite (MIT), Playwright (Apache-2.0); neither is shipped in `dist/`.
