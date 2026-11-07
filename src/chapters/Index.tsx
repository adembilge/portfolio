import { Resolve } from '../components/Live';
import { certifications, certificationsIntro, competencies, competencyIntro, languages, skillIndex } from '../content/facts';
import { Chapter, Ext, FigLink } from '../components/Shells';
import { Seal } from '../components/Seal';

const GREETING: Record<string, string> = { Turkish: 'Merhaba', English: 'Hello', Italian: 'Ciao' };

const terms = Object.keys(skillIndex).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
const letters = Array.from(new Set(terms.map((t) => t[0].toUpperCase())));
const featured = certifications.find((c) => c.featured)!;
const gallery = certifications.filter((c) => !c.featured);

function CredentialCard({ credential: c }: { credential: (typeof certifications)[number] }) {
  return (
    <article id={c.id} className={`cert${c.featured ? ' cert--featured' : ''}`} aria-labelledby={`${c.id}-h`}>
      <Seal seed={c.href} text={`${c.issuer.toUpperCase()} · ${c.date.toUpperCase()} · `} />
      <div className="cert__copy">
        {c.featured && <p className="mono cert__feat">Featured</p>}
        <p className="mono cert__issuer">{c.issuer} · Issued {c.date}</p>
        <h4 id={`${c.id}-h`}><Resolve text={c.title} onView /></h4>
        {c.body && <p>{c.body}</p>}
        <Ext href={c.href}>View credential</Ext>
      </div>
    </article>
  );
}

export function Index() {
  return (
    <Chapter id="index" numeral="VI" title="Index" subject="Skills, languages, certifications" intro={competencyIntro}>
      <div className="competencies" data-signal>
        {competencies.map((c, i) => (
          <section key={c.id} id={`comp-${c.id}`} className="competency" aria-labelledby={`comp-${c.id}-h`}>
            <span className="competency__n mono">§{i + 1}</span>
            <h3 id={`comp-${c.id}-h`}><Resolve text={c.name} onView /></h3>
            <p>{c.body}</p>
            <p className="competency__tools mono">{c.tools.join(' · ')}</p>
          </section>
        ))}
      </div>

      <section className="az" aria-labelledby="az-h" data-signal data-stop id="index-of-terms">
        <h3 id="az-h" className="az__title">
          <Resolve text="Index of terms" onView /> <span className="mono">every number is a figure where it was used</span>
        </h3>
        <div className="az__cols">
          {letters.map((L) => (
            <div key={L} className="az__group">
              <p className="az__letter" aria-hidden="true">{L}</p>
              <ul>
                {terms
                  .filter((t) => t[0].toUpperCase() === L)
                  .map((t) => (
                    <li key={t}>
                      <span className="az__term">{t}</span>
                      <span className="az__dots" aria-hidden="true" />
                      <span className="az__refs">
                        {skillIndex[t].map((r) => (
                          <FigLink key={r} id={r} />
                        ))}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="langs" aria-labelledby="langs-h" data-signal data-stop id="languages">
        <h3 id="langs-h" className="sub-h"><Resolve text="Languages" onView /></h3>
        {languages.map((l) => (
          <div key={l.name} className="lang" style={{ ['--w' as string]: l.weight }}>
            <p className="lang__word" lang={l.name === 'Turkish' ? 'tr' : l.name === 'Italian' ? 'it' : 'en'} style={{ fontWeight: Math.round(200 + l.weight * 600) }}>
              {GREETING[l.name]}
            </p>
            <div className="lang__meta">
              <p className="lang__name">
                {l.name} <span className="mono">{l.level}</span>
              </p>
              <details>
                <summary className="mono">How I use {l.name}</summary>
                {l.body.map((b, i) => (
                  <p key={i}>{b}</p>
                ))}
              </details>
            </div>
          </div>
        ))}
      </section>

      <section className="certs" aria-labelledby="certs-h" data-signal data-stop id="certifications">
        <h3 id="certs-h" className="sub-h"><Resolve text="Certifications" onView /></h3>
        <p className="certs__intro">{certificationsIntro}</p>
        <CredentialCard credential={featured} />
        <ul className="certs__gallery" aria-label="More certifications">
          {gallery.map((credential) => (
            <li key={credential.id}><CredentialCard credential={credential} /></li>
          ))}
        </ul>
      </section>
    </Chapter>
  );
}
