import { useMemo, useState } from 'react';
import { contact, person } from '../content/facts';
import { Ext } from '../components/Shells';
import { Resolve } from '../components/Live';

/** The visitor's message drawn as a signal: each character sets the amplitude of one sample. */
function Waveform({ text }: { text: string }) {
  const d = useMemo(() => {
    const chars = (text || ' ').slice(-120).split('');
    const step = 600 / Math.max(40, chars.length);
    return chars
      .map((ch, i) => {
        const c = ch.charCodeAt(0);
        const amp = ch === ' ' ? 0 : ((c % 32) / 32) * 34 + 6;
        return `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(50 + (i % 2 ? amp : -amp)).toFixed(1)}`;
      })
      .join(' ');
  }, [text]);
  return (
    <svg viewBox="0 0 600 100" className="wave" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="50" x2="600" y2="50" className="wave__base" />
      <path d={d} className="wave__line" />
    </svg>
  );
}

export function Transmit() {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [msg, setMsg] = useState('');
  const href = `mailto:${contact.emails[0]}?subject=${encodeURIComponent(`Hello from ${name || 'your field guide'}`)}&body=${encodeURIComponent(
    `${msg}\n\n— ${name}${from ? ` (${from})` : ''}`,
  )}`;

  return (
    <section id="transmit" className="transmit" aria-labelledby="transmit-h" data-stop>
      <div className="transmit__head" data-signal>
        <p className="tag">Transmit</p>
        <h2 id="transmit-h" className="transmit__title"><Resolve text={contact.heading} onView /></h2>
        <p className="transmit__lede">{contact.lede}</p>
        <ul className="transmit__emails">
          {contact.emails.map((e) => (
            <li key={e}>
              <a className="link" href={`mailto:${e}`}>
                {e}
              </a>
            </li>
          ))}
        </ul>
        <ul className="transmit__links">
          {contact.links.map((l) => (
            <li key={l.href}>
              <Ext href={l.href}>{l.label}</Ext>
            </li>
          ))}
          <li>
            <Ext href={contact.cv}>Full CV (PDF)</Ext>
          </li>
        </ul>
      </div>
      <form className="composer" onSubmit={(e) => (e.preventDefault(), (location.href = href))}>
        <p className="tag">Prefer to write here? Compose, then open it in your email app.</p>
        <div className="composer__row">
          <label>
            <span className="mono">Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label>
            <span className="mono">Email address</span>
            <input type="email" value={from} onChange={(e) => setFrom(e.target.value)} autoComplete="email" />
          </label>
        </div>
        <label>
          <span className="mono">Message</span>
          <textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} />
        </label>
        <Waveform text={msg} />
        <button className="btn" type="submit" disabled={!msg.trim()}>
          Open email app ↗
        </button>
      </form>
      <footer className="colophon mono">
        <p>Developed by {person.name}</p>
        <Ext href={contact.source}>View source code</Ext>
      </footer>
    </section>
  );
}
