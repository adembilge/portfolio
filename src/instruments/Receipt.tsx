import { useEffect, useState } from 'react';
import { useReducedMotion } from '../lib/hooks';

type Line = { k: 'retrieve' | 'tool' | 'none' | 'handoff'; text: string; detail?: string };
type Scenario = { q: string; lines: Line[]; answer: string; handled: boolean };

// Illustrative traces of the flow described on the site (retrieve -> tool call -> answer); not production logs.
const SCENARIOS: Scenario[] = [
  {
    q: 'Is my session tomorrow still on?',
    lines: [
      { k: 'retrieve', text: 'pgvector · session info', detail: 'top-3 cos 0.91 · 0.87 · 0.74' },
      { k: 'tool', text: 'GET /api/bookings/?date=tomorrow', detail: '200 · status: confirmed' },
    ],
    answer: 'Yes, your booking for tomorrow is confirmed.',
    handled: true,
  },
  {
    q: 'Book me into Thursday’s session.',
    lines: [
      { k: 'retrieve', text: 'pgvector · schedule', detail: 'top-3 cos 0.89 · 0.83 · 0.71' },
      { k: 'tool', text: 'GET /api/sessions/?day=thu', detail: '200 · 1 seat open' },
      { k: 'tool', text: 'POST /api/bookings/', detail: '201 Created' },
    ],
    answer: 'You’re booked.',
    handled: true,
  },
  {
    q: 'Did my payment go through?',
    lines: [
      { k: 'retrieve', text: 'pgvector · session info', detail: 'top-3 cos 0.86 · 0.80 · 0.66' },
      { k: 'tool', text: 'GET /api/payments/?booking=latest', detail: '200 · status: paid' },
    ],
    answer: 'Payment confirmed for your latest booking.',
    handled: true,
  },
  {
    q: 'Send the invite to my colleague too.',
    lines: [
      { k: 'tool', text: 'POST /api/invitations/', detail: '201 Created' },
    ],
    answer: 'Invitation sent.',
    handled: true,
  },
  {
    q: 'Can you change the terms of my contract?',
    lines: [
      { k: 'none', text: 'pgvector · no grounded match', detail: 'best cos 0.41 < threshold' },
      { k: 'handoff', text: 'no tool for this request', detail: 'routed to a person' },
    ],
    answer: 'That one needs a person. I’ve passed it to the team.',
    handled: false,
  },
];

const TAG: Record<Line['k'], string> = { retrieve: 'RETRIEVE', tool: 'TOOL', none: 'RETRIEVE', handoff: 'HANDOFF' };

export function Receipt() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(1);
  const [printed, setPrinted] = useState(99);
  const s = SCENARIOS[i];
  const total = s.lines.length + 1;

  useEffect(() => {
    if (reduced) return setPrinted(99);
    setPrinted(0);
    const id = setInterval(() => setPrinted((n) => (n >= total ? (clearInterval(id), n) : n + 1)), 420);
    return () => clearInterval(id);
  }, [i, reduced, total]);

  const stamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const tools = s.lines.filter((l) => l.k === 'tool').length;

  return (
    <div className="receipt-fig">
      <div className="receipt-fig__chat">
        <p className="tag">Ask the support agent</p>
        <ul className="receipt-fig__qs" role="list">
          {SCENARIOS.map((sc, k) => (
            <li key={sc.q}>
              <button className={`q ${k === i ? 'is-on' : ''}`} aria-pressed={k === i} onClick={() => setI(k)}>
                {sc.q}
              </button>
            </li>
          ))}
        </ul>
        <div className="bubble" aria-live="polite">
          <span className="mono">agent →</span>
          {printed >= total ? s.answer : <span className="typing" aria-hidden="true">···</span>}
        </div>
      </div>
      <div className="receipt" aria-label="Receipt of what the agent did">
        <p className="receipt__head">
          ENTERVIA · SUPPORT AGENT
          <br />
          TRACE {stamp}
        </p>
        <p className="receipt__q">“{s.q}”</p>
        <ol className="receipt__lines">
          {s.lines.map((l, k) => (
            <li key={k} className={`${k < printed ? 'is-in' : ''} receipt__${l.k}`}>
              <span>{TAG[l.k]}</span>
              <b>{l.text}</b>
              {l.detail && <em>{l.detail}</em>}
            </li>
          ))}
        </ol>
        <p className={`receipt__foot ${printed >= total ? 'is-in' : ''}`}>
          {s.handled ? (
            <>
              ANSWER GROUNDED · {tools} TOOL CALL{tools === 1 ? '' : 'S'}
              <br />
              <strong>{s.answer.toUpperCase()}</strong>
            </>
          ) : (
            <>
              NOT ANSWERED BY THE AGENT
              <br />
              <strong>HANDED TO A HUMAN</strong>
            </>
          )}
        </p>
        <div className="receipt__barcode" aria-hidden="true" />
      </div>
      <p className="figure__caption receipt-fig__caption">
        Each receipt shows what the agent retrieved and which FastAPI tools it called to answer the support question.
      </p>
      <div className="receipt-fig__stats">
        <div className="gauge" aria-hidden="true">
          <svg viewBox="0 0 80 44">
            <path d="M6 40 A34 34 0 0 1 74 40" className="gauge__track" />
            <path d="M6 40 A34 34 0 0 1 40 6" className="gauge__fill" />
          </svg>
        </div>
        <div className="readout">
          <b>50%</b>
          <span>of support queries resolved by the agent</span>
        </div>
        <div className="readout">
          <b>99.9%</b>
          <span>uptime on AWS ECS + RDS with CI/CD (≈43 min of allowed downtime in a 30-day month)</span>
        </div>
        <p className="note">Illustrative traces of the flow · endpoints simplified</p>
      </div>
    </div>
  );
}
