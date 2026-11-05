import { useState } from 'react';
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
