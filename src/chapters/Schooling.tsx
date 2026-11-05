import { education, educationIntro, fmtMonth } from '../content/facts';
import { Chapter, Ext } from '../components/Shells';
import { RouteLine } from '../components/RouteLine';
import { Constellation } from '../components/Constellation';

export function Schooling() {
  return (
    <Chapter id="schooling" numeral="V" title="Schooling" subject="Education" intro={educationIntro}>
      <RouteLine />
      <div className="schools">
        {education.map((e, i) => (
          <article key={e.id} id={e.id} className={`school school--${i}`} data-signal data-stop aria-labelledby={`${e.id}-h`}>
            <p className="school__when mono">
              {fmtMonth(e.start)} — {fmtMonth(e.end)} · {e.city}
            </p>
            <h3 id={`${e.id}-h`} className="school__name">
              {e.name}
            </h3>
            <p className="school__degree">{e.degree}</p>
            {e.detail && <p className="school__detail mono">{e.detail}</p>}
            {e.body.map((b, k) => (
              <p key={k} className="school__body">
                {b}
              </p>
            ))}
            <p className="school__courses mono">
              <span>Coursework</span> {e.coursework.join(' · ')}
            </p>
            <Ext href={e.url}>{e.name.split(' ')[0]} website</Ext>
          </article>
        ))}
      </div>
      <Constellation />
    </Chapter>
  );
}
