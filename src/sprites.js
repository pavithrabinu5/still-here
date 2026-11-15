// Original pixel-art sprites for Still Here, drawn as SVG rectangles.
// SI disclosure: sprite designs and code produced with SI assistance (Claude, Anthropic); shown with a visible "SI-assisted pixel art" label.
// These are cartoon characters, not depictions of real hardware.

export const PAL = {
  k: '#2b2233', w: '#f6f3ec', g: '#cfcac0', d: '#8d887e', y: '#f2b84b', o: '#c98a2b',
  c: '#e08a52', C: '#a85a2e', b: '#6b8fd6', B: '#34508c', p: '#f3a3a8', e: '#1a1420',
  l: '#3ee38f', L: '#1f7a4c', f: '#f2c9a0', h: '#5a4334',
};

const RETRO_BASE = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kggggggggggggk.',
  '.kgdgdgdgdgdgdk.',
  '.kggggggggggggk.',
  '.kggeeggggeeggk.',
  '.kggeeggggeeggk.',
  '.kgpgggkkgggpgk.',
  '.kggggggggggggk.',
  '.kgdgdgdgdgdgdk.',
  '.kkkkkkkkkkkkkk.',
  '....kdk..kdk....',
  '....kkk..kkk....',
];
const RETRO_HAPPY = RETRO_BASE.map((r, i) => (i === 5 ? '.kgggegggggeggk.' : i === 6 ? '.kggegegggegegk.' : i === 7 ? '.kgpggkkkkggpgk.' : r));
const RETRO_HMM = RETRO_BASE.map((r, i) => (i === 7 ? '.kgpggggkkggpgk.' : r));

export const SPRITES = {
  astro: [
    '.....kkkkkk.....',
    '...kkwwwwwwkk...',
    '..kwwwwwwwwwwk..',
    '.kwwkkkkkkkkwwk.',
    '.kwkyyyyyyyykwk.',
    '.kwkyywyyyyykwk.',
    '.kwkoyyyyyyokwk.',
    '.kwwkkkkkkkkwwk.',
    '..kwwwwwwwwwwk..',
    '.kkwwwggggwwwkk.',
    'kwwkwwgbbgwwkwwk',
    'kwwkwwggggwwkwwk',
    'kkkkwwwwwwwwkkkk',
    '...kwwwkkwwwk...',
    '...kwwwkkwwwk...',
    '..kddddk.kddddk.',
    '..kkkkkk.kkkkkk.',
  ],
  retro: RETRO_BASE,
  'retro-happy': RETRO_HAPPY,
  'retro-hmm': RETRO_HMM,
  seis: [
    '........kk........',
    '........kg........',
    '........kg........',
    '.....kkkkkkkk.....',
    'kkkkkkcccccckkkkkk',
    'kbBbkkcccccckkbBbk',
    'kbBbkkCCccCCkkbBbk',
    'kbBbkkcpccpckkbBbk',
    'kbBbkkccCCcckkbBbk',
    'kkkkkkcccccckkkkkk',
    '.....kkkkkkkk.....',
    '.....kdk..kdk.....',
  ],
  dome: [
    '.....kkkkkk.....',
    '...kkwwwwwwkk...',
    '..kwwwwkkwwwwk..',
    '.kwwwwwkLkwwwwk.',
    '.kwwwwwkLkwwwwk.',
    'kkkkkkkkkkkkkkkk',
    'kggggggggggggggk',
    'kggeeggggggeeggk',
    'kggeeggggggeeggk',
    'kgpggggkkggggpgk',
    'kggggggggggggggk',
    'kkkkkkkkkkkkkkkk',
  ],
  sci: [
    '....kkkkkk....',
    '...khhhhhhk...',
    '..khhhhhhhhk..',
    '..khffffffhk..',
    '..kfeffffefk..',
    '..kfpffffpfk..',
    '..kfffkkfffk..',
    '...kffffffk...',
    '..kwwwlwwwwk..',
    '.kwwwwwwwwwwk.',
    '.kfkwwwwwwkfk.',
    '..kwwwwwwwwk..',
    '..kwwwkkwwwk..',
    '..kBBk..kBBk..',
    '..kkkk..kkkk..',
  ],
};

/** Procedural pixel Moon and Earth (cartoon, not to scale). */
function disc(size, paint) {
  const rows = [];
  const c = (size - 1) / 2, r = size / 2 - 0.5;
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - c, y - c);
      row += d > r ? '.' : d > r - 1 ? 'k' : paint(x, y, c);
    }
    rows.push(row);
  }
  return rows;
}
const CRATERS = [[9, 8, 2.2], [19, 11, 3], [12, 18, 2.5], [21, 20, 1.6], [7, 14, 1.3], [16, 6, 1.2]];
SPRITES.moon = disc(30, (x, y, c) => {
  for (const [cx, cy, cr] of CRATERS) { const d = Math.hypot(x - cx, y - cy); if (d < cr) return d < cr - 0.9 ? 'd' : 'g'; }
  return x + y > 2 * c + 8 ? 'g' : 'w'; // soft terminator shading toward lower right
});
SPRITES.earth = disc(12, (x, y) => ((x * 7 + y * 3) % 11 < 3 || (x > 6 && y < 5) ? 'L' : (x + y) % 9 === 0 ? 'w' : 'b'));

/** Render a sprite to an SVG string. Horizontal runs are merged to keep the markup small. */
export function sprite(name, { px = 6, label = '', cls = '' } = {}) {
  const rows = SPRITES[name];
  if (!rows) throw new Error(`Unknown sprite ${name}`);
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  let rects = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let n = 1;
      while (x + n < row.length && row[x + n] === ch) n++;
      if (ch !== '.' && ch !== ' ' && PAL[ch]) rects += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${PAL[ch]}"/>`;
      x += n;
    }
  });
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg class="sprite ${cls}" viewBox="0 0 ${w} ${h}" width="${w * px}" height="${h * px}" shape-rendering="crispEdges" ${a11y}>${rects}</svg>`;
}
