import { useEffect, useMemo, useRef, useState } from 'react';
import { gauss, rng } from '../lib/rng';
import { useReducedMotion } from '../lib/hooks';

type Pt = { x: number; y: number };

const DATA: Pt[] = (() => {
  const r = rng(2027);
  return Array.from({ length: 120 }, () => {
    const x = r();
    return { x, y: 0.5 + gauss(r) * 0.14 };
  });
})();

function fit(pts: Pt[]) {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const p of pts) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
  }
  const slope = sxy / sxx;
  return { slope, icpt: my - slope * mx, r: sxy / Math.sqrt(sxx * syy), n };
}

const PROMPTS = [
  { id: 'neutral', label: 'Neutral', text: 'Is there a relationship between dose and outcome?', keep: () => true },
  {
    id: 'support',
    label: 'Leading: wants yes',
    text: 'I’m sure the dose improves the outcome. Can you confirm it?',
    keep: (p: Pt) => !((p.x < 0.5 && p.y > 0.54) || (p.x >= 0.5 && p.y < 0.46)),
  },
  {
    id: 'oppose',
    label: 'Leading: wants no',
    text: 'I suspect the dose makes the outcome worse. Show me.',
    keep: (p: Pt) => !((p.x < 0.5 && p.y < 0.46) || (p.x >= 0.5 && p.y > 0.54)),
  },
];

const X = (v: number) => 30 + v * 300;
const Y = (v: number) => 230 - v * 220;

export function LeadingQuestion() {
  const reduced = useReducedMotion();
  const [pi, setPi] = useState(0);
  const prompt = PROMPTS[pi];
  const kept = useMemo(() => DATA.map((p) => prompt.keep(p)), [prompt]);
  const target = useMemo(() => fit(DATA.filter((_, i) => kept[i])), [kept]);
  const [line, setLine] = useState(target);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced) return setLine(target);
    const from = line;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 700);
      const e = 1 - Math.pow(1 - k, 3);
      setLine({ ...target, slope: from.slope + (target.slope - from.slope) * e, icpt: from.icpt + (target.icpt - from.icpt) * e });
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  const dropped = DATA.length - target.n;
  const verdict =
    Math.abs(target.r) < 0.15
      ? 'No clear relationship between dose and outcome.'
      : target.slope > 0
        ? 'The dose improves the outcome.'
        : 'The dose makes the outcome worse.';

  return (
    <div className="leading">
      <div className="leading__prompts" role="radiogroup" aria-label="Prompt given to the data-science agent">
        {PROMPTS.map((p, i) => (
          <button key={p.id} role="radio" aria-checked={i === pi} className={`q ${i === pi ? 'is-on' : ''}`} onClick={() => setPi(i)}>
            <span className="mono">{p.label}</span>
            <br />“{p.text}”
          </button>
        ))}
      </div>
      <div className="leading__plot">
        <svg viewBox="0 0 340 250" role="img" aria-label={`Same 120 rows. The agent used ${target.n} rows and fitted a slope of ${target.slope.toFixed(2)}.`}>
          <line x1="30" y1="230" x2="335" y2="230" className="axis" />
          <line x1="30" y1="5" x2="30" y2="230" className="axis" />
          <text x="335" y="245" textAnchor="end" className="axis-label">dose →</text>
          <text x="34" y="14" className="axis-label">outcome</text>
          {DATA.map((p, i) => (
            <circle key={i} cx={X(p.x)} cy={Y(p.y)} r="3.2" className={kept[i] ? 'pt' : 'pt pt--dropped'} />
          ))}
          <line x1={X(0)} y1={Y(line.icpt)} x2={X(1)} y2={Y(line.icpt + line.slope)} className="fitline" />
        </svg>
      </div>
      <div className="leading__report" aria-live="polite">
        <p className="tag">What the agent reports</p>
        <p className="leading__verdict">{verdict}</p>
        <p className="mono">
          slope {target.slope >= 0 ? '+' : ''}
          {target.slope.toFixed(2)} · r = {target.r.toFixed(2)} · n = {target.n}
        </p>
        <p className={`mono leading__drop ${dropped ? 'is-on' : ''}`}>
          {dropped ? `${dropped} of 120 rows quietly dropped as “outliers”.` : 'All 120 rows used.'}
        </p>
        <p className="note">Illustration of the failure mode the thesis tests: same data, different prompt · not a thesis result</p>
      </div>
    </div>
  );
}
