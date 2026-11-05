import { useRef } from 'react';
import { about, headline, languages, person } from '../content/facts';
import { RidgeName } from '../components/RidgeName';
import { Chapter } from '../components/Shells';
import { CountUp, Resolve } from '../components/Live';
import { MilanClock } from '../components/MilanClock';
import { useInView, useReducedMotion } from '../lib/hooks';
import { projectRoute, totalKm } from '../lib/geo';
import { go, useSite } from '../site';

export function Cover() {
  const { role } = person;
  const { setCv } = useSite();

  return (
    <section id="cover" className="cover" aria-labelledby="cover-name" data-stop>
      <h1 id="cover-name" className="sr-only">
        {person.name} — {role}
      </h1>
      <div className="cover__art"><RidgeName /></div>
      <p className="cover__kicker tag">Weak Signals · an interactive field guide · six chapters, eight figures</p>
      <div className="cover__side">
        <img className="cover__portrait" src={`${import.meta.env.BASE_URL}adem-bilge-portrait.jpg`} alt={`Portrait of ${person.short}`} width={1254} height={1254} decoding="async" />
        <div className="cover__foot">
          <p className="cover__role" aria-hidden="true"><Resolve text={role} /></p>
          <p className="cover__where">{person.based} · {person.studying}</p>
          <p className="cover__tagline">{person.coverIntro}</p>
          <div className="cover__actions">
            <button className="cover__cue mono" onClick={() => go('author')}>scroll to resolve ↓</button>
            <button className="chip" onClick={() => { setCv(true); window.scrollTo(0, 0); }}>Read as CV</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BarFigure({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, '0px', true);
  return (
    <div ref={ref} className={`hf-bar ${on ? 'is-on' : ''}`} aria-hidden="true">
      {Array.from({ length: 3 }, (_, row) => (
        <div className="hf-bar__row" key={row}>
          {Array.from({ length: value / 100 }, (_, column) => (
            <span key={column} style={{ transitionDelay: `${row * 150 + column * 65}ms` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function NodesFigure() {
  const ref = useRef<SVGSVGElement>(null);
  const on = useInView(ref);
  const cols = 30;
  const rows = 10;
  return (
    <svg ref={ref} className={`hf-nodes ${on ? 'is-on' : ''}`} viewBox={`0 0 ${cols * 10} ${rows * 10}`} aria-hidden="true">
      {Array.from({ length: cols * rows }, (_, i) => (
        <rect
          key={i}
          x={(i % cols) * 10 + 2}
          y={Math.floor(i / cols) * 10 + 2}
          width="6"
          height="6"
          style={i % 17 === 0 ? { animationDelay: `${-((i * 7919) % 300) / 100}s` } : undefined}
        />
      ))}
    </svg>
  );
}

const fingerprintRidges = [
  'M10 55C10 27 28 9 49 9s39 17 41 42',
  'M15 72c2-7 2-14 2-21 0-22 14-35 32-35 21 0 34 17 34 40 0 14 0 25-4 36',
  'M21 83c4-9 4-20 4-29 0-18 10-31 25-31 16 0 26 13 26 32 0 20-2 33-7 46',
  'M28 92c5-12 5-25 5-37 0-15 7-25 17-25 12 0 19 10 19 25 0 22-3 38-10 51',
  'M35 99c5-12 6-30 6-44 0-12 3-18 9-18 7 0 12 7 12 18 0 22-4 39-12 53',
  'M42 104c6-15 7-35 7-49 0-7 1-11 4-11 3 0 4 5 4 11',
  'M56 63c-1 12-2 23-6 32',
  'M90 59c0 9-1 16-3 23',
];

function FingerprintFigure() {
  const ref = useRef<SVGSVGElement>(null);
  const on = useInView(ref, '0px', true);
  return (
    <svg ref={ref} className={`hf-fingerprint ${on ? 'is-on' : ''}`} viewBox="0 0 100 114" aria-hidden="true">
      {fingerprintRidges.map((path, index) => (
        <path key={path} d={path} pathLength="1" style={{ animationDelay: `${index * 85}ms` }} />
      ))}
    </svg>
  );
}

function RouteSketch() {
  const reduced = useReducedMotion();
  const pts = projectRoute(220, 110, 14);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 220 110" className="route-sketch" aria-hidden="true">
      <path d={d} className="route-sketch__path" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" className="route-sketch__stop" />
      ))}
      {pts.filter((p, i) => pts.findIndex((q) => q.city === p.city) === i).map((p) => (
        <text key={p.city} x={p.x + 5} y={p.y - 5}>{p.city}</text>
      ))}
      <circle r="3.5" className="route-sketch__dot" cx={reduced ? pts[pts.length - 1].x : undefined} cy={reduced ? pts[pts.length - 1].y : undefined}>
        {!reduced && <animateMotion dur="9s" repeatCount="indefinite" path={d} keyPoints="0;1;1" keyTimes="0;0.85;1" calcMode="linear" />}
      </circle>
    </svg>
  );
}

export function Author() {
  return (
    <Chapter id="author" numeral="I" title="The Author" subject="About" intro={person.interest}>
      <div className="author" data-signal>
        <p className="author__statement">{person.statement}</p>
        <div className="author__text">
          {about.map((p, i) => (
            <p key={i} className={i === 0 ? 'dropcap' : ''}>
              {p}
            </p>
          ))}
          <p className="author__focus mono">{person.focus}</p>
        </div>
        <aside className="author__notes" aria-label="Field notes">
          <p className="tag">Field notes</p>
          <div className="note-block">
            <MilanClock />
          </div>
          <div className="note-block">
            <p className="mono note-head">Works in</p>
            <ul className="lang-mini">
              {languages.map((l) => (
                <li key={l.name}>
                  <span style={{ fontWeight: 300 + l.weight * 600, opacity: 0.45 + l.weight * 0.55 }}>{l.name}</span>
                  <i style={{ transform: `scaleX(${l.weight})` }} />
                  <span className="mono">{l.level.split(' ·')[0]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="note-block">
            <p className="mono note-head">
              Route so far · {Math.round(totalKm).toLocaleString('en-US')} km
            </p>
            <RouteSketch />
          </div>
        </aside>
      </div>
      <div className="headline" data-signal>
        {headline.map((h) => (
          <div key={h.label} className="headline__item">
            <p className="headline__value">
              <CountUp value={h.value} />
              <span>{h.suffix}</span>
            </p>
            {h.kind === 'bar' && <BarFigure value={h.value} />}
            {h.kind === 'nodes' && <NodesFigure />}
            {h.kind === 'overlap' && <FingerprintFigure />}
            <p className="headline__label mono">{h.label}</p>
          </div>
        ))}
      </div>
    </Chapter>
  );
}
