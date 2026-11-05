import { useEffect, useRef } from 'react';

type Tick = (t: number, dt: number) => void;

const subs = new Set<Tick>();
let raf = 0;
let last = 0;

function loop(now: number) {
  const dt = Math.min(64, now - (last || now));
  last = now;
  subs.forEach((fn) => fn(now / 1000, dt / 1000));
  raf = subs.size && !document.hidden ? requestAnimationFrame(loop) : 0;
}

function start() {
  if (!raf && subs.size && !document.hidden) {
    last = 0;
    raf = requestAnimationFrame(loop);
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else start();
  });
}

/** One requestAnimationFrame loop shared by every live element; stops while the tab is hidden. */
export function subscribe(fn: Tick): () => void {
  subs.add(fn);
  start();
  return () => {
    subs.delete(fn);
  };
}

/** Run `fn` every frame while `active`. The latest `fn` is always used. */
export function useTicker(fn: Tick, active: boolean) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return;
    return subscribe((t, dt) => ref.current(t, dt));
  }, [active]);
}
