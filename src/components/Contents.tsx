import { useEffect, useState, type ReactNode } from 'react';
import { chapters, contact, figures } from '../content/facts';
import { go, useSite } from '../site';
import { SignalMeter } from './SignalMeter';
import { MilanClock } from './MilanClock';

const contactIcons: Record<string, ReactNode> = {
  GitHub: <path d="M9 19c-4.5 1.5-4.5-2.5-6.5-3m13 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.8a5.3 5.3 0 0 0-1.4-3.7 5 5 0 0 0-.2-3.7S18 1 15.5 2.7a13.8 13.8 0 0 0-7 0C6 1 4.8 1.3 4.8 1.3A5 5 0 0 0 4.6 5a5.3 5.3 0 0 0-1.4 3.7c0 5.3 3.2 6.5 6.2 6.8a3.4 3.4 0 0 0-.9 2.6V22" />,
  LinkedIn: <><circle cx="5" cy="5" r="1.2" /><path d="M5 10v9m5-9v9m0-5a4 4 0 0 1 8 0v5" /></>,
  'Google Scholar': <><path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v5c3.3 3 8.7 3 12 0v-5m4-2v7" /></>,
  Email: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 6 9 7 9-7" /></>,
};

const railContacts = [...contact.links, { label: 'Email', href: `mailto:${contact.emails[0]}` }];

/** The fixed contents rail (a top bar plus drawer on small screens). */
export function Contents({ backgroundsPaused, toggleBackgrounds }: {
  backgroundsPaused: boolean;
  toggleBackgrounds: () => void;
}) {
  const { cv, setCv, setSheet } = useSite();
  const [active, setActive] = useState('cover');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (cv) return;
    const els = ['cover', ...chapters.map((c) => c.anchor), 'transmit'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [cv]);

  const jump = (id: string) => {
    setOpen(false);
    if (cv) setCv(false);
    requestAnimationFrame(() => go(id));
  };

  return (
    <aside className={`rail ${open ? 'rail--open' : ''}`} aria-label="Contents">
      <div className="rail__top">
        <button className="rail__title" onClick={() => (setSheet(true), setOpen(false))} aria-label="Weak Signals — open the chapter contact sheet">
          Weak<br />Signals
        </button>
        <button className="rail__menu" aria-expanded={open} aria-controls="rail-body" onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Contents'}
        </button>
      </div>
      <div className="rail__body" id="rail-body">
        <p className="rail__sub mono">A field guide to Adem Bilge</p>
        <nav aria-label="Chapters">
          <ol className="rail__list">
            <li>
              <a href="#cover" className={active === 'cover' ? 'is-active' : ''} onClick={(e) => (e.preventDefault(), jump('cover'))}>
                <span className="rail__num">0</span> Cover
              </a>
            </li>
            {chapters.map((c, i) => (
              <li key={c.id}>
                <a
                  href={`#${c.anchor}`}
                  className={active === c.anchor ? 'is-active' : ''}
                  aria-current={active === c.anchor ? 'true' : undefined}
                  onClick={(e) => (e.preventDefault(), jump(c.anchor))}
                >
                  <span className="rail__num">{i + 1}</span> {c.title}
                  <span className="rail__subject">{c.subject}</span>
                </a>
                <span className="rail__figs">
                  {figures
                    .filter((f) => f.chapter === c.id)
                    .map((f) => (
                      <a key={f.id} href={`#fig-${f.id}`} onClick={(e) => (e.preventDefault(), jump(`fig-${f.id}`))} aria-label={`Figure ${f.id}: ${f.title}`}>
                        {f.id}
                      </a>
                    ))}
                </span>
              </li>
            ))}
            <li>
              <a href="#transmit" className={active === 'transmit' ? 'is-active' : ''} onClick={(e) => (e.preventDefault(), jump('transmit'))}>
                <span className="rail__num">→</span> Transmit
                <span className="rail__subject">Contact</span>
              </a>
            </li>
          </ol>
        </nav>
        <div className="rail__modes">
          <button className={`chip ${cv ? 'is-on' : ''}`} aria-pressed={cv} onClick={() => (setCv(!cv), setOpen(false), scrollTo(0, 0))}>
            Read as CV <kbd>C</kbd>
          </button>
          <nav className="rail__contacts" aria-label="Contact links">
            {railContacts.map(({ label, href }) => {
              const external = !href.startsWith('mailto:');
              return (
                <a key={label} href={href} title={label} aria-label={external ? `${label} (opens in a new tab)` : label}
                  target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {contactIcons[label]}
                  </svg>
                </a>
              );
            })}
          </nav>
          {!cv && <button className="rail__backgrounds" onClick={toggleBackgrounds}>
            {backgroundsPaused ? 'Resume backgrounds' : 'Pause backgrounds'}
          </button>}
        </div>
        <SignalMeter />
        <MilanClock compact />
      </div>
    </aside>
  );
}
