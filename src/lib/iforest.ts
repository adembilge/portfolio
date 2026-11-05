export type Pt = { x: number; y: number };
export type Box = { x0: number; x1: number; y0: number; y1: number };
export type Cut = { axis: 'x' | 'y'; value: number; box: Box };

/**
 * Grow one isolation-tree path toward `target`: random axis, random split inside the current
 * subset's range, keep the side holding the target, until it stands alone.
 */
export function isolate(points: Pt[], target: number, r: () => number, maxDepth = 40): Cut[] {
  let idx = points.map((_, i) => i);
  const t = points[target];
  const cuts: Cut[] = [];
  let box: Box = bounds(points);
  while (idx.length > 1 && cuts.length < maxDepth) {
    const axis = r() < 0.5 ? 'x' : 'y';
    let lo = Infinity;
    let hi = -Infinity;
    for (const i of idx) {
      const v = points[i][axis];
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (hi - lo < 1e-9) break; // duplicates cannot be separated
    const value = lo + r() * (hi - lo);
    cuts.push({ axis, value, box: { ...box } });
    const left = t[axis] < value;
    idx = idx.filter((i) => (points[i][axis] < value) === left);
    box =
      axis === 'x'
        ? left ? { ...box, x1: value } : { ...box, x0: value }
        : left ? { ...box, y1: value } : { ...box, y0: value };
  }
  return cuts;
}

export function avgPathLength(points: Pt[], target: number, trees: number, r: () => number): number {
  let sum = 0;
  for (let k = 0; k < trees; k++) sum += isolate(points, target, r).length;
  return sum / trees;
}

export function bounds(points: Pt[]): Box {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of points) {
    x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
    y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
  }
  return { x0, x1, y0, y1 };
}
