import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

const RM = '(prefers-reduced-motion: reduce)';
export const fullMotion = new URLSearchParams(window.location.search).get('motion') === 'full';
export const prefersReducedMotion = () => !fullMotion && matchMedia(RM).matches;

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    if (fullMotion) return;
    const mq = matchMedia(RM);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** True while the element is within `margin` of the viewport. With `once`, stays true after the first hit. */
export function useInView(ref: RefObject<Element | null>, margin = '0px', once = false, threshold = 0): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const visible = e.isIntersecting && e.intersectionRatio >= threshold;
        setInView(visible);
        if (visible && once) io.disconnect();
      },
      { rootMargin: margin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, once, threshold]);
  return inView;
}

export type CanvasSize = { w: number; h: number; dpr: number };

/**
 * Keeps a canvas sized to its parent's width at a fixed aspect (h / w), with devicePixelRatio capped at 2.
 * Returns CSS-pixel size; the context is pre-scaled so drawing code uses CSS pixels.
 */
export function useCanvasSize(ref: RefObject<HTMLCanvasElement | null>, aspect: number, maxH = Infinity): CanvasSize {
  const [size, setSize] = useState<CanvasSize>({ w: 0, h: 0, dpr: 1 });
  useLayoutEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ro = new ResizeObserver(() => {
      const w = Math.round(parent.clientWidth);
      const h = Math.round(Math.min(maxH, w * aspect));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      setSize({ w, h, dpr });
    });
    ro.observe(parent);
    return () => ro.disconnect();
  }, [ref, aspect, maxH]);
  return size;
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
