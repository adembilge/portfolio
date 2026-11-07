import { Resolve } from '../components/Live';
import { lazy, type ReactNode } from 'react';
import { projects, projectsIntro, type Project } from '../content/facts';
import { Chapter, Ext, Figure, Stack } from '../components/Shells';
const Pipeline = lazy(() => import('../instruments/Pipeline').then((module) => ({ default: module.Pipeline })));
const Cipher = lazy(() => import('../instruments/Cipher').then((module) => ({ default: module.Cipher })));
const MilanCase = lazy(() => import('../instruments/MilanCase').then((module) => ({ default: module.MilanCase })));

function ProjectEntry({ p, index, figure }: { p: Project; index: number; figure: ReactNode }) {
  return (
    <article id={p.id} className={`project ${index % 2 ? 'project--flip' : ''}`} data-signal data-stop aria-labelledby={`${p.id}-h`}>
      <header className="project__head">
        <p className="tag">Specimen {String(index + 1).padStart(2, '0')}</p>
        <h3 id={`${p.id}-h`} className="project__name">
          <Resolve text={p.name} onView />
        </h3>
        <p className="project__line">{p.line}</p>
        <p className="project__desc">{p.description}</p>
        {p.overview && <p className="project__desc">{p.overview}</p>}
        <Stack items={p.stack} />
        <p className="project__links">
          {p.links.map((l) => (
            <Ext key={l.href} href={l.href}>
              {l.label}
            </Ext>
          ))}
        </p>
      </header>
      <div className="project__figure">{figure}</div>
      <div className="project__inside">
        <p className="tag">Inside {p.name}</p>
        <div className="project__sections">
          {p.sections.map((s, i) => (
            <section key={s.title} className="project__section">
              <h4>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span> <Resolve text={s.title} onView />
              </h4>
              {s.body.map((b, k) => (
                <p key={k}>{b}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

export function Specimens() {
  const [practicamia, cognify, cryptme] = projects;
  return (
    <Chapter id="specimens" numeral="III" title="Specimens" subject="Projects" intro={projectsIntro}>
      <ProjectEntry
        p={practicamia}
        index={0}
        figure={
          <Figure id={practicamia.figure} caption="Answer five questions to trace a sample move through Milan. Revisit an earlier stop and change an answer to see how the case is recalculated. The route is a schematic of the workflow.">
            {() => <MilanCase />}
          </Figure>
        }
      />
      <ProjectEntry
        p={cognify}
        index={1}
        figure={
          <Figure id="06" caption={<>Upload → OCR → Summarize → Classify → Embed → Completed, then retrieval by meaning. In Cognify this runs on Celery workers with Tesseract, DistilBART, a zero-shot MNLI classifier and Sentence-BERT; here it is re-drawn so you can watch it.</>}>
            {() => <Pipeline />}
          </Figure>
        }
      />
      <ProjectEntry
        p={cryptme}
        index={2}
        figure={
          <Figure id="05" caption={<>The server manages connections and routing without ever holding plaintext. Type anything: it is encrypted on this page before it moves.</>}>
            {() => <Cipher />}
          </Figure>
        }
      />
    </Chapter>
  );
}
