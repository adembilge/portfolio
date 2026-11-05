import { useEffect, useRef } from 'react';
import { subscribe } from '../lib/ticker';
import { useInView, useReducedMotion } from '../lib/hooks';

const SAMPLES = 220;

/** A margin oscilloscope of the visitor's own scroll speed. Newest sample at the top, history drifts down. */
export function ReadingTrace() {
  const ref = useRef<HTMLCanvasElement>(null);
  const visible = useInView(ref);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced || !visible) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const buf = new Float32Array(SAMPLES);
    let lastY = scrollY;
    let velocity = 0;
    let elapsed = 0;
    let w = 0;
    let h = 0;
    let remaining = 0;
    let stop: (() => void) | undefined;

    const wake = () => {
      if (stop || !w || !h) return;
      remaining = 1;
      elapsed = 0;
      stop = subscribe((_, dt) => {
        const dy = scrollY - lastY;
        lastY = scrollY;
        velocity += (dy / Math.max(dt, 1 / 120) - velocity) * 0.25;
        elapsed += dt;
        if (elapsed < 1 / 30) return;
        elapsed %= 1 / 30;
        if (Math.abs(velocity) > 1) remaining = SAMPLES;
        remaining--;
        buf.copyWithin(1, 0);
        buf[0] = remaining ? Math.tanh(velocity / 2200) : 0;
        ctx.clearRect(0, 0, w, h);
        const mid = w / 2;
        ctx.strokeStyle = 'rgba(21,19,15,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mid, 0);
        ctx.lineTo(mid, h);
        ctx.stroke();
        ctx.strokeStyle = '#FF3B12';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(mid + buf[0] * (w / 2 - 4), 0);
        for (let i = 1; i < SAMPLES; i++) {
          ctx.lineTo(mid + buf[i] * (w / 2 - 4), (i / (SAMPLES - 1)) * h);
        }
        ctx.stroke();
        if (!remaining) {
          stop?.();
          stop = undefined;
        }
      });
    };

    const observer = new ResizeObserver(([entry]) => {
      ({ width: w, height: h } = entry.contentRect);
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wake();
    });
    observer.observe(canvas);
    window.addEventListener('scroll', wake, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', wake);
      stop?.();
    };
  }, [reduced, visible]);

  return (
    <div className="trace" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  );
}
