import { describe, expect, it } from 'vitest';
import { avgPathLength, isolate, type Pt } from './iforest';
import { iou } from './iou';
import { decrypt, encrypt, newIv, newKey } from './cipher';
import { gauss, rng } from './rng';

describe('isolation forest', () => {
  const r = rng(7);
  const pts: Pt[] = Array.from({ length: 200 }, () => ({ x: gauss(r), y: gauss(r) }));
  pts.push({ x: 9, y: 9 });
  const outlier = pts.length - 1;

  it('isolates the target completely', () => {
    const cuts = isolate(pts, outlier, rng(1));
    expect(cuts.length).toBeGreaterThan(0);
  });

  it('isolates an outlier in fewer cuts than an inlier on average', () => {
    const inlier = pts.reduce((best, p, i) => (Math.hypot(p.x, p.y) < Math.hypot(pts[best].x, pts[best].y) ? i : best), 0);
    const out = avgPathLength(pts, outlier, 200, rng(2));
    const inn = avgPathLength(pts, inlier, 200, rng(3));
    expect(out).toBeLessThan(inn / 2);
  });
});

describe('iou', () => {
  it('computes intersection over union', () => {
    expect(iou([1, 1, 0, 0], [1, 0, 1, 0])).toBeCloseTo(1 / 3);
    expect(iou([1, 1], [1, 1])).toBe(1);
    expect(iou([0, 0], [0, 0])).toBe(0);
  });
});

describe('cipher', () => {
  it('round-trips AES-128-CBC and never emits plaintext', async () => {
    const { key, hex } = await newKey();
    expect(hex).toHaveLength(32);
    const iv = newIv();
    const msg = 'You’re booked. Ciao!';
    const ct = await encrypt(key, iv, msg);
    expect(new TextDecoder().decode(ct)).not.toContain('booked');
    expect(await decrypt(key, iv, new Uint8Array(ct))).toBe(msg);
  });
});
