import { useEffect, useRef } from 'react';
import { chapters } from '../content/facts';
import { go, useSite } from '../site';
import { Resolve } from './Live';

export function ContactSheet() {
  const { sheet, setSheet, setCv } = useSite();
  const dlg = useRef<HTMLDialogElement>(null);
  const pendingChapter = useRef<string | null>(null);

  useEffect(() => {
    const dialog = dlg.current;
    if (!dialog) return;
    if (sheet) {
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
    if (!pendingChapter.current) return;
    const frame = requestAnimationFrame(() => {
      const chapter = pendingChapter.current;
      pendingChapter.current = null;
      if (chapter) go(chapter);
    });
    return () => cancelAnimationFrame(frame);
  }, [sheet]);

  const open = (chapter: string) => {
    pendingChapter.current = chapter;
    setCv(false);
    setSheet(false);
  };

  return (
    <dialog ref={dlg} className="sheet" data-lenis-prevent aria-labelledby="sheet-h" onClose={() => setSheet(false)} onClick={(e) => e.target === dlg.current && setSheet(false)}>
      <div className="sheet__inner">
        <header className="sheet__head">
          <h2 id="sheet-h"><Resolve text="Contact sheet" onView /></h2>
          <button className="btn btn--ghost" onClick={() => setSheet(false)}>
            close <kbd>Esc</kbd>
          </button>
        </header>
        <div className="sheet__grid">
          {chapters.map((chapter, i) => (
            <button key={chapter.id} className="frame" onClick={() => open(chapter.anchor)}>
              <span className="frame__no mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}A</span>
              <span className="frame__pic" aria-hidden="true">
                <span className="frame__roman">{chapter.id}</span>
              </span>
              <span className="frame__cap">
                <b>Chapter {chapter.id} · {chapter.title}</b>
                <span className="mono">{chapter.subject}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}
