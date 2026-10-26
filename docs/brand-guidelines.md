# Firat Adem Bilge: portfolio identity

## Position

Software engineer working across AI engineering, applied machine learning, backend systems, distributed data processing, and cloud infrastructure. The intended readers are recruiters, engineering managers, and technical collaborators. The navigation brand reads Adem.

The name leads the opening screen; the profession and a concrete explanation follow immediately. Project interfaces, production experience, and published research support the identity. Avoid freelance design positioning, invented testimonials, and unverified project results.

The profession line rotates through Software Engineer, Data Scientist, AI Engineer, and Applied Researcher. These describe the portfolio's areas of work; the About section clearly grounds the profile in current Master's studies and past engineering experience. The first title remains readable without JavaScript. Reduced motion keeps the selected title still, and assistive technology receives one stable description containing all four titles. A visitor can explicitly enable full motion using `?motion=full`; this choice is remembered without changing device settings or adding the removed animation buttons.

## Voice

Use first-person, plain English. Prefer specific systems, problems, and outcomes to superlatives. Summaries should help a reader understand a project in one paragraph; technical disclosures carry the original implementation detail. Preserve dates, institutions, role titles, citations, and professional links.

## Visual system

| Role | Value |
| --- | --- |
| Charcoal | `#191c19` |
| Ivory | `#f0f0e9` |
| Sage accent | `#c4d6a4` |
| Soft light surface | `#e3e5dc` |
| Dark surface | `#252a25` |
| Secondary text on light | `#4c5348` |
| Secondary text on dark | `#b6bcb3` |
| Typeface | Schibsted Grotesk, self-hosted variable WOFF2 |

The CSS is the implementation source of truth. Primitive colors map to semantic page roles and component roles. Display, heading, lead, body, and small-text tokens establish the primary hierarchy; mobile control sizes and proof figures have explicit adaptations.

Use square media and button corners, flat fields of color, generous section spacing, and equal outer gutters. The name is large, while body copy retains a comfortable measure. Put the source image first when it helps explain the work. Never fabricate an application screenshot.

## Layout and motion

Desktop uses a broad name band, split portrait opening, varied project compositions, experience rows, and image-led education and research. Tablet headings get a full-width row. Mobile uses a single reading column, a two-by-two screenshot selector, native disclosures, and a full-height navigation index. Very narrow layouts stack proof figures and labels.

Keep the charcoal navigation visible while scrolling. Its two-pixel sage line shows reading progress from left to right; this functional indicator is an explicit user-requested exception to the original no-thin-rules direction. Section anchors account for the header's actual height. Expanded project overviews use two balanced columns on desktop and one column on tablet/mobile. Disclosures open and close smoothly, with immediate changes for reduced motion. The About caption has 26 px of space below its separate photo frame.

Use native scrolling. Hero type enters through a mask; headings and copy arrive with short staggered movement; media settles into place; rows arrive from the side. Interaction feedback stays quicker than section entrances. Animate transforms and opacity and preserve reading order. Hosted pages honor reduced motion; local file previews show the opening by default. The education slideshow rotates every seven seconds while visible, using immediate image swaps for reduced motion. Keep scrolling under the visitor's control.

## Assets

Project screenshots, article imagery, research imagery, and most photographs come from the original repository. Optimized WebP assets live in `images/editorial/`; unused originals and duplicates were removed during repository cleanup. Education uses an authentic Politecnico courtyard stock still, Hacettepe Beytepe campus stock photo, and the Czestochowa campus photograph. The unused watermarked Politecnico background has been removed.

The opening portrait uses its original color. Project presentation frames and experience rows reuse the original Freelance Background, e1, a1, and ulak photographs through grayscale decorative layers. Keep their opacity low enough for clear text and controls.

Schibsted Grotesk is redistributed with `fonts/OFL.txt`; its upstream source is [Google Fonts](https://github.com/google/fonts/tree/main/ofl/schibstedgrotesk). Newly sourced campus photographs require no displayed attribution; see `docs/image-sources.md` for license records.
