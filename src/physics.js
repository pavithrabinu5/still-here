// Pure functions used by the story. Kept separate so they can be unit-tested.
// SI disclosure: written with SI assistance (Claude, Anthropic); reviewed and tested by Team PARALLAX.

/** Speed of light in vacuum, exact by SI definition: 299 792 458 m/s. */
export const C_KM_PER_S = 299792.458;

/**
 * One-way distance from a round-trip light time.
 * The pulse travels out AND back, so the one-way distance is c * t / 2.
 * This is the simple vacuum relation only — real lunar ranging adds
 * atmospheric, relativistic, station-motion and other model corrections.
 * @param {number} roundTripSeconds
 * @returns {number} kilometres
 */
export function oneWayDistanceKm(roundTripSeconds) {
  if (typeof roundTripSeconds !== 'number' || !Number.isFinite(roundTripSeconds) || roundTripSeconds <= 0) {
    throw new RangeError('Round-trip time must be a positive, finite number of seconds.');
  }
  return (C_KM_PER_S * roundTripSeconds) / 2;
}

/** Format kilometres with thousands separators, rounded to whole km. */
export function formatKm(km) {
  return Math.round(km).toLocaleString('en-US');
}

/**
 * 2-D slice of a corner reflector: two perpendicular mirrors meeting at the
 * origin, one along +x (y = 0), one along +y (x = 0), each of length L.
 * A ray arrives travelling down-left at angle `thetaDeg` below horizontal.
 * Returns the polyline of the ray and its final direction.
 */
export function cornerPath(thetaDeg, L = 100, entry = 1.6) {
  const t = (thetaDeg * Math.PI) / 180;
  const d0 = { x: -Math.cos(t), y: -Math.sin(t) };
  // Choose where the ray strikes the floor mirror so that it then strikes the wall mirror within length L.
  const tan = Math.tan(t);
  const x0 = Math.min(0.62 * L, (0.8 * L) / tan);
  const hit1 = { x: x0, y: 0 };
  const d1 = { x: d0.x, y: -d0.y }; // reflect off y = 0
  const hit2 = { x: 0, y: x0 * tan }; // travel from hit1 to x = 0
  const d2 = { x: -d1.x, y: d1.y }; // reflect off x = 0
  const start = { x: hit1.x - d0.x * entry * L, y: hit1.y - d0.y * entry * L };
  const end = { x: hit2.x + d2.x * entry * L, y: hit2.y + d2.y * entry * L };
  return { points: [start, hit1, hit2, end], dIn: d0, dOut: d2 };
}

/**
 * A single flat mirror (the same floor mirror tilted by `tiltDeg`, rotating
 * about the strike point). Shows that a flat mirror only sends light straight
 * back when it faces the source exactly.
 */
export function flatPath(thetaDeg, tiltDeg, L = 100, entry = 1.6) {
  const t = (thetaDeg * Math.PI) / 180;
  const d0 = { x: -Math.cos(t), y: -Math.sin(t) };
  const a = (tiltDeg * Math.PI) / 180;
  const n = { x: -Math.sin(a), y: Math.cos(a) }; // mirror normal
  const dot = d0.x * n.x + d0.y * n.y;
  const d1 = { x: d0.x - 2 * dot * n.x, y: d0.y - 2 * dot * n.y };
  const hit = { x: 0.5 * L, y: 0.15 * L };
  const start = { x: hit.x - d0.x * entry * L, y: hit.y - d0.y * entry * L };
  const end = { x: hit.x + d1.x * entry * L, y: hit.y + d1.y * entry * L };
  return { points: [start, hit, end], dIn: d0, dOut: d1, mirrorAngle: a };
}

/** Angle in degrees between the outgoing ray and the exact reverse of the incoming ray. */
export function returnErrorDeg(dIn, dOut) {
  const rx = -dIn.x, ry = -dIn.y;
  const c = Math.max(-1, Math.min(1, rx * dOut.x + ry * dOut.y));
  return (Math.acos(c) * 180) / Math.PI;
}
