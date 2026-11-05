import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/big-shoulders-display/latin-700';
import '@fontsource/big-shoulders-display/latin-ext-700';
import '@fontsource/big-shoulders-display/latin-900';
import '@fontsource/big-shoulders-display/latin-ext-900';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-ext-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/chapters.css';
import './styles/chapters2.css';
import './styles/backdrops.css';
import './styles/figures.css';
import './styles/cv.css';
import { App } from './App';
import { fullMotion } from './lib/hooks';

if (fullMotion) document.documentElement.dataset.motion = 'full';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
