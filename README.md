# Myat Thu — Field Notes

Portfolio of **Myat Thu**, an IT professional in the Microsoft modern workplace
(Intune, Entra ID, cloud administration). A static multi-page site deployed to
GitHub Pages.

**Live:** https://myatgthu.github.io/resume.io/

## The concept

An engineer's field notebook from 2077. The site draws a living machine in
pencil: a raymarched blob of liquid graphite that solidifies into a different
sketched artifact on every page (a gyroscopic machine on the cover, a headset,
a keyboard, a spinning disc, a terminal you can dent, a floppy disk and USB
stick). Between forms it is liquid. When you scroll fast, or while a shape is
undecided, the page splits into two neon timelines (cyan and magenta) that
collapse back into one form when you stop. That collapse is the argument of
the whole site: many possible configurations, one standard result, which is
what an SOE engineer does for a living.

Three styles are combined deliberately:

- **Pencil sketch**: cross-hatched WebGL shading with a hand wobble stepped to
  about 5 fps, hand-drawn borders, taped photos, dashed schematic callouts.
- **Editorial**: Bodoni Moda display type, folios and plate numbers, a
  magazine table of contents, standfirsts, double rules.
- **Cyberpunk**: neon interference ghosts, chromatic text divergence under
  scroll velocity, scanlined blackboard menu.

## Pages

Each tab in the masthead is a real page, not an anchor:

| Page | Plate | The machine casts |
| --- | --- | --- |
| `index.html` | Cover and contents | The gyro machine |
| `about.html` | The Person | Headset |
| `work.html` | The Orbit | Spinning disc, then keyboard |
| `projects.html` | The Proof | Terminal (click the lab section to dent it) |
| `credentials.html` | The Seals | Floppy disk and USB stick |
| `contact.html` | Connect | Mirror puddle |

Navigation between pages uses cross-document View Transitions where the
browser supports them, with a wipe fallback elsewhere.

## Stack

Vanilla HTML/CSS/JS. No build step for the site itself; the six pages are
assembled by one generator script so the shared masthead, menu and footer can
never drift apart.

- **Three.js** (custom minimal build) renders one fullscreen fragment shader:
  SDF metaballs and artifact models, cross-hatch NPR shading, click impacts,
  and the divergence ghosts.
- **GSAP + ScrollTrigger** drive reveals, the toolbox switchback, counters and
  the velocity marquee.
- **Lenis** provides inertia scrolling.
- **Anime.js** handles letter cascades and the chapter caption.
- Scroll progress and page transitions run on native CSS (scroll timelines,
  `@view-transition`) where supported.

## Structure

```
index.html ...        # six pages, one shared shell
styles.css            # tokens (paper/graphite/neon) + sketch revision layer
main.js               # motion modules; every one degrades without JS
mercury.js            # the raymarched machine
assets/fonts/         # self-hosted Outfit, Bodoni Moda, Share Tech Mono
vendor/               # GSAP, ScrollTrigger, Lenis, Anime.js, Three.js build
.github/workflows/    # GitHub Pages deployment
.claude/skills/       # Claude Code skills used to build and review the site
```

## Accessibility

`prefers-reduced-motion` disables the canvas, the loader and all scroll
choreography while keeping every word readable. The site works without
JavaScript. Interactive elements are keyboard reachable, and body copy sits on
a soft paper scrim wherever the drawing passes behind it.

## Notes

- Personal data is limited to name, location, and email on purpose.
- The CV PDF in `assets/` is the authoritative source for role history.
