import type { ReactNode } from 'react';
import { fmtMonth, type Role } from '../content/facts';
import { Disclosure, Ext, FigLink, Stack } from './Shells';
import { Resolve } from './Live';

export function RoleEntry({ role, figure, flip = false }: { role: Role; figure: ReactNode; flip?: boolean }) {
  const startY = role.start.slice(0, 4);
  const endY = role.end.slice(0, 4);
  return (
    <article id={role.id} className={`entry entry--role ${flip ? 'entry--flip' : ''}`} data-signal data-stop aria-labelledby={`${role.id}-h`}>
      <div className="entry__when">
        <b>{startY === endY ? startY : `${startY}–${endY.slice(2)}`}</b>
        {fmtMonth(role.start)} — {fmtMonth(role.end)}
        <br />
        {role.type}
        <br />
        {role.location}
      </div>
      <header className="entry__head">
        <h3 id={`${role.id}-h`} className="entry__title">
          <Resolve text={role.title} onView />
        </h3>
        <p className="entry__role">{role.company}</p>
        <p className="entry__meta">
          {role.context} · <Ext href={role.url}>about the product</Ext> · see fig.
          <FigLink id={role.figure} />
        </p>
        <p className="entry__lede">{role.lede}</p>
      </header>
      <div className="entry__body">
        {role.summary.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <Disclosure label="Contributions">
          <ol className="contribs">
            {role.contributions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </Disclosure>
        <Stack items={role.stack} />
      </div>
      <div className="entry__figure">{figure}</div>
    </article>
  );
}
