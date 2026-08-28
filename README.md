# Myat Thu — Edition

Portfolio of **Myat Thu**, an IT professional in the Microsoft modern
workplace (Intune, Entra ID, cloud administration). A static multi-page site
deployed to GitHub Pages.

**Live:** https://myatgthu.github.io/resume.io/

## The design

Poster-editorial. One geometric sans (Outfit) set enormous, and five flat
warm paper stocks — cream, sun, persimmon, moss, ink — that the whole page
presses through as you scroll: the stock tokens are registered custom
properties, so a section crossing the middle of the viewport re-inks the
entire page in one animated swap. Thick rules, hard edges, offset-block
shadows, uppercase display type, mono labels.

Depth comes from a three-part parallax vocabulary (`data-px`, `data-px-x`,
`data-px-z`): floating geometry and index rows start pushed into the page and
surface as they cross the viewport, and the poster shapes also lean with the
pointer. Entrances are one class flip driven by ScrollTrigger with CSS owning
the easing — line-masked headlines, rise-ins, scroll-scrubbed word reveals,
velocity-reactive tickers, magnetic CTAs, and a flat difference-blend cursor.

Every masthead tab is a real page: Cover, About, Work, Projects, Credentials,
Contact, chained end-to-end by a NEXT block on every page. Navigation uses
native cross-document View Transitions where supported. Scrollbars are hidden
on both axes; a thick accent progress bar (CSS scroll timeline) keeps
orientation.

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

Reduced motion gets every word with no entrances, no tickers and brisk
colour fades. The site is fully readable without JavaScript. Interactive
elements are keyboard reachable with visible focus; stock pairs hold
readable contrast for body text.

## Notes

- Personal data is limited to name, location, and email on purpose.
- The CV PDF in `assets/` is the authoritative source for role history.
