import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from '../lib/hooks';
import { useTicker } from '../lib/ticker';

/** Counts up to `value` once on screen. */
export function CountUp({ value, decimals = 0, duration = 1.4 }: { value: number; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, '0px', true);
  const reduced = useReducedMotion();
  const [v, setV] = useState(reduced ? value : 0);
  const t0 = useRef(0);
  useTicker((t) => {
    if (!t0.current) t0.current = t;
    const k = Math.min(1, (t - t0.current) / duration);
    setV(value * (1 - Math.pow(1 - k, 3)));
    if (k >= 1) t0.current = -1;
  }, seen && !reduced && t0.current !== -1);
  return (
    <span ref={ref} className="tabular">
      {(reduced ? value : v).toFixed(decimals)}
    </span>
  );
}

export const EYEMINER_PER_SEC = 300_000 / 86_400;
const arrived = performance.now();

/** Requests EyeMiner would have taken since the visitor arrived, at the real 300K/day rate. */
export function RequestCounter({ active }: { active: boolean }) {
  const [n, setN] = useState(requestCount);
  useEffect(() => {
    if (!active) return;
    const update = () => setN(requestCount());
    update();
    const id = setInterval(update, 250);
    return () => clearInterval(id);
  }, [active]);
  return (
    <span className="tabular" aria-live="off">
      {n.toLocaleString('en-US')}
    </span>
  );
}

function requestCount() {
  return Math.floor(((performance.now() - arrived) / 1000) * EYEMINER_PER_SEC);
}

const GLYPHS = '░▒▓/\\|—+×#·';

/** Text that resolves out of static, one character at a time. */
export function Resolve({ text, delay = 0, className = '' }: { text: string; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(reduced ? text : '');
  const start = useRef(0);
  const [active, setActive] = useState(!reduced);
  useEffect(() => {
    start.current = 0;
    setActive(!reduced);
    if (reduced) setOut(text);
  }, [text, reduced]);
  useTicker((t) => {
    if (!start.current) start.current = t + delay;
    const k = (t - start.current) / 0.9;
    if (k < 0) return setOut('');
    const n = Math.floor(k * text.length);
    let s = text.slice(0, n);
    for (let i = n; i < Math.min(text.length, n + 6); i++) s += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    setOut(s);
    if (n >= text.length) {
      setOut(text);
      setActive(false);
    }
  }, active);
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{reduced ? text : out || '\u00a0'}</span>
    </span>
  );
}
