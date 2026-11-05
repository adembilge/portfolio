import { useMemo, useState } from 'react';
import { education, fmtMonth, monthIndex, roles, type Month } from '../content/facts';
import { go } from '../site';

const START = monthIndex('2017-01');
const END = monthIndex('2027-12');
const SPAN = END - START + 1;

type Bar = { id: string; label: string; sub: string; lane: 0 | 1 | 2; start: Month; end: Month };

const bars: Bar[] = [
  ...education.map((e) => ({
    id: e.id,
    label: e.id === 'czestochowa' ? 'Erasmus+' : e.name.split(' ')[0],
    sub: e.degree,
    lane: (e.id === 'czestochowa' ? 1 : 0) as 0 | 1,
    start: e.start,
    end: e.end,
  })),
  ...roles.map((r): Bar => ({
    id: r.id,
    label: r.company.split(' ')[0],
    sub: r.title,
    lane: 2,
    start: r.start,
    end: r.end,
  })),
];

const LANES = ['Study', 'Abroad', 'Work'];

function barBounds(bar: Bar) {
  const start = monthIndex(bar.start);
  const end = monthIndex(bar.end);
  // Give adjacent roles half of their shared month each, while the scrubber still reports both.
  const sharesStart = bars.some((other) => other.id !== bar.id && other.lane === bar.lane && other.end === bar.start);
  const sharesEnd = bars.some((other) => other.id !== bar.id && other.lane === bar.lane && other.start === bar.end);
  return [start + (sharesStart ? 0.5 : 0), end + (sharesEnd ? 0.5 : 1)];
}

function nowMonth() {
  const d = new Date();
  return Math.min(END, Math.max(START, d.getFullYear() * 12 + d.getMonth()));
}

const toMonth = (i: number): Month => `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`;

/** 2017–2027 on one ruler. Scrub (drag or arrow keys) to read what was happening in any month. */
export function CareerRuler() {
  const today = useMemo(nowMonth, []);
  const [m, setM] = useState(today);
  const active = bars.filter((b) => monthIndex(b.start) <= m && m <= monthIndex(b.end));
  const pct = (i: number) => ((i - START) / SPAN) * 100;

  return (
    <div className="ruler" data-signal>
      <div className="ruler__scroll" data-lenis-prevent-horizontal>
        <div className="ruler__axis">
          <div className="ruler__track">
            {LANES.map((l, li) => (
              <div key={l} className="ruler__lane">
                <span className="ruler__lanename mono">{l}</span>
                {bars
                  .filter((b) => b.lane === li)
                  .map((b) => {
                    const on = active.includes(b);
                    const [start, end] = barBounds(b);
                    return (
                      <button
                        key={b.id}
                        className={`ruler__bar ${on ? 'is-on' : ''}`}
                        style={{ left: `${pct(start)}%`, width: `calc(${pct(end) - pct(start)}% - 2px)` }}
                        onClick={() => go(b.id)}
                        aria-label={`${b.label}, ${b.sub}, ${fmtMonth(b.start)} to ${fmtMonth(b.end)}. Jump to entry.`}
                      >
                        <span>{b.label}</span>
                      </button>
                    );
                  })}
              </div>
            ))}
            <div className="ruler__now" style={{ left: `${pct(today)}%` }} aria-hidden="true">
              <span className="mono">now</span>
            </div>
            <div className="ruler__cursor" style={{ left: `${pct(m + 0.5)}%` }} aria-hidden="true" />
          </div>
          <div className="ruler__years" aria-hidden="true">
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i} style={{ left: `${pct(START + i * 12)}%` }}>
                {2017 + i}
              </span>
            ))}
          </div>
          <input
            className="ruler__scrub"
            type="range"
            min={START}
            max={END}
            value={m}
            onChange={(e) => setM(Number(e.target.value))}
            aria-label="Scrub through time"
            aria-valuetext={`${fmtMonth(toMonth(m))}: ${active.map((a) => `${a.label}, ${a.sub}`).join('; ') || 'nothing on record'}`}
          />
        </div>
      </div>
      <p className="ruler__readout" aria-hidden="true">
        <span className="mono">{fmtMonth(toMonth(m))}</span>
        {active.length ? (
          active.map((a) => (
            <span key={a.id}>
              <b>{a.label}</b> {a.sub}
            </span>
          ))
        ) : (
          <span className="muted">Nothing on record. {m > today ? 'Not yet written.' : ''}</span>
        )}
      </p>
    </div>
  );
}
