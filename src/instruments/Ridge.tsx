import { useEffect, useMemo, useRef, useState } from 'react';
import { noise2 } from '../lib/noise';
import { iou } from '../lib/iou';
import { useCanvasSize, useReducedMotion } from '../lib/hooks';
import { useTicker } from '../lib/ticker';

const GW = 72;
const GH = 90;
const RW = GW * 2;
const RH = GH * 2;
const FRAME_INTERVAL = 1 / 30;

/** Fingerprint region (truth) and a model-like probability map, on a GW×GH grid. */
function makeField() {
  const truth = new Uint8Array(GW * GH);
  const prob = new Float32Array(GW * GH);
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const nx = (x / GW - 0.5) / 0.36;
      const ny = (y / GH - 0.53) / 0.41;
      const a = Math.atan2(ny, nx);
      const edge = 1 + 0.09 * noise2(Math.cos(a) * 1.6 + 3, Math.sin(a) * 1.6 + 7);
      const d = Math.hypot(nx, ny) / edge;
      const i = y * GW + x;
      truth[i] = d < 1 ? 1 : 0;
      // A deliberately imperfect "model": smudges and fine noise keep its best threshold below a careful human.
      prob[i] = 1 / (1 + Math.exp(-((1 - d) * 5 + noise2(x * 0.11, y * 0.11) * 3.2 + noise2(x * 0.5 + 9, y * 0.5) * 1.4)));
    }
  }
  return { truth, prob };
}

function makeRidges(truth: Uint8Array, prob: Float32Array) {
  const phase = new Float32Array(RW * RH);
  const strength = new Float32Array(RW * RH);
  for (let y = 0; y < RH; y++) {
    for (let x = 0; x < RW; x++) {
      const k = y * RW + x;
      const gi = (y >> 1) * GW + (x >> 1);
      if (!truth[gi]) {
        strength[k] = noise2(x * 0.7, y * 0.7) > 0.62 ? 0.25 : 0;
        continue;
      }
      const nx = x / RW - 0.5;
      const ny = y / RH - 0.47;
      const warp = noise2(x * 0.02, y * 0.02) * 0.03;
      const r = Math.hypot(nx * 1.15, ny) + 0.035 * Math.sin(Math.atan2(ny, nx) * 2 + 0.6) + warp;
      phase[k] = r * 150;
      strength[k] = (0.55 + 0.45 * noise2(x * 0.03 + 11, y * 0.03 - 4)) * Math.min(1, prob[gi] * 1.6);
    }
  }
  return { phase, strength };
}

export function Ridge({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const size = useCanvasSize(ref, GH / GW, 560);
  const reduced = useReducedMotion();
  const { truth, prob } = useMemo(makeField, []);
  const { phase, strength } = useMemo(() => makeRidges(truth, prob), [truth, prob]);
  const paint = useMemo(() => new Uint8Array(GW * GH), []);
  const [score, setScore] = useState(0);
  const [painted, setPainted] = useState(false);
  const [showTruth, setShowTruth] = useState(false);
  const [threshold, setThreshold] = useState(0.5);
  const [erase, setErase] = useState(false);
  const off = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = RW;
    c.height = RH;
    return c;
  }, []);
  const image = useMemo(() => new ImageData(RW, RH), []);
  const tRef = useRef(0);

  const draw = (t: number) => {
    const c = ref.current;
    if (!c || !size.w) return;
    const g = off.getContext('2d')!;
    const d = image.data;
    const offset = t * 0.6;
    for (let y = 0; y < RH; y++) {
      for (let x = 0; x < RW; x++) {
        const gi = (y >> 1) * GW + (x >> 1);
        const pixel = y * RW + x;
        const ink = !truth[gi] || Math.sin(phase[pixel] - offset) > 0.1 ? strength[pixel] : 0;
        let R = 246 - ink * 225;
        let G = 243 - ink * 224;
        let B = 236 - ink * 221;
        if (paint[gi]) {
          R = R * 0.55 + 255 * 0.45;
          G = G * 0.55 + 59 * 0.45;
          B = B * 0.55 + 18 * 0.45;
        }
        if (showTruth && truth[gi] && ((x + y) & 7) === 0) R = G = B = 21;
        const k = pixel * 4;
        d[k] = R;
        d[k + 1] = G;
        d[k + 2] = B;
        d[k + 3] = 255;
      }
    }
    g.putImageData(image, 0, 0);
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, size.w, size.h);
  };

  useTicker((t) => {
    if (t - tRef.current < FRAME_INTERVAL) return;
    tRef.current = t;
    draw(t);
  }, visible && !reduced);
  useEffect(() => draw(reduced ? 0 : tRef.current), [size, showTruth, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  const recompute = () => {
    setScore(iou(paint, truth));
    draw(reduced ? 0 : tRef.current);
  };

  const brush = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * GW;
    const cy = ((e.clientY - rect.top) / rect.height) * GH;
    const r = 4.2;
    const del = erase || e.button === 2 || e.buttons === 2;
    for (let y = Math.max(0, Math.floor(cy - r)); y < Math.min(GH, cy + r); y++)
      for (let x = Math.max(0, Math.floor(cx - r)); x < Math.min(GW, cx + r); x++)
        if (Math.hypot(x - cx, y - cy) < r) paint[y * GW + x] = del ? 0 : 1;
    setPainted(true);
    recompute();
  };

  const applyThreshold = (v: number) => {
    setThreshold(v);
    for (let i = 0; i < prob.length; i++) paint[i] = prob[i] >= v ? 1 : 0;
    setPainted(true);
    recompute();
  };

  const clear = () => {
    paint.fill(0);
    setPainted(false);
    recompute();
  };

  return (
    <div className="ridge">
      <div className="ridge__canvas">
        <canvas
          ref={ref}
          role="img"
          aria-label="A generated fingerprint. Paint over the region you think is fingerprint; your mask is scored by IoU against the true region."
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            brush(e);
          }}
          onPointerMove={(e) => e.buttons && brush(e)}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
      <div className="ridge__panel">
        <div className="readout" aria-live="polite">
          <span>Your mask</span>
          <b className="tabular">{painted ? `${(score * 100).toFixed(1)}%` : '—'}</b>
          <span>IoU against the true region</span>
        </div>
        <div className="ridge__compare">
          <div className="ridge__bar" style={{ ['--v' as string]: score }}>
            <span>you</span>
          </div>
          <div className="ridge__bar ridge__bar--model" style={{ ['--v' as string]: 0.86 }}>
            <span>model · 86% held-out</span>
          </div>
        </div>
        <p className="mono ridge__hint">
          {painted ? (score > 0.86 ? 'Better than 86% — on one clean print. The model did it on held-out data.' : 'Paint more carefully along the smudged edge.') : 'Drag to paint the fingerprint region. Right-drag or toggle erase.'}
        </p>
        <div className="controls">
          <label>
            threshold
            <input type="range" min={0.05} max={0.95} step={0.01} value={threshold} onChange={(e) => applyThreshold(Number(e.target.value))} aria-label="Segment automatically from a probability map at this threshold" />
            <span className="tabular">{threshold.toFixed(2)}</span>
          </label>
          <label>
            <input type="checkbox" checked={erase} onChange={(e) => setErase(e.target.checked)} /> erase
          </label>
          <label>
            <input type="checkbox" checked={showTruth} onChange={(e) => setShowTruth(e.target.checked)} /> show truth
          </label>
          <button className="btn btn--ghost" onClick={clear}>
            clear
          </button>
        </div>
      </div>
    </div>
  );
}
