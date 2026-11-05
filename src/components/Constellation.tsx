import { useLayoutEffect, useRef, useState } from 'react';
import { courseLinks, education, figures } from '../content/facts';

const courses = Array.from(
  education
    .flatMap((e) => e.coursework.map((c) => ({ c, school: e.id === 'polimi' ? 'PoliMi' : e.id === 'hacettepe' ? 'Hacettepe' : 'Erasmus' })))
    .reduce((m, { c, school }) => m.set(c, [...(m.get(c) ?? []), school]), new Map<string, string[]>()),
);

type Line = { x1: number; y1: number; x2: number; y2: number };

/** Courses on the left, figures on the right; focusing a course draws where it shows up later. */
export function Constellation() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const links = active ? courseLinks[active] ?? [] : [];

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !active) return setLines([]);
    const base = el.getBoundingClientRect();
    const from = el.querySelector<HTMLElement>(`[data-course="${CSS.escape(active)}"]`)!.getBoundingClientRect();
    setLines(
      links.map((id) => {
        const to = el.querySelector<HTMLElement>(`[data-fig="${id}"]`)!.getBoundingClientRect();
        return { x1: from.right - base.left, y1: from.top + from.height / 2 - base.top, x2: to.left - base.left, y2: to.top + to.height / 2 - base.top };
      }),
    );
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={root} className="constellation" data-signal onMouseLeave={() => setActive(null)}>
      <svg className="constellation__lines" aria-hidden="true">
        {lines.map((l, i) => (
          <path key={i} d={`M${l.x1},${l.y1} C${(l.x1 + l.x2) / 2},${l.y1} ${(l.x1 + l.x2) / 2},${l.y2} ${l.x2},${l.y2}`} />
        ))}
      </svg>
      <div className="constellation__col">
        <p className="tag">Coursework</p>
        <ul>
          {courses.map(([c, schools]) => (
            <li key={c}>
              <button
                data-course={c}
                className={active === c ? 'is-on' : ''}
                onMouseEnter={() => setActive(c)}
                onFocus={() => setActive(c)}
                onBlur={() => setActive(null)}
                aria-describedby={`cl-${c.replace(/\W/g, '')}`}
              >
                {c}
                <span className="mono">{schools.join(' · ')}</span>
              </button>
              <span id={`cl-${c.replace(/\W/g, '')}`} className="sr-only">
                Shows up later in figure {(courseLinks[c] ?? []).join(' and ')}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="constellation__col constellation__col--figs">
        <p className="tag">…shows up later in</p>
        <ul>
          {figures.map((f) => (
            <li key={f.id}>
              <a href={`#fig-${f.id}`} data-fig={f.id} className={links.includes(f.id) ? 'is-on' : ''}>
                <span className="figure__num">{f.id}</span> {f.title}
                <span className="mono">{f.source}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
