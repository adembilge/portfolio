import {
  about,
  certifications,
  contact,
  education,
  experienceIntro,
  fmtMonth,
  languages,
  person,
  projects,
  roles,
  skillGroups,
  sycoscience,
  tinysign,
} from '../content/facts';
import { useSite } from '../site';

/** The same facts as a plain, dense, printable resume. Always in the DOM so printing from any view gives the CV. */
export function CvView() {
  const { cv, setCv } = useSite();
  return (
    <article className={`cv ${cv ? 'is-on' : ''}`} aria-label="Curriculum vitae" aria-hidden={!cv}>
      <div className="cv__bar">
        <button className="btn btn--ghost" onClick={() => setCv(false)}>
          ← back to the field guide
        </button>
        <div className="cv__actions">
          <a className="btn btn--ghost" href={contact.cv} target="_blank" rel="noopener noreferrer">1 Page format</a>
          <button className="btn" onClick={() => print()}>print / save as PDF</button>
        </div>
      </div>
      <header className="cv__head">
        <h1>{person.name}</h1>
        <p>{person.role}</p>
        <p className="cv__contact">
          {person.based} · <a href={`mailto:${contact.emails[0]}`}>{contact.emails[0]}</a>
          {contact.links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </p>
      </header>

      <section>
        <h2>Profile</h2>
        <p>{person.tagline}</p>
        {about.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section>
        <h2>Experience</h2>
        <p className="cv__note">{experienceIntro}</p>
        {roles.map((r) => (
          <div key={r.id} className="cv__item">
            <h3>
              {r.title}, {r.company}
              <span>
                {fmtMonth(r.start)} – {fmtMonth(r.end)}
              </span>
            </h3>
            <p className="cv__meta">
              {r.type} · {r.context} · {r.location}
            </p>
            {r.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <ul>
              {r.contributions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="cv__meta">{r.stack.join(', ')}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        {projects.map((p) => (
          <div key={p.id} className="cv__item">
            <h3>
              {p.name} — {p.line}
              <span>
                <a href={p.links[0].href}>{p.links[0].href.replace('https://', '')}</a>
              </span>
            </h3>
            <p>{p.description}</p>
            {p.overview && <p>{p.overview}</p>}
            <p className="cv__meta">{p.stack.join(', ')}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Research</h2>
        <div className="cv__item">
          <h3>
            {tinysign.name}: {tinysign.title}
            <span>{tinysign.date}</span>
          </h3>
          <p className="cv__meta">
            {tinysign.venue}, {tinysign.publisher} · {tinysign.citation} · {tinysign.place}
          </p>
          <p>{tinysign.abstract}</p>
        </div>
        <div className="cv__item">
          <h3>
            {sycoscience.name}: {sycoscience.title}
            <span>expected {sycoscience.expected}</span>
          </h3>
          <p className="cv__meta">{sycoscience.status} · Politecnico di Milano</p>
          {sycoscience.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section>
        <h2>Education</h2>
        {education.map((e) => (
          <div key={e.id} className="cv__item">
            <h3>
              {e.name}
              <span>
                {fmtMonth(e.start)} – {fmtMonth(e.end)}
              </span>
            </h3>
            <p className="cv__meta">
              {e.degree}
              {e.detail ? ` · ${e.detail}` : ''} · {e.city}
            </p>
            <p className="cv__meta">Coursework: {e.coursework.join(', ')}</p>
          </div>
        ))}
      </section>

      <section className="cv__two">
        <div>
          <h2>Skills</h2>
          {skillGroups.map((g) => (
            <p key={g.name}>
              <b>{g.name}:</b> {g.items.join(', ')}
            </p>
          ))}
        </div>
        <div>
          <h2>Languages</h2>
          {languages.map((l) => (
            <p key={l.name}>
              <b>{l.name}</b> — {l.level}
            </p>
          ))}
          <h2>Certifications</h2>
          {certifications.map((c) => (
            <p key={c.id}>
              <b>{c.title}</b> — {c.issuer}, {c.date}
            </p>
          ))}
        </div>
      </section>
    </article>
  );
}
