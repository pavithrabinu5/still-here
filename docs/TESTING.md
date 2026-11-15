# Testing summary — 15 Nov 2026

Environment: macOS (Darwin 25.6), Node 25.6.1, Vite 6.3.5. Browser tests used Playwright 1.52.0 with Chromium Headless Shell 136. **Only Chromium was tested.** Safari, Firefox and real phones were not tested.

## Technical verification (actual results)

| Check | Result |
|---|---|
| `npm run build` | Succeeds. `dist/` = index.html 29 KB (9 KB gzip), CSS 16 KB (4.7 KB gzip), JS 14 KB (5.8 KB gzip), 2 JPEGs (169 KB + 262 KB) |
| Unit tests (`npm run test:unit`) | **8/8 pass.** c matches the SI value; reference cases 1 s → 149,896.229 km and 2.5 s → 374,740.57 km; linearity; rejects 0, negative, NaN, ∞, strings and undefined; corner reflector returns light within 1e-4° at every angle from 5° to 85°; flat mirror at 50° errs by exactly 80° |
| Browser journey (`npm run test:e2e`) | **220/220 checks pass**, across desktop 1440×900, tablet 820×1180, mobile 375×812, mobile with reduced motion, offline (all non-localhost requests blocked), keyboard-only and JavaScript disabled |
| Covered in each journey | Every Next/Back control; progress-bar jump; restart (state fully cleared); deep link `#ch3`; both hotspots; wrong and right sorter answers; mirror at 15°, 52°, 75°, flat 50° and 90°; pulse firing and the button disabled in flight; stopwatch final value; calculator at 2.5 s and 2.6 s; tab arrow/End keys; wrong and right quiz answers; citation → highlighted source; Escape closes the dialog; exactly one chapter rendered at a time; no horizontal overflow; no console errors or warnings; no external requests |
| Reduced motion | Pulse result appears in 0.06 s with no animation; the CSS disables transitions and animations |
| Keyboard | Skip link is the first Tab stop; primary action reachable; Enter advances; visible 3 px focus outline; hotspots operable; tabs follow the ARIA arrow-key pattern; focus moves to each chapter heading |
| No-JS | All chapter text is readable as one long page; noscript summaries replace the sorter and quiz |
| Contrast (`tests/e2e/measure.mjs`) | All text/background pairs pass WCAG AA: 6.49:1 (muted on raised surface) up to 15.79:1. Disabled button raised from 3.93 to 8.00 |
| Performance (localhost, `measure.mjs`) | Desktop: LCP 44 ms, 185 KB. Simulated mobile (4× CPU, 1.6 Mbps, 150 ms latency): LCP 1.84 s, load 2.54 s, 441 KB (was 3.88 s / 876 KB before image compression). No Lighthouse run; these are not field data |
| External-service failure | The core experience makes zero runtime network requests (verified with the network blocked) |

## Defects found by inspecting screenshots, and fixed
1. **Opening chapter stayed visible under every other chapter.** `.chapter-open { display: grid }` overrode `[hidden]`. The attribute-based tests had passed anyway, so the test now checks the computed display.
2. On mobile, the chapter dots overlapped the brand and Sources button, blocking taps. The dots now sit on their own row.
3. Mobile hero crop cut off the astronaut's helmet.
4. Deep links changed by hash did not switch chapters (no `hashchange` handler).
5. Without JS, step panels stayed hidden (including the 3.8 cm/yr text).
6. Source chips in the fact list wrapped under the labels.
7. "laser ·" was clipped on the Earth-station label; on mobile the schematic labels were unreadably small (an HTML legend was added).
8. Hotspot labels covered the objects they named, and the marker positions were offset by the caption height.
9. The equation's "÷ 2" wrapped alone onto a new line.
10. The corner-only explanation also showed in flat-mirror mode.
11. A credit wrongly called the SI-assisted diagrams "original drawings by Team PARALLAX".
12. "About 30 Earth-widths" had no source in the ledger, so it was removed.

## Pixel-theme reskin (22:38–22:50)
- Retro-desktop theme and original pixel sprites added; content, sources and interactions unchanged.
- **Accuracy defect caught in screenshots:** the pixel font's "2" read as "8", so "÷ 2" looked like "÷ 8" and the stopwatch looked like "8.800 s". All numeric readouts, the quiz question, tab numbers and source IDs now use readable fonts.
- The mascot sprite was enlarged after it rendered too small to read as a character.
- The focus outline is now a 3 px dashed yellow line. The test was updated to accept dashed or solid.
- New palette contrast measured across 15 text/background pairs. All pass WCAG AA, from 5.22:1 (white on the light end of the title bar, and green on mint) to 14.69:1. The "correct" green was darkened after measuring 3.75:1 on the window gray (now 5.45:1).
- After the reskin: 10/10 unit tests, 220/220 browser checks.

## Game animations (22:48–22:57)
- **Title screen:** the boot log reports real steps only (font loaded, archival photo decoded, sprites drawn). There are no invented percentages. **▶ PRESS START** has a focus trap and the page behind is `inert`; Escape also enters. Deep links (`#ch1`–`#ch6`) skip it, and no-JS visitors never see it.
- **Motion:** walking characters on a ground strip at the bottom of every window (they never overlap content); a stepped pixel-wipe between chapters; an idle-bobbing mascot that hops when right and shakes when wrong; a twinkling star layer; a laser pulse on the title screen placed from the real sprite positions.
- **Discovery stars (5):** awarded only for real milestones: sorter completed, both mirror types tried, pulse timed, all five evidence steps viewed, quiz 3/3. Restart clears them.
- **Reduced motion:** every new animation is off; walkers stand still in fixed spots; the beam shows as a static track.
- **Defects found and fixed:** the laser pulse was invisible on the first title-screen render, so it was redrawn as a visible track with a moving pulse; Tab escaped the title screen, so a focus trap was added.
- **Results:** 10/10 unit tests, **252/252** browser checks (adds title-screen steps, focus, inert release, 5/5 stars earned, restart clears stars, deep link skips intro). Full log: `tests/e2e/last-run.log`. Load: desktop LCP 216 ms / 205 KB; simulated slow mobile LCP 1.93 s / 461 KB.

## Mission-files folder (23:00–23:04)
- The requested React/TypeScript/Tailwind/shadcn "glass folder" component was **not** installed. The project is plain JavaScript, the deadline was about an hour away, and the component's frosted-glass style clashes with the pixel theme. Its interaction was rebuilt natively in pixel style instead: hover leans the front panel and lifts the files; click opens and fans them; Escape closes; closed files are `inert`. Each file opens one of the story's real sources (S1, S3, S4, S7). No external images were added.
- **Defects found in screenshots and fixed:** fanned files hid each other's names, so they are now staggered so every name tab shows; the pixel font made "5948" read as "8948", so file names use a readable font.
- **Results:** 10/10 unit tests, **272/272** browser checks (adds folder starts closed/inert, opens, file opens the correct source, closes).

## Remaining defects, by user impact
1. **Untested outside Chromium.** Safari/iOS behaviour of `<dialog>`, `:has()` and range inputs is unverified. `:has()` only styles the selected radio pill, so the radio still works without it.
2. On a 375 px screen the two photo hotspot labels sit close together; they remain tappable (tested) but feel cramped.
3. The mobile evidence tab strip scrolls sideways; the first tab can scroll out of view (it stays reachable by swipe or arrow keys).
4. The stopwatch timing check is loose (2.4–4 s), because the screenshot taken during the animation adds overhead.
5. No screen-reader pass with VoiceOver or NVDA. ARIA roles were checked only by code review and keyboard tests.

## Educational benefit — not validated
No learner has used this. See `LEARNING-EVALUATION.md` for the prepared questions and the comparison protocol against NASA's own explainer. **No learning improvement is claimed.**
