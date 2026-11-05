import { Suspense, useRef, type ReactNode } from 'react';
import { competencies, figureById, type ChapterId, type FigureId } from '../content/facts';
import { useInView } from '../lib/hooks';

export function Chapter({
  id,
  numeral,
  title,
  subject,
  intro,
  dark = false,
  children,
}: {
  id: string;
  numeral: ChapterId;
  title: string;
  subject: string;
  intro?: string;
  dark?: boolean;
  children: ReactNode;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const seen = useInView(heading, '0px', true, 0.25);
  return (
    <section id={id} className={`chapter ${dark ? 'chapter--dark' : ''}`} aria-labelledby={`${id}-title`} data-stop>
      <header className={`chapter__head${seen ? ' chapter__head--seen' : ''}`} data-signal>
        <span className="chapter__numeral" aria-hidden="true">{numeral}</span>
        <p className="tag">Chapter {numeral} — {subject}</p>
        <h2 ref={heading} id={`${id}-title`} className="chapter__title">{title}</h2>
        {intro && <p className="chapter__intro">{intro}</p>}
      </header>
      {children}
    </section>
  );
}

export function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="disclosure">
      <summary>{label}</summary>
      <div className="disclosure__body">{children}</div>
    </details>
  );
}

/** Mounts its children only once they come near the viewport, then tells them whether they are visible. */
export function Figure({
  id,
  dark = false,
  caption,
  children,
  className = '',
}: {
  id: FigureId;
  dark?: boolean;
  caption?: ReactNode;
  children: (visible: boolean) => ReactNode;
  className?: string;
}) {
  const f = figureById[id];
  const ref = useRef<HTMLElement>(null);
  const near = useInView(ref, '400px 0px', true);
  const visible = useInView(ref, '0px');
  return (
    <figure ref={ref} id={`fig-${id}`} className={`figure ${dark ? 'figure--dark' : ''} ${className}`} data-signal data-stop aria-labelledby={`fig-${id}-title`}>
      <header className="figure__tag">
        <span className="figure__num">Fig. {id}</span>
        <h3 id={`fig-${id}-title`} className="figure__title">{f.title}</h3>
        <span className="figure__src">{f.source}</span>
      </header>
      <p className="figure__signal">
        <span className="mono">weak signal:</span> {f.signal}
      </p>
      <div className="figure__stage">
        <Suspense fallback={<div className="figure__placeholder" />}>
          {near ? children(visible) : <div className="figure__placeholder" />}
        </Suspense>
      </div>
      {caption && <figcaption className="figure__caption">{caption}</figcaption>}
    </figure>
  );
}

export function Stack({ items }: { items: string[] }) {
  return (
    <ul className="stack" aria-label="Technologies">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

export function Ext({ href, children, className = 'link' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function FigLink({ id }: { id: string }) {
  if (/^\d\d$/.test(id)) {
    return (
      <a className="figlink" href={`#fig-${id}`} aria-label={`Figure ${id}, ${figureById[id as FigureId].title}`}>
        {id}
      </a>
    );
  }
  if (id.startsWith('§')) {
    const comp = competencies.findIndex((c) => c.id === id.slice(1));
    return (
      <a className="figlink figlink--sec" href={`#comp-${id.slice(1)}`} aria-label={`Listed in competency ${competencies[comp].name}`}>
        §{comp + 1}
      </a>
    );
  }
  return (
    <a className="figlink figlink--sec" href={`#${id}`} aria-label="Certification">
      cert
    </a>
  );
}
