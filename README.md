# Myat Thu — Edition

Portfolio of **Myat Thu**, an IT professional in the Microsoft modern
workplace (Intune, Entra ID, cloud administration). A static multi-page site
deployed to GitHub Pages.

**Live:** https://myatgthu.github.io/resume.io/

## The design

Poster-editorial in black and white. One geometric sans (Outfit) set
enormous on warm off-white paper with near-black ink — no colour anywhere,
so the typography and the rules do all the work. Thick rules, hard edges,
offset-block shadows, uppercase display type, mono labels; hovers invert
(ink block, paper type) or underline instead of recolouring.

Depth comes from a three-part parallax vocabulary (`data-px`, `data-px-x`,
`data-px-z`): floating geometry and index rows start pushed into the page and
surface as they cross the viewport, and the poster shapes also lean with the
pointer. Entrances are one class flip driven by ScrollTrigger with CSS owning
the easing — line-masked headlines, rise-ins, scroll-scrubbed word reveals,
velocity-reactive tickers, magnetic CTAs, and a flat difference-blend cursor.

Six real pages — Cover, About, Work, Projects, Credentials, Contact —
chained end-to-end by a NEXT block on every page, with the burger overlay as
the single menu. Work rows carry each employer's mark as a clickable chip
that opens the company site in a new tab. Every project case ships a static
isometric line diagram — boxes projected by a tiny SVG toolkit in the page
generator — that draws the build like an engineering plate. Credential seals
open an overlay that explains the certification, maps where it works in each
role, and links to the official certification page. Navigation uses native
cross-document View Transitions where supported. Scrollbars are hidden on
both axes; a thin ink progress bar (CSS scroll timeline) keeps orientation.

## Stack

Vanilla HTML/CSS/JS. GSAP + ScrollTrigger and Lenis only — no WebGL, no
other runtime dependencies. The six pages are assembled by one generator
(`tools/build-pages.py`) so the shared shell can never drift.

```
index.html ...        # six pages, one shared shell
styles.css            # the whole design system, written from scratch
main.js               # motion modules; every one degrades without JS
assets/fonts/         # self-hosted Outfit + Share Tech Mono
vendor/               # GSAP, ScrollTrigger, Lenis
.github/workflows/    # GitHub Pages deployment
.claude/skills/       # Claude Code skills used while building
```

## Accessibility

Reduced motion gets every word with no entrances and no tickers. The site
is fully readable without JavaScript. Interactive elements are keyboard
reachable with visible focus — credential seals are buttons, the overlay is
a labelled dialog that closes on Escape and returns focus — and the
ink-on-paper pair holds strong contrast everywhere.

## Notes

- Personal data is limited to name, location, and email on purpose.
- The CV PDF in `assets/` is the authoritative source for role history.
