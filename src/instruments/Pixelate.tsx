import { useEffect, useMemo, useRef, useState } from 'react';
import { useCanvasSize, useReducedMotion } from '../lib/hooks';
import { useTicker } from '../lib/ticker';

const W = 240;
const H = 300;
type V = { x: number; y: number };

// Hand-authored signing loop: wrist keyframes for each hand and how open the hand is.
const RIGHT: V[] = [{ x: 96, y: 160 }, { x: 118, y: 122 }, { x: 84, y: 96 }, { x: 108, y: 168 }];
const LEFT: V[] = [{ x: 150, y: 204 }, { x: 140, y: 140 }, { x: 166, y: 112 }, { x: 132, y: 178 }];
const SPREAD = [0.2, 0.95, 0.5, 1];
const LOOP = 3.6;

const SH_R = { x: 86, y: 116 };
const SH_L = { x: 154, y: 116 };

function sample(keys: V[], t: number): V {
  const n = keys.length;
  const f = ((t / LOOP) % 1) * n;
  const i = Math.floor(f);
  const k = (1 - Math.cos((f - i) * Math.PI)) / 2;
  const a = keys[i];
  const b = keys[(i + 1) % n];
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}
function sampleN(keys: number[], t: number) {
  const n = keys.length;
  const f = ((t / LOOP) % 1) * n;
  const i = Math.floor(f);
  const k = (1 - Math.cos((f - i) * Math.PI)) / 2;
  return keys[i] + (keys[(i + 1) % n] - keys[i]) * k;
}

/** Two-bone IK: elbow position for a shoulder→wrist reach. */
function elbow(s: V, w: V, side: 1 | -1): V {
  const a = 54;
  const b = 50;
  const dx = w.x - s.x;
  const dy = w.y - s.y;
  const d = Math.min(a + b - 1, Math.hypot(dx, dy));
  const base = Math.atan2(dy, dx);
  const off = Math.acos((a * a + d * d - b * b) / (2 * a * d));
  const ang = base + off * side;
  return { x: s.x + Math.cos(ang) * a, y: s.y + Math.sin(ang) * a };
}

function pose(t: number) {
  const wr = sample(RIGHT, t);
  const wl = sample(LEFT, t + 0.3);
  return { wr, wl, er: elbow(SH_R, wr, 1), el: elbow(SH_L, wl, -1), spread: sampleN(SPREAD, t) };
}

function drawHand(g: CanvasRenderingContext2D, e: V, w: V, spread: number) {
  const dir = Math.atan2(w.y - e.y, w.x - e.x);
  g.fillStyle = '#FF3B12';
  g.beginPath();
  g.ellipse(w.x + Math.cos(dir) * 7, w.y + Math.sin(dir) * 7, 9, 7, dir, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#FF3B12';
  g.lineCap = 'round';
  g.lineWidth = 3.4;
  for (let f = 0; f < 4; f++) {
    const a = dir + (f - 1.5) * 0.28 * spread;
    const len = 13 + (f === 1 || f === 2 ? 3 : 0);
    const bx = w.x + Math.cos(dir) * 12;
    const by = w.y + Math.sin(dir) * 12;
    g.beginPath();
    g.moveTo(bx, by);
    g.lineTo(bx + Math.cos(a) * len, by + Math.sin(a) * len);
    g.stroke();
  }
  const ta = dir - 1.1 - spread * 0.4;
  g.beginPath();
  g.moveTo(w.x + Math.cos(dir) * 4, w.y + Math.sin(dir) * 4);
  g.lineTo(w.x + Math.cos(ta) * 13, w.y + Math.sin(ta) * 13);
  g.stroke();
}

function drawSigner(g: CanvasRenderingContext2D, t: number) {
  const p = pose(t);
  g.fillStyle = '#e5dfd2';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#15130F';
  g.beginPath();
  g.moveTo(70, 300);
  g.bezierCurveTo(66, 200, 72, 120, 120, 112);
  g.bezierCurveTo(168, 120, 174, 200, 170, 300);
  g.fill();
  g.beginPath();
  g.arc(120, 70, 26, 0, Math.PI * 2);
  g.fill();
  g.fillRect(112, 88, 16, 26);
  g.strokeStyle = '#2a2722';
  g.lineCap = 'round';
  for (const [s, e, w] of [[SH_R, p.er, p.wr], [SH_L, p.el, p.wl]] as V[][]) {
    g.lineWidth = 17;
    g.beginPath();
    g.moveTo(s.x, s.y);
    g.lineTo(e.x, e.y);
    g.stroke();
    g.lineWidth = 13;
    g.beginPath();
    g.moveTo(e.x, e.y);
    g.lineTo(w.x, w.y);
    g.stroke();
  }
  drawHand(g, p.er, p.wr, p.spread);
  drawHand(g, p.el, p.wl, 1.2 - p.spread);
  return p;
}

export function Pixelate({ visible, accuracy, baseline }: { visible: boolean; accuracy: number; baseline: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const size = useCanvasSize(ref, H / W, 520);
  const reduced = useReducedMotion();
  const [res, setRes] = useState(16);
  const [posed, setPosed] = useState(false);
  const bufs = useMemo(() => {
    const full = document.createElement('canvas');
    full.width = W;
    full.height = H;
    const small = document.createElement('canvas');
    return { full, small };
  }, []);
  const tRef = useRef(1.1);

  const draw = (t: number) => {
    const c = ref.current;
    if (!c || !size.w) return;
    const g = bufs.full.getContext('2d')!;
    const p = drawSigner(g, t);
    const sw = res;
    const sh = Math.round(res * (H / W));
    if (bufs.small.width !== sw || bufs.small.height !== sh) {
      bufs.small.width = sw;
      bufs.small.height = sh;
    }
    const s = bufs.small.getContext('2d')!;
    s.imageSmoothingEnabled = true;
    s.imageSmoothingQuality = 'high';
    s.drawImage(bufs.full, 0, 0, sw, sh);
    const ctx = c.getContext('2d')!;
    const k = size.w / W;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bufs.small, 0, 0, size.w, size.h);
    if (posed) {
      // Pose-conditioned: detail is restored where the keypoints say the signal is.
      for (const j of [p.wr, p.wl]) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(j.x * k, j.y * k, 30 * k, 0, Math.PI * 2);
        ctx.clip();
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(bufs.full, 0, 0, size.w, size.h);
        ctx.restore();
      }
      const bones: [V, V][] = [[SH_R, SH_L], [SH_R, p.er], [p.er, p.wr], [SH_L, p.el], [p.el, p.wl], [{ x: 120, y: 70 }, { x: 120, y: 114 }]];
      ctx.strokeStyle = 'rgba(238,233,223,0.9)';
      ctx.lineWidth = 1.5;
      bones.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(a.x * k, a.y * k);
        ctx.lineTo(b.x * k, b.y * k);
        ctx.stroke();
      });
      [SH_R, SH_L, p.er, p.el, p.wr, p.wl, { x: 120, y: 70 }].forEach((j, i) => {
        ctx.beginPath();
        ctx.arc(j.x * k, j.y * k, 4, 0, Math.PI * 2);
        ctx.fillStyle = i >= 4 ? '#FF3B12' : '#EEE9DF';
        ctx.fill();
        ctx.strokeStyle = '#15130F';
        ctx.stroke();
      });
    }
  };

  useTicker((t) => {
    tRef.current = t;
    draw(t);
  }, visible && !reduced);
  useEffect(() => draw(tRef.current), [size, res, posed]); // eslint-disable-line react-hooks/exhaustive-deps

  const sh = Math.round(res * (H / W));
  return (
    <div className="pixelate">
      <div className="pixelate__canvas">
        <canvas ref={ref} role="img" aria-label={`A generated signer, rendered at ${res} by ${sh} pixels${posed ? ' with the pose skeleton and sharpened hands' : ''}.`} />
      </div>
      <div className="pixelate__panel">
        <div className="readout" aria-live="polite">
          <b className="tabular">
            {res}×{sh}
          </b>
          <span>
            {(res * sh).toLocaleString('en-US')} pixels carry the whole sign{res <= 20 ? ': about what a privacy-safe or low-bandwidth feed leaves you.' : '.'}
          </span>
        </div>
        <div className="controls">
          <label>
            resolution
            <input type="range" min={8} max={240} step={1} value={res} onChange={(e) => setRes(Number(e.target.value))} aria-label="Video resolution in pixels wide" />
          </label>
          <label>
            <input type="checkbox" checked={posed} onChange={(e) => setPosed(e.target.checked)} /> pose-conditioned
          </label>
        </div>
        <div className="acc">
          <div className="acc__row">
            <span className="mono">baseline</span>
            <i style={{ width: `${baseline}%` }} />
            <em className="tabular">{baseline}%</em>
          </div>
          <div className="acc__row acc__row--tiny">
            <span className="mono">Tinysign</span>
            <i style={{ width: `${accuracy}%` }} />
            <em className="tabular">{accuracy}%</em>
          </div>
        </div>
      </div>
    </div>
  );
}
