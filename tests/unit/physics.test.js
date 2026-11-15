import { test } from 'node:test';
import assert from 'node:assert/strict';
import { C_KM_PER_S, oneWayDistanceKm, cornerPath, flatPath, returnErrorDeg } from '../../src/physics.js';

test('speed of light constant matches SI definition (299 792 458 m/s)', () => {
  assert.equal(C_KM_PER_S * 1000, 299792458);
});

test('reference case: 1 s round trip = c/2 one-way', () => {
  assert.equal(oneWayDistanceKm(1), 149896.229);
});

test('reference case: NASA "about 2.5 s" round trip gives ~375,000 km one-way', () => {
  const d = oneWayDistanceKm(2.5);
  assert.ok(Math.abs(d - 374740.5725) < 1e-6);
  // Plausibility: between station-to-reflector extremes (~355,000–400,000 km).
  assert.ok(d > 350000 && d < 400000);
});

test('units: halving the time halves the distance (linear relation)', () => {
  assert.ok(Math.abs(oneWayDistanceKm(1.25) * 2 - oneWayDistanceKm(2.5)) < 1e-9);
});

test('edge cases: zero, negative, NaN, Infinity, strings are rejected', () => {
  for (const bad of [0, -1, NaN, Infinity, '2.5', undefined]) {
    assert.throws(() => oneWayDistanceKm(bad), RangeError);
  }
});

test('corner reflector returns light exactly backwards at every tested angle', () => {
  for (let a = 5; a <= 85; a += 1) {
    const { dIn, dOut } = cornerPath(a);
    assert.ok(returnErrorDeg(dIn, dOut) < 1e-4, `angle ${a}`);
  }
});

test('corner path strikes the wall mirror within its length', () => {
  for (let a = 5; a <= 85; a += 1) {
    const { points } = cornerPath(a, 100);
    assert.ok(points[2].y <= 100 + 1e-9 && points[2].y >= 0, `angle ${a}`);
  }
});

test('flat mirror only retro-reflects when it faces the source', () => {
  // Incoming at 90° (straight down) onto an untilted floor mirror: returns straight back.
  assert.ok(returnErrorDeg(flatPath(90, 0).dIn, flatPath(90, 0).dOut) < 1e-6);
  // Incoming at 50° onto an untilted mirror: error is large (2 × 40° = 80°).
  const r = flatPath(50, 0);
  assert.ok(Math.abs(returnErrorDeg(r.dIn, r.dOut) - 80) < 1e-6);
});
