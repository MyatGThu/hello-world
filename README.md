# The Melbourne Endpoint

Portfolio of **Myat Thu**, an IT professional in the Microsoft modern
workplace (Intune, Entra ID, cloud administration), published as a single
broadsheet page and deployed to GitHub Pages.

**Live:** https://myatgthu.github.io/resume.io/

## The design

One newspaper, read top to bottom. There are no separate pages: the
nameplate, the front page, and every section after it live on one sheet,
and the burger overlay scrolls rather than navigates.

Myat is the headline — his name is set as the lead story under a standfirst
and byline, and the rest of the paper reports on it: **The record** (four
roles on a spine of circular company medallions that link out to each
employer), **Field reports** (three case files, each with an isometric
engraving and a cutline), **Public notices** (four certification seals that
open a framed detail overlay), **At the desk**, and **Situations wanted**.

Four compositional devices carry the layout:

- **Circular** — the halftone portrait in its concentric rings, the company
  medallions, the certification seals with type set on a circular path, and
  the rotating "open to work" rubber stamp.
- **Leading lines** — column rules, the vertical spine the medallions hang
  from, and the dashed leaders inside the engravings.
- **Frames within a frame** — the page rule inside the sheet, boxed sidebars
  inside the page rule, plates inside figures, and the notice overlay above
  it all.
- **Symmetry** — the centred nameplate over its three-cell ear bar, mirrored
  section flags, and the symmetric rows of numbers and seals.

Black and white throughout: warm newsprint (`#fbfaf7`) on a paper-desk grey,
near-black ink, one grey for secondary type, and a faint newsprint tooth over
the sheet. Times for display, Georgia for body copy, Share Tech Mono for
datelines and labels.

**Off the press.** Opening the site runs the newsreel trick: a miniature
front page spins in from depth, lands square, and dissolves into the live
page — the splash *is* the loading screen. It can be skipped, it never traps
the reader (it clears itself on a timer), and reduced motion goes straight to
the paper.

## Stack

Vanilla HTML/CSS/JS in three files. GSAP + ScrollTrigger and Lenis only — no
build step, no framework, no WebGL.

```
index.html            # the whole paper
styles.css            # the design system
main.js               # press intro, entrances, notices overlay, cursor
assets/               # portrait, logos, CV, self-hosted fonts
vendor/               # GSAP, ScrollTrigger, Lenis
.github/workflows/    # GitHub Pages deployment
.claude/skills/       # Claude Code skills used while building
```

## Accessibility

Reduced motion gets every word with no press intro and no entrances. The
paper is fully readable without JavaScript. Seals are keyboard-reachable
buttons, the notice overlay is a labelled dialog that closes on Escape and
returns focus, and the ink-on-paper pair holds strong contrast throughout.
The sheet also prints cleanly.

## Notes

- Personal data is limited to name, location, and email on purpose.
- The CV PDF in `assets/` is the authoritative source for role history.
- Certification links point at the official certification pages; swap in
  personal verification links if you want the seals to prove the badge.
