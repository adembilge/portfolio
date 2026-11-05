/** Intersection over union of two binary masks of equal length (non-zero = inside). */
export function iou(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let inter = 0;
  let union = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] > 0;
    const y = b[i] > 0;
    if (x && y) inter++;
    if (x || y) union++;
  }
  return union === 0 ? 0 : inter / union;
}
