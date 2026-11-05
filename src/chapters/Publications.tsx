import { lazy, useState } from 'react';
import { researchIntro, sycoscience, tinysign } from '../content/facts';
import { Chapter, Disclosure, Ext, Figure } from '../components/Shells';
const Pixelate = lazy(() => import('../instruments/Pixelate').then((module) => ({ default: module.Pixelate })));
const LeadingQuestion = lazy(() => import('../instruments/LeadingQuestion').then((module) => ({ default: module.LeadingQuestion })));

function CopyDoi() {
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn btn--ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`https://doi.org/${tinysign.doi}`);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* Clipboard blocked: the DOI link is available below. */
        }
      }}
    >
      <span aria-live="polite">{done ? 'copied' : 'copy DOI'}</span>
    </button>
  );
}

export function Publications() {
  return (
    <Chapter id="publications" numeral="IV" title="Publications" subject="Research" intro={researchIntro}>
      <article id="tinysign" className="paper" data-signal data-stop aria-labelledby="tinysign-h">
        <div className="paper__offprint">
          <p className="paper__journal mono">
            {tinysign.venue} · {tinysign.publisher}
            <br />
            {tinysign.citation} · {tinysign.date} · {tinysign.place}
          </p>
          <p className="tag">{tinysign.kicker}</p>
          <h3 id="tinysign-h" className="paper__name">
            {tinysign.name}
          </h3>
          <p className="paper__title">{tinysign.title}</p>
          <p className="paper__blurb">{tinysign.blurb}</p>
          <h4 className="paper__h">Abstract</h4>
          <p className="paper__abstract">{tinysign.abstract}</p>
          <Disclosure label="Paper Highlights">
            <ul className="paper__highlights">
              {tinysign.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Disclosure>
          <p className="paper__links">
            {tinysign.links.map((l) => (
              <Ext key={l.label} href={l.href}>
                {l.label}
              </Ext>
            ))}
            <CopyDoi />
          </p>
        </div>
        <div className="paper__figure">
          <Figure id="02" caption={<>Drag the resolution down to sixteen pixels and the sign nearly disappears. Tinysign’s answer was to let pose guide super-resolution: tick “pose-conditioned” and the hands, where the meaning is, come back first.</>}>
            {(v) => <Pixelate visible={v} accuracy={tinysign.accuracy} baseline={tinysign.baseline} />}
          </Figure>
        </div>
      </article>

      <article id="sycoscience" className="paper paper--thesis" data-signal data-stop aria-labelledby="syco-h">
        <div className="paper__offprint">
          <p className="paper__journal mono">
            {sycoscience.status} · Politecnico di Milano
            <br />
            Expected publication: {sycoscience.expected}
          </p>
          <h3 id="syco-h" className="paper__name">
            {sycoscience.name}
          </h3>
          <p className="paper__title">{sycoscience.title}</p>
          {sycoscience.body.map((b, i) => (
            <p key={i}>{b}</p>
          ))}
        </div>
        <div className="paper__figure">
          <Figure id="08" caption={<>A data-science agent can reach the answer it was nudged toward without inventing a single number, just by choosing which rows count. Sycoscience builds a reproducible framework to tell valid differences in analysis apart from this.</>}>
            {() => <LeadingQuestion />}
          </Figure>
        </div>
      </article>
    </Chapter>
  );
}
