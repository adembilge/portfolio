import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { chapters } from './content/facts';
import { reducedMotion } from './lib/hooks';

type Site = {
  cv: boolean;
  setCv: (v: boolean) => void;
  sheet: boolean;
  setSheet: (v: boolean) => void;
};

const Ctx = createContext<Site | null>(null);
export const useSite = () => useContext(Ctx)!;

let smoother: Lenis | undefined;

export function go(hash: string, historyMode: 'replace' | 'push' = 'replace') {
  const el = document.getElementById(hash.replace(/^#/, ''));
  if (!el) return;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
  if (smoother) smoother.scrollTo(el);
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  if (location.hash === `#${el.id}`) return;
  if (historyMode === 'push') history.pushState(null, '', `#${el.id}`);
  else history.replaceState(null, '', `#${el.id}`);
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [cv, setCv] = useState(false);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    if (cv || reducedMotion) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.075, allowNestedScroll: true, respectReducedMotion: false });
    smoother = lenis;
    return () => {
      smoother = undefined;
      lenis.destroy();
    };
  }, [cv]);

  useEffect(() => {
    // Font metrics can move a chapter after the browser's initial anchor jump.
    const initialHash = location.hash;
    const intent = new AbortController();
    let cancelled = false;
    let frame = 0;
    const cancelJump = () => { cancelled = true; };
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
      window.addEventListener(event, cancelJump, { once: true, passive: true, signal: intent.signal });
    }
    void document.fonts.ready.then(() => {
      intent.abort();
      if (cancelled || location.hash !== initialHash) return;
      frame = requestAnimationFrame(() => {
        document.getElementById(initialHash.slice(1))?.scrollIntoView({ block: 'start' });
      });
    });
    const onLink = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const link = (e.target as Element).closest<HTMLAnchorElement>('main a[href^="#"], a.skip');
      if (!link || !document.getElementById(link.hash.slice(1))) return;
      e.preventDefault();
      go(link.hash, 'push');
    };
    document.addEventListener('click', onLink);
    return () => {
      cancelled = true;
      intent.abort();
      cancelAnimationFrame(frame);
      document.removeEventListener('click', onLink);
    };
  }, []);

  // Keyboard: 0 cover, 1–6 chapters, J/K next/previous entry, C cv.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable], [data-keys]')) return;
      const k = e.key.toLowerCase();
      if (k === 'c') return setCv(!cv);
      if (cv || sheet) return;
      if (k === '0') return go('cover');
      const n = Number(k);
      if (n >= 1 && n <= 6) return go(chapters[n - 1].anchor);
      if (k === 'j' || k === 'k') {
        const stops = Array.from(document.querySelectorAll<HTMLElement>('[data-stop]'));
        const y = 80;
        const i = stops.findIndex((s) => s.getBoundingClientRect().top > y + 2);
        const cur = i === -1 ? stops.length : i;
        const next = k === 'j' ? stops[cur] : stops[Math.max(0, cur - 2)];
        if (next) go(next.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cv, sheet]);

  return <Ctx.Provider value={{ cv, setCv, sheet, setSheet }}>{children}</Ctx.Provider>;
}
