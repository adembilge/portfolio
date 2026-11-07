import { useEffect, useState } from 'react';
import { SiteProvider, useSite } from './site';
import { Contents } from './components/Contents';
import { ReadingTrace } from './components/ReadingTrace';
import { CvView } from './components/CvView';
import { ContactSheet } from './components/ContactSheet';
import { GradientBackdrop } from './components/GradientBackdrop';
import { Author, Cover } from './chapters/Author';
import { FieldWork } from './chapters/FieldWork';
import { Specimens } from './chapters/Specimens';
import { Publications } from './chapters/Publications';
import { Schooling } from './chapters/Schooling';
import { Index } from './chapters/Index';
import { Transmit } from './chapters/Transmit';

function Page() {
  const { cv } = useSite();
  const [backgroundsPaused, setBackgroundsPaused] = useState(false);
  useEffect(() => {
    const selectors = [
      '#author .chapter__intro, #author .author__statement, #author .author__text p:not(.mono)',
      '#field-work .chapter__intro, #field-work .entry__lede, #field-work .entry__body > p, #field-work .contribs li, #field-work .figure__caption',
      '#specimens .chapter__intro, #specimens .project__line, #specimens .project__desc, #specimens .project__section p, #specimens .figure__caption',
      '#publications .chapter__intro, #publications .paper__blurb, #publications .paper__abstract, #publications .paper--thesis .paper__offprint > p:not([class]), #publications .paper__highlights li, #publications .figure__caption',
      '#schooling .chapter__intro, #schooling .school__body',
      '#index .chapter__intro, #index .competency > p:not(.mono), #index .certs__intro, #index .cert__copy > p:not(.mono), #index .lang__meta details p',
    ];
    const nodes = document.querySelectorAll(selectors.join(','));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('prose-arrived');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return (
    <div className={`app ${cv ? 'app--cv' : ''} ${backgroundsPaused ? 'app--backgrounds-paused' : ''}`}>
      <a className="skip" href="#main">Skip to content</a>
      <Contents backgroundsPaused={backgroundsPaused} toggleBackgrounds={() => setBackgroundsPaused((paused) => !paused)} />
      {!cv && <ReadingTrace />}
      <main id="main" tabIndex={-1} hidden={cv}>
        <div className="portfolio">
          <GradientBackdrop />
          <Cover />
          <Author />
          <FieldWork />
          <Specimens />
          <Publications />
          <Schooling />
          <Index />
        </div>
        <Transmit />
      </main>
      <CvView />
      <ContactSheet />
    </div>
  );
}

export function App() {
  return (
    <SiteProvider>
      <Page />
    </SiteProvider>
  );
}
