import { useEffect, useMemo, useRef, useState } from 'react';
import { rng } from '../lib/rng';
import { clamp, useCanvasSize, useReducedMotion } from '../lib/hooks';
import { useTicker } from '../lib/ticker';
import { EYEMINER_PER_SEC, RequestCounter } from '../components/Live';

const WORKERS = 400;
const COLS = 20;
const ROWS = 16; // 320 nodes: "300+"
const LANES = 8;

type Req = { lane: number; x: number; node: number };

export function Throughput({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const size = useCanvasSize(ref, 0.56, 520);
  const reduced = useReducedMotion();
  const speed = useMemo(() => {
    const r = rng(600);
    return Array.from({ length: WORKERS }, () => 0.75 + r() * 0.5);
  }, []);
  const s = useRef({ reqs: [] as Req[], heat: new Float32Array(COLS * ROWS), acc: 0, progress: reduced ? 1 : 0 });
  const layout = useRef({ scroll: NaN, viewport: 0, checkedAt: -Infinity, size });
  const background = useMemo(() => document.createElement('canvas'), []);
  const base = useMemo(() => background.getContext('2d')!, [background]);
  const painted = useRef({ progress: NaN, size });
  const [tb, setTb] = useState(0);

  const draw = () => {
    const c = ref.current;
    if (!c || !size.w) return;
    const ctx = c.getContext('2d')!;
    const { w, h, dpr } = size;
    const st = s.current;
    const barY = 26;
    const barH = h * 0.16;
    const top = barY + barH + 36;
    const laneW = w * 0.42;
    const laneGap = (h - top - 20) / LANES;
    const gx = laneW + 24;
    const cell = Math.min((w - gx - 4) / COLS, (h - top - 20) / ROWS);

    const resized = painted.current.size !== size;
    // Labels, lanes and the empty grid only need repainting when the canvas is resized.
    if (resized) {
      background.width = c.width;
      background.height = c.height;
      base.setTransform(dpr, 0, 0, dpr, 0, 0);
      base.fillStyle = '#0d0c0a';
      base.fillRect(0, 0, w, h);
      base.fillStyle = 'rgba(238,233,223,0.75)';
      base.font = '10px "IBM Plex Mono"';
      base.fillText('400 DASK WORKERS × ~1.5 TB EACH', 1, barY - 9);
      base.fillText('KAFKA PARTITIONS', 1, top - 12);
      base.fillText('KUBERNETES · 300+ NODES', laneW + 24, top - 12);
      base.strokeStyle = 'rgba(238,233,223,0.18)';
      for (let lane = 0; lane < LANES; lane++) {
        const y = top + laneGap * (lane + 0.5);
        base.beginPath();
        base.moveTo(0, y);
        base.lineTo(laneW, y);
        base.stroke();
      }
      base.fillStyle = 'rgba(238,233,223,0.2)';
      for (let i = 0; i < COLS * ROWS; i++) {
        const x = gx + (i % COLS) * cell;
        const y = top + Math.floor(i / COLS) * cell;
        base.fillRect(x + 1, y + 1, cell - 3, cell - 3);
      }
    }
    if (resized || painted.current.progress !== st.progress) {
      // Scroll progress only changes the worker strip above the lanes.
      base.fillStyle = '#0d0c0a';
      base.fillRect(0, barY - 1, w, barH + 2);
      const sw = (w - 2) / WORKERS;
      const barWidth = Math.max(0.6, sw - 0.6);
      for (let i = 0; i < WORKERS; i++) {
        const f = clamp(st.progress * speed[i] * 1.12);
        base.fillStyle = 'rgba(238,233,223,0.12)';
        base.fillRect(1 + i * sw, barY, barWidth, barH);
        base.fillStyle = f >= 1 ? '#EEE9DF' : '#FF3B12';
        base.fillRect(1 + i * sw, barY + barH * (1 - f), barWidth, barH * f);
      }
      painted.current = { progress: st.progress, size };
    }

    ctx.drawImage(background, 0, 0, w, h);
    for (let i = 0; i < COLS * ROWS; i++) {
      const heat = st.heat[i];
      if (heat <= 0.02) continue;
      const x = gx + (i % COLS) * cell;
      const y = top + Math.floor(i / COLS) * cell;
      ctx.fillStyle = '#0d0c0a';
      ctx.fillRect(x + 1, y + 1, cell - 3, cell - 3);
      ctx.fillStyle = `rgba(255,59,18,${0.25 + heat * 0.75})`;
      ctx.fillRect(x + 1, y + 1, cell - 3, cell - 3);
    }
    for (const r of st.reqs) {
      const y = top + laneGap * (r.lane + 0.5);
      ctx.fillStyle = '#EEE9DF';
      ctx.fillRect(r.x * laneW - 3, y - 3, 6, 6);
    }
  };

  useTicker((t, dt) => {
    const st = s.current;
    const c = ref.current;
    const last = layout.current;
    const scroll = scrollY;
    const viewport = innerHeight;
    if (c && (scroll !== last.scroll || viewport !== last.viewport || size !== last.size || t - last.checkedAt >= 0.75)) {
      const rect = c.getBoundingClientRect();
      layout.current = { scroll, viewport, checkedAt: t, size };
      st.progress = clamp((viewport - rect.top) / (viewport + rect.height * 0.4));
      const v = Math.round(st.progress * 600);
      if (v !== tb) setTb(v);
    }
    // Requests arrive at the real EyeMiner rate.
    st.acc += dt * EYEMINER_PER_SEC;
    while (st.acc >= 1) {
      st.acc -= 1;
      st.reqs.push({ lane: (Math.random() * LANES) | 0, x: 0, node: (Math.random() * COLS * ROWS) | 0 });
    }
    st.reqs = st.reqs.filter((r) => {
      r.x += dt * 0.9;
      if (r.x >= 1) {
        st.heat[r.node] = 1;
        return false;
      }
      return true;
    });
    const decay = Math.pow(0.35, dt);
    for (let i = 0; i < st.heat.length; i++) st.heat[i] *= decay;
    draw();
  }, visible && !reduced);
  useEffect(() => {
    if (reduced) s.current.progress = 1;
    layout.current.checkedAt = -Infinity;
    draw();
  }, [size, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="throughput">
      <canvas ref={ref} role="img" aria-label="600 terabytes split across 400 Dask workers; requests flow through Kafka partitions to a 320-node grid at the real rate of 300,000 a day." />
      <div className="throughput__row">
        <div className="readout">
          <b className="tabular">{reduced ? 600 : tb} TB</b>
          <span>of 600+ TB processed as you scroll</span>
        </div>
        <div className="readout">
          <b><RequestCounter active={visible} /></b>
          <span>simulated requests since you arrived, using 300K/day (≈{EYEMINER_PER_SEC.toFixed(2)} per second). Each white square is one.</span>
        </div>
      </div>
      <p className="note">Per-worker share is 600 TB ÷ 400 if split evenly · partition and lane counts are illustrative</p>
    </div>
  );
}
