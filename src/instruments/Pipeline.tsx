import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from '../lib/hooks';
import { rng } from '../lib/rng';

const STAGES = ['Upload', 'OCR', 'Summarize', 'Classify', 'Embed', 'Completed'] as const;
const TOPICS = [
  { name: 'Machine learning', angle: -20, labelLines: ['Machine', 'learning'] },
  { name: 'Legal', angle: 70 },
  { name: 'Finance', angle: 160 },
  { name: 'Travel', angle: 250 },
];

// Sample documents for the demo; the classifier scores are illustrative.
const DOCS = [
  {
    file: 'scan_lecture_04.pdf',
    kind: 'scanned PDF',
    text: 'Attention lets a model weigh every token against every other token, so context travels further than a fixed window.',
    summary: 'Attention connects distant tokens.',
    topic: 0,
    scores: [0.91, 0.03, 0.02, 0.04],
  },
  {
    file: 'lease_page_2.jpg',
    kind: 'image',
    text: 'The tenant shall give written notice no later than sixty days before the end of the term to terminate this agreement.',
    summary: 'Sixty days’ written notice to terminate.',
    topic: 1,
    scores: [0.04, 0.87, 0.07, 0.02],
  },
  {
    file: 'invoice_march.png',
    kind: 'image',
    text: 'Invoice 0317. Consulting services, March. Amount due within thirty days of issue. Bank transfer only.',
    summary: 'March invoice, due in thirty days.',
    topic: 2,
    scores: [0.05, 0.12, 0.79, 0.04],
  },
  {
    file: 'como_notes.txt',
    kind: 'plain text',
    text: 'Train from Milano Centrale to Varenna, ferry across to Bellagio, last boat back before seven.',
    summary: 'Day trip by train and ferry.',
    topic: 3,
    scores: [0.02, 0.03, 0.06, 0.89],
  },
];

const VAULT = (() => {
  const r = rng(26);
  const names = [
    ['transformer_notes.pdf', 'svm_cheatsheet.png', 'gradient_descent.txt', 'cv_lab_3.pdf', 'rag_eval.md'],
    ['nda_template.pdf', 'gdpr_summary.txt', 'rental_contract.jpg', 'terms_v2.pdf'],
    ['budget_2026.csv', 'receipt_ferry.jpg', 'tax_return.pdf', 'salary_slip.png', 'invoice_feb.png'],
    ['flight_ist_mxp.pdf', 'hotel_booking.png', 'dolomites_plan.txt', 'krakow_trip.md'],
  ];
  return names.flatMap((list, t) =>
    list.map((name) => ({ name, angle: TOPICS[t].angle + (r() - 0.5) * 44, radius: 0.45 + r() * 0.5 })),
  );
})();

const rad = (d: number) => (d * Math.PI) / 180;
const cos = (a: number, b: number) => Math.cos(rad(a - b));

const NOISE = '#%&@$?!/\\|';
function ocrText(text: string, k: number) {
  return text
    .split('')
    .map((ch, i) => (ch === ' ' || (i * 7919) % 100 < k * 100 ? ch : NOISE[(i * 31) % NOISE.length]))
    .join('');
}

export function Pipeline() {
  const reduced = useReducedMotion();
  const [doc, setDoc] = useState<number | null>(null);
  const [stage, setStage] = useState(-1);
  const [ocrK, setOcrK] = useState(0);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    if (doc === null) return;
    if (reduced) {
      setStage(STAGES.length - 1);
      setOcrK(1);
      return;
    }
    setStage(0);
    setOcrK(0);
    let s = 0;
    const id = setInterval(() => {
      s++;
      setStage(Math.min(s, STAGES.length - 1));
      if (s >= STAGES.length - 1) clearInterval(id);
    }, 1100);
    return () => clearInterval(id);
  }, [doc, reduced]);

  useEffect(() => {
    if (stage !== 1 || reduced) return;
    let k = 0;
    const id = setInterval(() => {
      k = Math.min(1, k + 0.08);
      setOcrK(k);
      if (k >= 1) clearInterval(id);
    }, 70);
    return () => clearInterval(id);
  }, [stage, reduced]);

  const d = doc === null ? null : DOCS[doc];
  const docAngle = d ? TOPICS[d.topic].angle + 6 : 0;
  const points = useMemo(() => {
    const base = VAULT.map((v) => ({ ...v, mine: false }));
    if (d && stage >= 4) base.push({ name: d.file, angle: docAngle, radius: 0.8, mine: true });
    return base;
  }, [d, stage, docAngle]);

  const focus = hover ?? (d && stage >= 4 ? d.file : null);
  const focusPt = points.find((p) => p.name === focus);
  const neighbours = focusPt
    ? points
        .filter((p) => p.name !== focusPt.name)
        .map((p) => ({ ...p, sim: cos(p.angle, focusPt.angle) }))
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 3)
    : [];

  const R = 103;
  const P = (a: number, r: number) => ({ x: 150 + Math.cos(rad(a)) * r * R, y: 150 - Math.sin(rad(a)) * r * R });

  return (
    <div className="pipeline">
      <div className="pipeline__left">
        <p className="tag">Drop a document into the vault</p>
        <div className="pipeline__docs">
          {DOCS.map((x, i) => (
            <button key={x.file} className={`docchip ${doc === i ? 'is-on' : ''}`} aria-pressed={doc === i} onClick={() => setDoc(i)}>
              <span className="docchip__fold" aria-hidden="true" />
              <b>{x.file}</b>
              <span>{x.kind}</span>
            </button>
          ))}
        </div>
        <ol className="stages" aria-label="Pipeline stages">
          {STAGES.map((s, i) => (
            <li key={s} className={i < stage ? 'is-done' : i === stage ? 'is-now' : ''} aria-current={i === stage ? 'step' : undefined}>
              {s}
            </li>
          ))}
        </ol>
        <div className="stage-out" aria-live="polite">
          {!d && <p className="muted">Pick a sample document to watch the Celery pipeline work on it.</p>}
          {d && stage >= 0 && (
            <>
              <p className="mono stage-out__k">{stage === 0 ? 'queued for workers…' : 'extracted text'}</p>
              <p className="stage-out__text">{stage >= 1 ? ocrText(d.text, ocrK) : '···'}</p>
            </>
          )}
          {d && stage >= 2 && (
            <p>
              <span className="mono stage-out__k">summary</span> {d.summary}
            </p>
          )}
          {d && stage >= 3 && (
            <div className="scores">
              <span className="mono stage-out__k">zero-shot topics</span>
              {TOPICS.map((t, i) => (
                <div key={t.name} className={`score ${i === d.topic ? 'is-top' : ''}`}>
                  <span>{t.name}</span>
                  <i style={{ transform: `scaleX(${d.scores[i]})` }} />
                  <em className="tabular">{d.scores[i].toFixed(2)}</em>
                </div>
              ))}
            </div>
          )}
          {d && stage >= 4 && (
            <p className="mono stage-out__vec">
              embedding [{Array.from({ length: 6 }, (_, i) => Math.sin(docAngle * 0.07 + i * 1.3).toFixed(2)).join(', ')}, …]
            </p>
          )}
        </div>
      </div>
      <div className="pipeline__map">
        <svg viewBox="0 0 300 300" role="group" aria-label="Embedding map. Focus a document to see its nearest neighbours by cosine similarity.">
          <circle cx="150" cy="150" r={R} className="map__ring" />
          <circle cx="150" cy="150" r={R / 2} className="map__ring" />
          {TOPICS.map((t) => {
            const p = P(t.angle, 1.14);
            return (
              <text key={t.name} x={p.x} y={p.y} className="map__topic" textAnchor="middle">
                {t.labelLines ? t.labelLines.map((line, i) => (
                  <tspan key={line} x={p.x} dy={i === 0 ? '-0.55em' : '1.1em'}>{line}</tspan>
                )) : t.name}
              </text>
            );
          })}
          {focusPt &&
            neighbours.map((n) => {
              const a = P(focusPt.angle, focusPt.radius);
              const b = P(n.angle, n.radius);
              return <line key={n.name} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="map__link" />;
            })}
          {focusPt && (() => {
            const a = P(focusPt.angle, 1);
            return <line x1="150" y1="150" x2={a.x} y2={a.y} className="map__ray" />;
          })()}
          {points.map((p) => {
            const q = P(p.angle, p.radius);
            const on = p.name === focus;
            const near = neighbours.some((n) => n.name === p.name);
            return (
              <g
                key={p.name}
                tabIndex={0}
                role="button"
                aria-label={p.name}
                className={`map__pt ${p.mine ? 'is-mine' : ''} ${on ? 'is-on' : ''} ${near ? 'is-near' : ''}`}
                onMouseEnter={() => setHover(p.name)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p.name)}
                onBlur={() => setHover(null)}
              >
                <circle cx={q.x} cy={q.y} r={p.mine ? 6 : 4} />
              </g>
            );
          })}
        </svg>
        <div className="neighbours" aria-live="polite">
          {focusPt ? (
            <>
              <p className="mono">
                nearest to <b>{focusPt.name}</b>
              </p>
              <ol>
                {neighbours.map((n) => (
                  <li key={n.name}>
                    <span>{n.name}</span> <em className="tabular">cos {n.sim.toFixed(2)}</em>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="muted mono">Hover or tab to a point. Cosine similarity only cares about direction, so neighbours share an angle, not a distance.</p>
          )}
        </div>
        <p className="note">Sample documents · toy 2D embeddings · scores illustrative</p>
      </div>
    </div>
  );
}
