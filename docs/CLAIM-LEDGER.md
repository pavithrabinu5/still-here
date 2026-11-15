# Claim ledger — Still Here

Sources were read directly on 15 Nov 2026, using a headless browser or HTTP. IDs match the in-app Sources panel.

| ID | Source | Access result |
|---|---|---|
| S1 | NSSDCA, Apollo 11 LM / EASEP (1969-059C) — https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C | Read in full |
| S2 | NSSDCA, Apollo 11 25th anniversary page — https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo11.html | Read in full |
| S3 | NASA Goddard SGP, Apache Point — https://earth.gsfc.nasa.gov/geo/networks/sgp/sites/apache-point | Read in full |
| S4 | NASA, "Laser Beams Reflected Between Earth and Moon Boost Science" (10 Aug 2020) — https://www.nasa.gov/missions/laser-beams-reflected-between-earth-and-moon-boost-science/ | Read in full |
| S5 | ALSJ Apollo 11 Image Library (nasa.gov mirror) — https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/images11.html | Read; its image file links return 404, so photos were taken from S6/S7 |
| S6 | NASA Image Library as11-40-5942 — https://images.nasa.gov/details/as11-40-5942 | Metadata and image read |
| S7 | NASA Image Library as11-40-5948 — https://images.nasa.gov/details/as11-40-5948 | Metadata and image read |
| S8 | NIST CODATA, speed of light — https://physics.nist.gov/cgi-bin/cuu/Value?c | Exact SI value; not re-fetched this session (standard definition) |
| — | JPL, "The Apollo experiment that keeps on giving" | **Not verified** (CloudFront 403). Not used. |
| — | Space Apps challenge, Resources tab, Terms, FAQ, 2026 Project Submission Guide | Read in full |

## Claims used in the experience

| # | Claim as shown | Source | Qualification / note |
|---|---|---|---|
| 1 | Apollo 11 landed in the Sea of Tranquility, 20 July 1969 | S2 | Dates are EDT, as on S2. The photos are dated 20 July 1969 in the S6/S7 metadata. |
| 2 | Aldrin carried the seismometer (left hand) and the reflector (right hand) | S6 | Caption from the NASA metadata; photo by Armstrong. |
| 3 | The reflector was part of EASEP and "required no power" | S1 | S1 says the LRRR "was also considered part of the EASEP although it was not attached to the unit and required no power". |
| 4 | EASEP seismometer: two solar panels, worked only in lunar day, radio link, measured seismic activity | S1 | |
| 5 | The seismometer stopped accepting commands on 27 Aug 1969 | S1 | |
| 6 | Reflector placed about 5 m NNW of the EASEP | S1 | |
| 7 | EASEP was the forerunner of the later ALSEP packages | S1 | The Resources tab links ALSEP to 1969-099C (Apollo 12). We say "EASEP" for Apollo 11 on purpose. |
| 8 | The Apollo 11 array has 100 corner cubes; corner cubes send light back toward its source | S4 | |
| 9 | Five reflector arrays on the Moon: Apollo 11, 14, 15, Lunokhod 1 and 2 | S3, S4 | |
| 10 | Apache Point: 3.5 m telescope, Sunspot NM, avalanche photodiodes, millimetre-level precision | S3 | |
| 11 | Apache Point ranges several times a month to all five arrays | S3 | This is the basis for "still used". |
| 12 | NMSU has run daily operations since 2021, as part of the NASA Space Geodesy Network | S3 | |
| 13 | Absolute Calibration System installed late 2016; all data reprocessed | S3 | |
| 14 | Normal points; quality control finds centimetre-level biases | S3 | We do not define normal points beyond "summary measurements". |
| 15 | Data from 2006 to mid-January 2024 released to NASA CDDIS (Feb 2024) | S3 | The app says "2006 to early 2024". |
| 16 | Round trip "about 2.5 seconds on average" | S4 | Used only as the slider's default. Labelled illustrative. |
| 17 | Beam goes from a few metres wide to more than 2 km at the Moon | S4 | |
| 18 | About 1 in 25 million photons reach the Apollo 11 reflector; about 1 in 250 million of those return | S4 | S4 says "according to some estimates"; the app says "By some estimates". |
| 19 | Atmosphere crossed twice; positions must be pinpointed | S4 | Shown in the "limits" note. |
| 20 | Moon receding about 3.8 cm/yr; evidence of a fluid core | S4 | Always attributed to decades of data across several reflectors, never to Apollo 11 alone or one pulse. |
| 21 | Some reflectors return about a tenth of the expected signal; dust suspected, unresolved | S4 | |
| 22 | "Laser-ranging science is a long game." — E. Mazarico | S4 | Direct quote. |
| 23 | Green light used traditionally | S4 | This is why the beam colour is green. Not stated in the app as a claim. |
| 24 | Lunar Module descent stages left behind as launch pads | Challenge Resources tab | **Prototype scene only** (`mission.html`). |

## Numbers and calculations

| Value | Status |
|---|---|
| c = 299 792.458 km/s | Exact SI definition (S8). Unit-tested. |
| d = c·t/2 | Standard vacuum relation. Halved because t covers out and back. Unit-tested (reference cases 1 s and 2.5 s, linearity, invalid inputs). |
| Slider range 2.350–2.700 s | **Illustrative.** Chosen to bracket a plausible station-to-reflector range; it is not an observation. Labelled "illustrative input" and "not real observations". |
| 2.5 s → 374,741 km | Computed; e2e-tested. Station-to-reflector distance; ignores the atmosphere, relativity, motion and calibration (stated in the app). |
| Stopwatch | Animation timer. Labelled "illustrative". Not a reading. |
| Corner/flat mirror angles | 2-D geometry. Labelled illustration. Unit-tested: the corner returns at 0° error for 5–85°; a flat mirror at 50° errs by 80°. |

## Fiction and illustration
- Two quotes labelled "Imagined voice" are fiction.
- The diagrams are SI-assisted code illustrations, labelled on screen.
- Hotspot labels on archival photos were added in this project.

## Asset rights
| Asset | Basis |
|---|---|
| AS11-40-5942, AS11-40-5948 | NASA/JSC Apollo 11 crew photographs (Armstrong), from the NASA Image and Video Library. NASA still images are generally not under US copyright. The NASA media usage guidelines apply (no implied endorsement). The guidelines page was **not re-read this session**; confirm before submission. |
| Code, CSS, SVG diagrams | Original to this project, made with SI assistance. Apache-2.0 (the Space Apps default). |
| Pixel sprites (`src/sprites.js`) | Original cartoon characters drawn as code with SI assistance. They are inspired by a general chibi/pixel style from reference images the team supplied, **not copied** from them. Marked with the on-screen watermark "Illustrations: SI-generated"; credits state they are not depictions of real people or exact hardware. |
| Pixelify Sans font (`public/fonts/`) | Downloaded from Google Fonts on 15 Nov 2026 and hosted locally. SIL Open Font License 1.1, as listed by Google Fonts (designer attribution not re-checked). Used only for headings, labels and buttons. All numbers use a monospace font, because the pixel "2" can read as "8". |
| Dependencies | Vite 6.3.5 (MIT) and Playwright 1.52.0 (Apache-2.0) are dev-only. Nothing third-party ships in `dist/`. |
