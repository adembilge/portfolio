# Adem Bilge Portfolio

Personal portfolio website built with plain HTML, CSS, and JavaScript.

Plain HTML, CSS, and JavaScript with self-hosted fonts and local media. No framework, runtime dependencies, package installation, or API keys are required.

## Preview and checks

Use Node.js 22 or newer for the optional development tools:

```sh
npm run dev
npm run check
npm run build
npm run test:pages
npm run preview
```

Both previews use `http://127.0.0.1:4173`; run one at a time. `dev` serves the source, while `preview` serves the production build. `build` recreates `dist/` from the exact page, stylesheet, font, and media dependencies. It excludes documentation, scripts, Git/IDE files, and local QA artifacts. `test:pages` checks every production file and local reference at both `/` and `/portfolio/`, including case-sensitive paths.

## Editing

- `index.html`: portfolio content, project details, experience, and contact information.
- `css/portfolio.css`: design tokens, page layouts, responsive rules, and motion.
- `css/motion.css`: opening choreography, photo reveals, and university slideshow styling.
- `css/articles.css`: shared article reading layouts.
- `js/portfolio.js`: sticky-header reading progress, navigation, animated disclosures, project screenshot controls, optional demo playback, and contact enhancements.
- `js/motion.js`: letter opening, scroll depth, animated figures, and accessible university slideshow.
- `js/motion-preference.js`: device preferences, remembered motion overrides, and the full-motion local preview default.
- `js/articles.js`: article title entrances and one-time section/figure reveals.
- `blog/`: the original article routes and article bodies.
- `images/`: only media used by the current site; `editorial/` contains optimized WebP assets.
- `fonts/`: self-hosted Schibsted Grotesk and its OFL license.

See [brand guidelines](docs/brand-guidelines.md) and [image source/license records](docs/image-sources.md). Old styles/scripts, unused images/icons, IDE files, and one-off audit reports have been removed. Source changes belong in the repository; generated `dist/` stays ignored.

The university slideshow advances every seven seconds while visible. Hover and keyboard focus do not stop its clock. Arrow/city controls and touch swipes select photographs manually and restart the seven-second interval. All campus photographs preload; the timer does not wait for image decoding or animation completion. Reduced motion uses immediate image swaps. Without JavaScript, all three photographs appear in sequence.

Hosted pages follow the device's reduced-motion setting unless the visitor explicitly chooses a mode. Open `?motion=full` once to enable and remember full motion in that browser, `?motion=reduce` for reduced motion, or `?motion=system` to follow the device again. This preference applies across the homepage and articles without changing browser/OS settings. Both `file://` and localhost previews start with full motion by default. Storage-blocked browsers still apply a URL choice for the current visit. Old play/pause preference keys remain unused; the removed Replay, Pause animations, and Play slideshow buttons remain absent.

The build runs motion-preference regression checks covering hosted/local defaults, remembered choices, URL overrides, blocked storage, and device changes. Article pages load the shared preference plus their own entrance/reveal script, while keeping the text and original diagrams available without animation.

The opening waits for the title to be visible and the font/render frames to be ready. It pauses if the tab becomes hidden. If the file reopens at a section anchor such as `#about`, scroll to the top to see the pending opening. Versioned motion asset URLs help refreshed previews load the current source.

## Contact behavior

The contact composer opens the visitor's email application with an encoded draft. The visitor reviews and sends it there. It preserves the original mailto mechanism and does not require a server. Both email addresses remain directly accessible.

## GitHub Pages

1. In the GitHub repository, open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the source.
2. Commit all source changes, including new files, removed legacy files, and `.github/workflows/static.yml`, then push to `main`.
3. The **Check and deploy portfolio** workflow checks/builds the site, verifies root/repository paths, and publishes only `dist/`. Pull requests run the same build/checks without deploying. The workflow can also be run manually from Actions.

The workflow reads the actual Pages base URL, so the build works at `https://adembilge.github.io/portfolio/` or a configured custom domain. Internal links and assets are relative. Canonical URLs, social-preview metadata, `robots.txt`, and `sitemap.xml` are rewritten to the configured Pages URL. Configure `adembilge.dev` and HTTPS in Settings → Pages if you want to keep the custom domain; the workflow does not change DNS or domain settings.

Local builds default to `https://adembilge.dev/`. To check the repository URL explicitly in PowerShell:

```powershell
$env:SITE_URL = 'https://adembilge.github.io/portfolio/'
npm run build
npm run test:pages
Remove-Item Env:SITE_URL
npm run preview -- --base=/portfolio/
```

Do not commit `dist/`, local QA artifacts, or `node_modules/`. No credentials need to be added to this repository. See [GitHub's Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Contact

- Email: [firatadem.bilge@gmail.com](mailto:firatadem.bilge@gmail.com)
- LinkedIn: [linkedin.com/in/adembilge](https://www.linkedin.com/in/adembilge/)
- GitHub: [github.com/adembilge](https://github.com/adembilge)

## License

© 2026 Firat Adem Bilge. All rights reserved.

The Politecnico stock still uses the [Pexels license](https://www.pexels.com/license/); the Hacettepe campus photograph uses the [Unsplash license](https://unsplash.com/license). Neither requires displayed attribution. Source records are in `docs/image-sources.md`. Other existing assets retain their original rights.
