import { useState } from 'react';

type Language = 'en' | 'it';
type Answer = 'yes' | 'no' | 'unsure';

const checkpoints = [
  {
    label: { en: 'Current registration', it: 'Residenza attuale' },
    question: { en: 'Is your registered address already in Milan?', it: 'Hai già la residenza a Milano?' },
    expected: 'yes',
  },
  {
    label: { en: 'New address', it: 'Nuovo indirizzo' },
    question: { en: 'Is your new home also in Milan?', it: 'La tua nuova abitazione è sempre a Milano?' },
    expected: 'yes',
  },
  {
    label: { en: 'Who is moving', it: 'Chi si trasferisce' },
    question: { en: 'Are you moving on your own?', it: 'Ti trasferisci da solo?' },
    expected: 'yes',
  },
  {
    label: { en: 'Household', it: 'Famiglia anagrafica' },
    question: { en: 'Will you join an existing registered household?', it: 'Entrerai a far parte di una famiglia anagrafica già registrata?' },
    expected: 'no',
  },
  {
    label: { en: 'Tenancy', it: 'Affitto' },
    question: { en: 'Will you rent your new home?', it: 'La nuova abitazione sarà in affitto?' },
    expected: 'yes',
  },
] as const;

const copy = {
  en: {
    file: 'MILAN / CASE FILE', language: 'Language', stops: 'Case checkpoints', question: 'Question',
    review: 'Review', reviewTitle: 'Your case summary', reset: 'Start over',
    yes: 'Yes', no: 'No', unsure: 'Not sure',
    ready: 'Choose an answer for this sample case.',
    paused: 'More information needed. Choose another answer to continue.',
    outside: 'This answer leads outside the route covered by PracticaMIA.',
    cleared: 'Later answers cleared. Continue from this checkpoint.',
    complete: 'All five answers are ready to review.', matched: 'Scenario matched',
    reviewNote: 'This review shows how the workspace routes a case.',
  },
  it: {
    file: 'MILANO / FASCICOLO', language: 'Lingua', stops: 'Tappe della pratica', question: 'Domanda',
    review: 'Riepilogo', reviewTitle: 'Riepilogo della pratica', reset: 'Ricomincia',
    yes: 'Sì', no: 'No', unsure: 'Non so',
    ready: 'Scegli una risposta per questo caso di esempio.',
    paused: 'Servono altre informazioni. Scegli un’altra risposta per proseguire.',
    outside: 'Questa risposta porta fuori dal percorso gestito da PracticaMIA.',
    cleared: 'Risposte successive cancellate. Prosegui da questa tappa.',
    complete: 'Le cinque risposte sono pronte per il riepilogo.', matched: 'Scenario corrispondente',
    reviewNote: 'Il riepilogo mostra come il percorso viene selezionato.',
  },
};

const choices: Answer[] = ['yes', 'no', 'unsure'];
const stops = [[56, 98], [160, 61], [260, 106], [364, 62], [474, 99], [582, 62]] as const;
const tracks = [
  'M56 98 H106 L143 61 H160', 'M160 61 H197 L242 106 H260',
  'M260 106 H302 L346 62 H364', 'M364 62 H414 L451 99 H474', 'M474 99 H525 L562 62 H582',
];
const streetGrid = [
  'M0 38 H76 L99 14 H268 L321 67 H438 L462 43 H640',
  'M0 118 H74 L110 82 H219 L246 109 H326 L380 163',
  'M24 0 V62 L51 89 V168 M120 0 V31 L76 75 V168',
  'M180 0 V28 L236 84 V168 M287 0 V43 L322 78 V168',
  'M384 0 L351 34 V110 L410 169 M439 0 V38 L410 67 V144 L435 169',
  'M494 0 V23 L465 52 V143 L489 168 M533 0 V55 L582 104 V168',
  'M640 112 H550 L522 140 H321 L282 101 H182 L150 133 H0',
  'M611 0 V24 L574 61 V115 L626 167 M188 168 V149 L220 117',
].join(' ');

function CaseMap({ step, passed, branch }: { step: number; passed: number; branch?: 'paused' | 'outside' }) {
  const [x, y] = stops[step];
  return (
    <svg className="milan-case__map" viewBox="0 0 640 168" aria-hidden="true">
      <path className="milan-case__streets" d={streetGrid} />
      <path className="milan-case__route" d={tracks.join(' ')} />
      {tracks.slice(0, passed).map((track) => (
        <path className="milan-case__trace" key={track} d={track} pathLength="1" />
      ))}
      {branch && (
        <path className="milan-case__branch" key={`${step}-${branch}`} d={`M${x} ${y} l22 29 h32`} pathLength="1" />
      )}
      {stops.map(([cx, cy], index) => (
        <circle className={index <= passed ? 'is-reached' : ''} key={cx} cx={cx} cy={cy} r="6" />
      ))}
      <circle className="milan-case__beacon" key={step} cx={x} cy={y} r="13" />
    </svg>
  );
}

export function MilanCase() {
  const [language, setLanguage] = useState<Language>('en');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [step, setStep] = useState(0);
  const [cleared, setCleared] = useState(false);
  const c = copy[language];
  const passed = answers.filter((answer, i) => answer === checkpoints[i].expected).length;
  const current = checkpoints[step];
  const complete = passed === checkpoints.length;
  const answer = answers[step];
  const branch = answer === 'unsure' ? 'paused' : answer && answer !== current.expected ? 'outside' : undefined;

  function choose(choice: Answer) {
    const changed = choice !== answer;
    setCleared(changed && answers.length > step + 1);
    if (changed) setAnswers([...answers.slice(0, step), choice]);
    if (choice === current.expected && step < checkpoints.length - 1) setStep(step + 1);
  }

  function goTo(index: number) {
    setStep(index);
    setCleared(false);
  }

  return (
    <div className="milan-case" lang={language} data-keys>
      <div className="milan-case__header">
        <span>{c.file}</span>
        <div className="milan-case__languages" role="group" aria-label={c.language}>
          <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
          <button type="button" lang="it" aria-label="Italiano" aria-pressed={language === 'it'} onClick={() => setLanguage('it')}>IT</button>
        </div>
      </div>
      <CaseMap step={step} passed={passed} branch={branch} />
      <div className="milan-case__stops" role="group" aria-label={c.stops}>
        {checkpoints.map(({ label, expected }, i) => (
          <button
            type="button" key={label.en} aria-label={`${i + 1}. ${label[language]}`}
            aria-current={step === i ? 'step' : undefined}
            data-passed={answers[i] === expected} disabled={i > passed}
            onClick={() => goTo(i)}
          >
            <span aria-hidden="true">0{i + 1}</span>
          </button>
        ))}
        <button type="button" aria-current={current ? undefined : 'step'} disabled={!complete} onClick={() => goTo(checkpoints.length)}>
          {c.review}
        </button>
      </div>
      <div className="milan-case__sheet">
        {current ? (
          <>
            <div className="milan-case__prompt" key={step}>
              <p className="milan-case__eyebrow">{c.question} 0{step + 1} / 05 · {current.label[language]}</p>
              <p className="milan-case__question" id="milan-case-question">{current.question[language]}</p>
            </div>
            <div className="milan-case__answers" role="group" aria-labelledby="milan-case-question">
              {choices.map((choice) => (
                <button type="button" key={choice} aria-pressed={answer === choice} onClick={() => choose(choice)}>{c[choice]}</button>
              ))}
            </div>
          </>
        ) : (
          <div className="milan-case__summary">
            <span className="milan-case__stamp">{c.matched}</span>
            <p className="milan-case__question">{c.reviewTitle}</p>
            <dl>
              {checkpoints.map(({ label }, i) => (
                <div key={label.en}><dt>{label[language]}</dt><dd>{c[answers[i]]}</dd></div>
              ))}
            </dl>
          </div>
        )}
      </div>
      <div className="milan-case__footer">
        <p aria-live="polite" aria-atomic="true">
          {current ? <>
            <span className="sr-only">{current.question[language]} </span>
            {cleared && <>{c.cleared} </>}
            {branch ? c[branch] : complete ? c.complete : !cleared && c.ready}
          </> : c.reviewNote}
        </p>
        <button type="button" onClick={() => { setAnswers([]); goTo(0); }}>{c.reset}</button>
      </div>
    </div>
  );
}
