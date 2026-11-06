import { useEffect, useMemo, useRef, useState } from 'react';
import { avgPathLength, isolate, type Cut, type Pt } from '../lib/iforest';
import { gauss, rng } from '../lib/rng';
import { useCanvasSize, useReducedMotion } from '../lib/hooks';
import { useTicker } from '../lib/ticker';

/** Expected path length of an unsuccessful BST search; normalises isolation depth (Liu et al.). */
const cN = (n: number) => 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;

function makeTraffic(): { pts: Pt[]; odd: number[] } {
  const r = rng(2020);
  const pts: Pt[] = [];
  for (let i = 0; i < 74; i++) pts.push({ x: 0.3 + gauss(r) * 0.07, y: 0.32 + gauss(r) * 0.07 });
  for (let i = 0; i < 52; i++) pts.push({ x: 0.6 + gauss(r) * 0.06, y: 0.58 + gauss(r) * 0.055 });
  const odd = [
    { x: 0.92, y: 0.12 },
    { x: 0.1, y: 0.88 },
    { x: 0.86, y: 0.9 },
    { x: 0.47, y: 0.94 },
    { x: 0.95, y: 0.5 },
    { x: 0.06, y: 0.3 },
  ];
  const start = pts.length;
  pts.push(...odd);
  return { pts, odd: odd.map((_, i) => start + i) };
}

export function IsolationForest({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const size = useCanvasSize(ref, 0.72, 460);
  const reduced = useReducedMotion();
  const { pts, odd } = useMemo(makeTraffic, []);
  const order = useMemo(() => pts.map((_, i) => i).sort((a, b) => pts[a].x - pts[b].x), [pts]);
  const normals = useMemo(() => order.filter((i) => !odd.includes(i)), [order, odd]);
  const [sel, setSel] = useState(odd[0]);
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [shown, setShown] = useState(0);
  const seed = useRef(1);
  const anim = useRef({ acc: 0, t: 0 });

  const stats = useMemo(() => {
    const avg = avgPathLength(pts, sel, 160, rng(99 + sel));
    return { avg, score: Math.pow(2, -avg / cN(pts.length)) };
  }, [pts, sel]);
  const normalAvg = useMemo(() => avgPathLength(pts, normals[Math.floor(normals.length * 0.3)], 160, rng(5)), [pts, normals]);

  const run = (i = sel) => {
    const c = isolate(pts, i, rng(seed.current++ * 7919));
    setCuts(c);
    setShown(reduced ? c.length : 0);
    anim.current.acc = 0;
  };
  useEffect(() => run(odd[0]), []); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (i: number) => {
    setSel(i);
    run(i);
  };

  const draw = (t: number) => {
    const c = ref.current;
    if (!c || !size.w) return;
    const ctx = c.getContext('2d')!;
    const { w, h } = size;
    const pad = 28;
    const X = (v: number) => pad + v * (w - pad * 1.5);
    const Y = (v: number) => h - pad - v * (h - pad * 1.6);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(21,19,15,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, 8);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - 6, h - pad);
    ctx.stroke();
    ctx.fillStyle = 'rgba(21,19,15,0.7)';
    ctx.font = '10px "IBM Plex Mono"';
    ctx.fillText('packet count →', w - 100, h - 10);
    ctx.save();
    ctx.translate(12, 96);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('byte rate →', 0, 0);
    ctx.restore();

    const vis = cuts.slice(0, shown);
    if (vis.length && shown === cuts.length) {
      const last = vis[vis.length - 1];
      let { x0, x1, y0, y1 } = last.box;
      const tp = pts[sel];
      if (last.axis === 'x') tp.x < last.value ? (x1 = last.value) : (x0 = last.value);
      else tp.y < last.value ? (y1 = last.value) : (y0 = last.value);
      ctx.fillStyle = 'rgba(255,59,18,0.16)';
      ctx.fillRect(X(x0), Y(y1), X(x1) - X(x0), Y(y0) - Y(y1));
    }
    vis.forEach((cut, i) => {
      const fresh = i === vis.length - 1 && shown < cuts.length + 1;
      ctx.strokeStyle = fresh ? '#FF3B12' : 'rgba(21,19,15,0.6)';
      ctx.lineWidth = fresh ? 1.6 : 1;
      ctx.setLineDash(fresh ? [] : [4, 3]);
      ctx.beginPath();
      if (cut.axis === 'x') {
        ctx.moveTo(X(cut.value), Y(cut.box.y0));
        ctx.lineTo(X(cut.value), Y(cut.box.y1));
      } else {
        ctx.moveTo(X(cut.box.x0), Y(cut.value));
        ctx.lineTo(X(cut.box.x1), Y(cut.value));
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
    pts.forEach((p, i) => {
      const breathe = reduced ? 0 : Math.sin(t * 1.6 + i * 1.7) * 0.5;
      ctx.beginPath();
      ctx.arc(X(p.x), Y(p.y), 2.6 + breathe, 0, Math.PI * 2);
      ctx.fillStyle = '#15130F';
      ctx.fill();
    });
    const s = pts[sel];
    ctx.strokeStyle = '#FF3B12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(X(s.x), Y(s.y), 8 + (reduced ? 0 : Math.sin(t * 3) * 1.2), 0, Math.PI * 2);
    ctx.stroke();
  };

  useTicker((t, dt) => {
    anim.current.t = t;
    if (shown < cuts.length) {
      anim.current.acc += dt;
      if (anim.current.acc > 0.42) {
        anim.current.acc = 0;
        setShown((n) => n + 1);
      }
    }
    draw(t);
  }, visible && !reduced);
  useEffect(() => draw(anim.current.t), [size, cuts, shown, sel]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pad = 28;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = 0;
    let bd = Infinity;
    pts.forEach((p, i) => {
      const d = Math.hypot(pad + p.x * (size.w - pad * 1.5) - mx, size.h - pad - p.y * (size.h - pad * 1.6) - my);
      if (d < bd) (bd = d), (best = i);
    });
    if (bd < 30) pick(best);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const k = order.indexOf(sel);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') pick(order[(k + 1) % order.length]);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') pick(order[(k - 1 + order.length) % order.length]);
    else if (e.key === 'Enter' || e.key === ' ') run();
    else return;
    e.preventDefault();
  };

  const done = shown >= cuts.length;
  const isOdd = odd.includes(sel);
  return (
    <div className="iforest">
      <div className="iforest__plot">
        <canvas
          ref={ref}
          tabIndex={0}
          data-keys
          role="application"
          aria-label="Synthetic network traffic scatter plot. Arrow keys choose a point, Enter isolates it again."
          onClick={onClick}
          onKeyDown={onKey}
        />
      </div>
      <div className="iforest__panel">
        <div className="readout" aria-live="polite">
          <span>{done ? 'Isolated in' : 'Cutting…'}</span>
          <b className="tabular">
            {done ? cuts.length : shown} {cuts.length === 1 && done ? 'cut' : 'cuts'}
          </b>
          <span>
            {isOdd ? 'This one does not belong.' : 'A normal flow: it hides in the crowd.'} Average over 160 random trees:{' '}
            <strong className="tabular">{stats.avg.toFixed(1)}</strong> cuts (a typical normal point needs {normalAvg.toFixed(1)}). Anomaly score{' '}
            <strong className="tabular">{stats.score.toFixed(2)}</strong>
            {stats.score > 0.6 ? ' — flag it.' : ' — leave it.'}
          </span>
        </div>
        <div className="controls">
          <button className="btn" onClick={() => pick(odd[(odd.indexOf(sel) + 1) % odd.length])}>
            odd one
          </button>
          <button className="btn btn--ghost" onClick={() => pick(normals[Math.floor(Math.random() * normals.length)])}>
            normal one
          </button>
          <button className="btn btn--ghost" onClick={() => run()}>
            new random tree
          </button>
        </div>
        <p className="note">Click a point or use arrow keys</p>
      </div>
    </div>
  );
}
