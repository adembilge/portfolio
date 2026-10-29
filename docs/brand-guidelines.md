# Firat Adem Bilge: portfolio identity

## Position

AI engineer and software engineer working across AI engineering, applied machine learning, backend systems, distributed data processing, and cloud infrastructure. The intended readers are recruiters, engineering managers, and technical collaborators. The navigation brand reads Adem, with a short brown underline.

The name leads the opening screen; the profession and a concrete explanation follow immediately. Project interfaces, production experience, and published research support the identity. Avoid freelance design positioning, invented testimonials, and unverified project results.

The profession line rotates through AI Engineer, Software Engineer, and Applied Researcher. These describe the portfolio's areas of work; the About section clearly grounds the profile in current Master's studies and past engineering experience. The first title remains readable without JavaScript. Reduced motion keeps the selected title still, and assistive technology receives one stable description containing all three titles. A visitor can explicitly enable full motion using `?motion=full`; this choice is remembered without changing device settings or adding the removed animation buttons.

## Voice

Use first-person, plain English or natural Italian. Prefer specific systems, problems, and outcomes to superlatives. Summaries should help a reader understand a project in one paragraph; technical disclosures carry the original implementation detail. Preserve dates, institutions, role meanings, and professional links. The Italian homepage includes all personal copy and interactive messages. Brand names and technical identifiers retain their original spelling.

## Visual system

| Role | Value |
| --- | --- |
| Espresso | `#211a17` |
| Cream | `#f4ede4` |
| Warm tan accent | `#c99d75` |
| Soft light surface | `#ece0d3` |
| Dark surface | `#30251f` |
| Secondary text on light | `#665247` |
| Secondary text on dark | `#c7b6a6` |
| Typeface | Schibsted Grotesk, self-hosted variable WOFF2 |

The CSS is the implementation source of truth. Primitive colors map to semantic page roles and component roles. Display, heading, lead, body, and small-text tokens establish the primary hierarchy; mobile control sizes and proof figures have explicit adaptations.

`css/preferences.css` extends this palette into two complete modes. Dark uses espresso grounds, cream text, and warm tan actions. Light uses cream grounds, espresso text, and rich brown (`#805438`) actions with cream text. Chapter surfaces keep subtle tonal differences in both modes. The shared header exposes the EN/IT link. A sun/moon icon button switches the theme inside the menu only. Theme choice is local to the browser, and the language URL remains explicit. Static Italian pages work without scripting.

Use square media and button corners, flat fields of color, generous section spacing, and equal outer gutters. The name is large, while body copy retains a comfortable measure. Put the source image first when it helps explain the work. Never fabricate an application screenshot.

## Layout and motion

Desktop uses a broad name band, split portrait opening, varied project compositions, experience rows, and image-led education and research. Tablet headings get a full-width row. Mobile uses a single reading column, a two-by-two screenshot selector, native disclosures, and a full-height navigation index. Very narrow layouts stack proof figures and labels.

Keep the espresso navigation visible while scrolling. Its two-pixel brown line shows reading progress from left to right; this functional indicator is an explicit user-requested exception to the original no-thin-rules direction. Section anchors account for the header's actual height. Expanded project overviews use two balanced columns on desktop and one column on tablet/mobile. Disclosures open and close smoothly, with immediate changes for reduced motion. The About caption has 26 px of space below its separate photo frame.

Use native scrolling. Hero type enters through a mask; headings and copy arrive with short staggered movement; media settles into place; rows arrive from the side. Interaction feedback stays quicker than section entrances. Animate transforms and opacity and preserve reading order. Hosted pages honor reduced motion; local file previews show the opening by default. The education slideshow rotates every seven seconds while visible. Opening Study or Coursework locks it to the matching university; closing resumes unless another pause condition applies. Manual pause, hover, focus, hidden pages, and reduced motion stop rotation. Keep scrolling under the visitor's control.

## Assets

Project screenshots, research imagery, and most photographs come from the original repository. Optimized WebP assets live in `images/editorial/`; unused originals and duplicates were removed during repository cleanup. Education uses an authentic Politecnico courtyard stock still, Hacettepe Beytepe campus stock photo, and the Czestochowa campus photograph. The unused watermarked Politecnico background has been removed.

The opening portrait uses the latest user-provided clipboard portrait (29 October 2026) in its original color, resized into 480/960 WebP and a JPEG fallback. The introduction adapts to viewport height, retaining readable overflow on short screens. Job and research controls are exclusive per card; education controls are exclusive across universities. Project presentation frames and experience rows reuse the original Freelance Background, e1, a1, and ulak photographs through grayscale decorative layers. Keep their opacity low enough for clear text and controls.

Schibsted Grotesk is redistributed with `fonts/OFL.txt`; its upstream source is [Google Fonts](https://github.com/google/fonts/tree/main/ofl/schibstedgrotesk). Newly sourced campus photographs require no displayed attribution; see `docs/image-sources.md` for license records.
