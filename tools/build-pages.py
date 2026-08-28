#!/usr/bin/env python3
"""EDITION — poster-editorial rebuild. One shell, six pages.
Ground-up markup: none of the field-notes vocabulary survives here."""
import os

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
BASE = "https://myatgthu.github.io/hello-world.io/"

PAGES = [
    ("index", "Cover"), ("about", "About"), ("work", "Work"),
    ("projects", "Projects"), ("credentials", "Credentials"), ("contact", "Contact"),
]

def head(title, desc, canon):
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>%s</title>
  <meta name="description" content="%s" />
  <meta name="author" content="Myat Thu" />
  <link rel="canonical" href="%s" />
  <meta name="theme-color" content="#f3efe4" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Myat Thu" />
  <meta property="og:url" content="%s" />
  <meta property="og:title" content="%s" />
  <meta property="og:description" content="%s" />
  <meta property="og:image" content="%sassets/og.png" />
  <meta property="og:image:width" content="2400" />
  <meta property="og:image:height" content="1260" />
  <meta property="og:image:alt" content="Myat Thu — IT professional. Intune, Entra ID, cloud. Melbourne." />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="%s" />
  <meta name="twitter:description" content="%s" />
  <meta name="twitter:image" content="%sassets/og.png" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%%2316150f'/><text x='50' y='72' font-size='62' font-family='Arial,sans-serif' font-weight='900' fill='%%23f3efe4' text-anchor='middle'>M</text></svg>" />
  <script>document.documentElement.classList.add('js');try{if(sessionStorage.getItem('nav')){document.documentElement.classList.add('is-arrived');sessionStorage.removeItem('nav');}}catch(e){}</script>
  <link rel="preload" href="assets/fonts/outfit.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="assets/fonts/share-tech-mono.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="styles.css?v=__BUILD__" />
</head>
<body>"""% (title, desc, canon, canon, title, desc, BASE, title, desc, BASE)

def chrome(active, loader=False):
    load = """
  <div class="boot" id="boot" aria-hidden="true">
    <span class="boot__name">MYAT&nbsp;THU</span>
    <span class="boot__pct" id="bootPct">0</span>
  </div>""" if loader else ""

    def tab(slug, label, i):
        cur = ' aria-current="page"' if slug == active else ""
        return '      <a href="%s.html"%s><i>%d</i>%s</a>' % (slug, cur, i, label)

    tabs = "\n".join(tab(s, l, i) for i, (s, l) in enumerate(PAGES[1:], start=2))

    def mrow(slug, label, i):
        cur = ' aria-current="page"' if slug == active else ""
        return '      <li><a href="%s.html"%s><em>0%d</em><span>%s</span></a></li>' % (slug, cur, i, label)

    menu = "\n".join(mrow(s, l, i) for i, (s, l) in enumerate(PAGES, start=1))

    return load + """
  <a class="skip" href="#main">Skip to content</a>
  <div class="dot" aria-hidden="true"><span class="dot__label"></span></div>

  <header class="bar">
    <a class="bar__mark" href="index.html" data-cur="cover">MYAT&nbsp;THU<sup>&reg;</sup></a>
    <nav class="bar__nav" aria-label="Pages">
%s
    </nav>
    <div class="bar__end">
      <a class="bar__status" href="contact.html" data-cur="say hi"><b></b>OPEN&nbsp;TO&nbsp;WORK</a>
      <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="ov" aria-label="Menu"><i></i><i></i></button>
    </div>
  </header>

  <nav class="ov" id="ov" aria-label="Primary" aria-hidden="true">
    <ul class="ov__list">
%s
    </ul>
    <div class="ov__meta">
      <a href="mailto:myatgeorgethu@gmail.com" data-cur="email">myatgeorgethu@gmail.com</a>
      <a href="assets/Myat-Thu-CV.pdf" download data-cur="download">Download CV ↓</a>
      <span>Melbourne, Australia</span>
    </div>
  </nav>
""" % (tabs, menu)

FOOT = """
  <footer class="end">
    <a class="end__cta" href="mailto:myatgeorgethu@gmail.com" data-mag="0.18" data-cur="email">
      <span class="end__k">Say hello</span>
      <span class="end__mail">myatgeorgethu@gmail.com<i>→</i></span>
    </a>
    <div class="end__meta">
      <span>© 2026 Myat Thu</span>
      <span>Melbourne, Australia</span>
      <span>No trackers, no cookies</span>
      <a href="index.html" data-cur="cover">Back to cover ↑</a>
    </div>
  </footer>

  <script src="vendor/gsap.min.js" defer></script>
  <script src="vendor/ScrollTrigger.min.js" defer></script>
  <script src="vendor/lenis.min.js" defer></script>
  <script src="main.js?v=__BUILD__" defer></script>
</body>
</html>
"""

def poster(kicker, lines, sub, extra=""):
    """Full-viewport type poster that opens every page."""
    ln = "\n".join('        <span class="ln"><b data-a="mask">%s</b></span>' % l for l in lines)
    return """
    <section class="poster" data-stock="cream">
      <p class="poster__k" data-a="up">%s</p>
      <h1 class="poster__t">
%s
      </h1>
      <p class="poster__sub" data-a="up">%s</p>%s
      <span class="geo geo--ring" data-px="0.4" data-px-z="-120" aria-hidden="true"></span>
      <span class="geo geo--block" data-px="-0.3" data-px-z="-60" aria-hidden="true"></span>
      <span class="geo geo--cross" data-px="0.6" data-px-z="-180" aria-hidden="true">+</span>
      <a class="poster__cue" href="#next" data-cur="scroll" aria-label="Scroll"><i></i></a>
    </section>
""" % (kicker, ln, sub, extra)

def ticker(words):
    span = "".join("<span>%s</span><b>●</b>" % w for w in words) * 2
    return """
    <div class="tick" aria-hidden="true"><div class="tick__t">%s</div></div>
""" % span

def nxt(href, label):
    return """
    <a class="next" href="%s.html" data-stock="ink" data-cur="next page">
      <span class="next__k" data-a="up">Next</span>
      <span class="next__t" data-a="mask">%s</span>
      <span class="next__a" aria-hidden="true">→</span>
    </a>
""" % (href, label)


# ================================ COVER ================================
INDEX = """
  <main id="main">
""" + poster(
    "IT professional — Melbourne, AU — 2026",
    ["MYAT", "THU"],
    "Microsoft modern workplace. Device management, identity and cloud — tuned for automation and security.",
    """
      <div class="poster__chips" data-a="up">
        <span>Service Desk Analyst</span><span>IPH Limited</span><span>Open to work 2026</span>
      </div>""") + ticker(
    ["Microsoft Intune", "Entra ID", "Windows Autopilot", "Azure", "PowerShell", "Endpoint Security", "Microsoft 365"]) + """
    <section class="index" id="next" data-stock="sun">
      <p class="sec__k" data-a="up">Index</p>
      <nav class="index__list" aria-label="Site index">
        <a class="row" href="about.html" data-px-z="-40" data-cur="open">
          <em>01</em><strong data-a="mask">About</strong><span>The person &amp; the brief</span><i>→</i>
        </a>
        <a class="row" href="work.html" data-px-z="-70" data-cur="open">
          <em>02</em><strong data-a="mask">Work</strong><span>Four roles, seven years</span><i>→</i>
        </a>
        <a class="row" href="projects.html" data-px-z="-100" data-cur="open">
          <em>03</em><strong data-a="mask">Projects</strong><span>Case files &amp; the lab</span><i>→</i>
        </a>
        <a class="row" href="credentials.html" data-px-z="-130" data-cur="open">
          <em>04</em><strong data-a="mask">Credentials</strong><span>Four certs, one in flight</span><i>→</i>
        </a>
        <a class="row" href="contact.html" data-px-z="-160" data-cur="open">
          <em>05</em><strong data-a="mask">Contact</strong><span>Replies within a day</span><i>→</i>
        </a>
      </nav>
    </section>

    <section class="nums" data-stock="persimmon" aria-label="By the numbers">
      <div class="num" data-a="up"><b data-count="400" data-suffix="+">400+</b><span>Retail stores kept running</span></div>
      <div class="num" data-a="up"><b data-count="50" data-suffix="/day">50/day</b><span>Tickets cleared at peak</span></div>
      <div class="num" data-a="up"><b data-count="2" data-suffix="nd">2nd</b><span>Level escalation for the desk</span></div>
      <div class="num" data-a="up"><b data-count="4" data-suffix="">4</b><span>Microsoft &amp; Google certs</span></div>
    </section>

    <section class="now" data-stock="moss">
      <p class="sec__k" data-a="up">Now</p>
      <p class="now__t" data-a="mask">Studying SC-300 —</p>
      <p class="now__t now__t--b" data-a="mask">identity &amp; access.</p>
      <p class="now__d" data-a="up">Deepening Entra ID, conditional access and identity governance in a live lab tenant.</p>
    </section>
""" + nxt("about", "About") + """  </main>
"""

# ================================ ABOUT ================================
ABOUT = """
  <main id="main">
""" + poster(
    "About — the person",
    ["BEYOND", "THE DESK"],
    "IT professional by day. Microsoft ecosystem specialist — moved past traditional support into automation and security.") + """
    <section class="lead" id="next" data-stock="sun">
      <p class="sec__k" data-a="up">Who</p>
      <p class="lead__t" data-words>
        I keep a modern workplace running — Intune and Entra ID for device and
        identity, Microsoft 365 end to end, and the automation that makes it
        quietly resilient. I fix it once, then I write it down.
      </p>
    </section>

    <section class="grid4" data-stock="persimmon" aria-label="The brief, for hiring managers">
      <p class="sec__k" data-a="up">The brief</p>
      <div class="grid4__g">
        <div class="cell" data-a="up"><em>01</em><h3>Scale under pressure</h3><p>400+ stores, 40–50 tickets a day, holiday cover included. Volume doesn't rattle him.</p></div>
        <div class="cell" data-a="up"><em>02</em><h3>Trusted escalation</h3><p>Second-level point for the IPH desk; earlier L3 network exposure at a Telstra-partner MSP.</p></div>
        <div class="cell" data-a="up"><em>03</em><h3>Device lifecycle</h3><p>SOE builds, imaging, onboarding to offboarding — the endpoint from box to retirement.</p></div>
        <div class="cell" data-a="up"><em>04</em><h3>Writes it down</h3><p>KBAs, rollout playbooks, Change Board, annual audits. The fix that stays fixed.</p></div>
      </div>
      <p class="grid4__note" data-a="up">Next seat: endpoint engineering. SC-300 in progress; conditional access already live in the lab.</p>
    </section>
""" + ticker(["Dota 2", "EA Sports FC", "Superhero films", "Comfort TV", "Claude Code", "Saturday football"]) + """
    <section class="cards" data-stock="cream" aria-label="Off the clock">
      <p class="sec__k" data-a="up">Off the clock</p>
      <div class="cards__g">
        <article class="card" data-a="up"><em>A</em><h3>Dota 2</h3><p>The ranked grind — team fights and the occasional 60-minute nail-biter.</p><span>Valve · Steam</span></article>
        <article class="card" data-a="up"><em>B</em><h3>EA Sports FC</h3><p>Ultimate Team squads and career mode for nights off the pitch.</p><span>EA Sports</span></article>
        <article class="card" data-a="up"><em>C</em><h3>Superhero films</h3><p>Marvel and DC on the big screen, watchlist always growing.</p><span>Opening night</span></article>
        <article class="card" data-a="up"><em>D</em><h3>Comfort TV</h3><p>Supernatural, TBBT, HIMYM, Brooklyn Nine-Nine on rotation.</p><span>Background</span></article>
        <article class="card" data-a="up"><em>E</em><h3>Claude Code</h3><p>Agentic coding after hours — automating the dull bits.</p><span>Ongoing</span></article>
        <article class="card" data-a="up"><em>F</em><h3>Saturday football</h3><p>Pickup games at Monash Sport, every week.</p><span>Weekly</span></article>
      </div>
    </section>

    <section class="cards cards--3" data-stock="moss" aria-label="Leveling up">
      <p class="sec__k" data-a="up">Leveling up</p>
      <div class="cards__g">
        <article class="card card--hot" data-a="up"><em>★</em><h3>SC-300</h3><p>Identity &amp; Access Administrator — current study focus.</p><span>In progress</span></article>
        <article class="card" data-a="up"><em>+</em><h3>New tech</h3><p>Reading, labs and courses across the Microsoft cloud stack.</p><span>Always</span></article>
        <article class="card" data-a="up"><em>%</em><h3>Markets</h3><p>A daily read of finance news — tech and the bigger picture.</p><span>Daily</span></article>
      </div>
    </section>
""" + nxt("work", "Work") + """  </main>
"""

# ================================ WORK ================================
ROLES = [
    ("May 2025 — now", "Service Desk Analyst", "IPH Limited", "Melbourne", [
        "Second-level escalation point, guiding the desk",
        "Laptop and device builds to SOE",
        "Active Directory and modern endpoint support",
        "IT projects, change management, on-call",
    ]),
    ("2023 — 2025", "IT Support Analyst", "The Reject Shop", "Melbourne", [
        "L1–2 for 400+ stores; 40–50 tickets a day",
        "AD, Exchange, Teams and M365 end to end",
        "Imaging, onboarding, hardware remediation",
        "Dock replacement rollout — wrote the playbook",
    ]),
    ("2022", "Support Engineer", "Azured Consulting", "Australia", [
        "Service desk for a Telstra cloud partner MSP",
        "L3 network and firewall configuration",
        "Client cloud environments and M365 accounts",
    ]),
    ("2019 — 2024", "Office Support Assistant", "MYER", "Australia", [
        "Store operations and end-of-day reporting",
        "Online returns, POS, team training",
    ]),
]

def role_block(i, r):
    yr, title, org, loc, pts = r
    lis = "\n".join("          <li>%s</li>" % p for p in pts)
    return """      <article class="job" data-a="up">
        <header class="job__h">
          <em>0%d</em>
          <h3 data-a="mask">%s</h3>
          <p class="job__org">%s <span>· %s · %s</span></p>
        </header>
        <ul class="job__pts">
%s
        </ul>
      </article>""" % (i, title, org, loc, yr, lis)

WORK = """
  <main id="main">
""" + poster(
    "Work — four roles",
    ["SEVEN", "YEARS"],
    "From the MYER shop floor to second-level escalation at IPH Limited — a 400-store fleet, an MSP's cloud clients, a legal-sector desk.") + """
    <section class="jobs" id="next" data-stock="sun">
      <p class="sec__k" data-a="up">Roles</p>
""" + "\n".join(role_block(i + 1, r) for i, r in enumerate(ROLES)) + """
    </section>

    <section class="list" data-stock="persimmon" aria-label="Capabilities">
      <p class="sec__k" data-a="up">Capabilities</p>
      <div class="list__rows">
        <div class="lrow" data-a="up"><strong>Intune &amp; Endpoint</strong><span>MDM/MAM · compliance · SOE</span></div>
        <div class="lrow" data-a="up"><strong>Entra ID &amp; Identity</strong><span>Conditional access · provisioning</span></div>
        <div class="lrow" data-a="up"><strong>Microsoft 365</strong><span>Exchange · Teams · admin</span></div>
        <div class="lrow" data-a="up"><strong>Cloud &amp; Azure</strong><span>Tenant maintenance · AD</span></div>
        <div class="lrow" data-a="up"><strong>Service Desk &amp; ITSM</strong><span>SLAs · escalation · KBAs</span></div>
        <div class="lrow" data-a="up"><strong>Security &amp; Compliance</strong><span>Audits · risk · response</span></div>
      </div>
    </section>

    <section class="grid4" data-stock="moss" aria-label="How I work">
      <p class="sec__k" data-a="up">Method</p>
      <div class="grid4__g">
        <div class="cell" data-a="up"><em>01</em><h3>Cut to the real issue</h3><p>Read past the wording; diagnose before touching a fix.</p></div>
        <div class="cell" data-a="up"><em>02</em><h3>Knowledge first</h3><p>KBAs, past tickets, approved AI tools — before reinventing.</p></div>
        <div class="cell" data-a="up"><em>03</em><h3>Escalate cleanly</h3><p>Beyond L2 it moves up with context already gathered.</p></div>
        <div class="cell" data-a="up"><em>04</em><h3>Close &amp; document</h3><p>Resolve in SLA, confirm, write it up for the next person.</p></div>
      </div>
    </section>

    <section class="chips" data-stock="cream" aria-label="Toolbox">
      <p class="sec__k" data-a="up">Toolbox</p>
      <div class="chips__c">
        <span class="chip" data-a="up">Microsoft Intune</span><span class="chip" data-a="up">Entra ID</span>
        <span class="chip" data-a="up">Microsoft 365</span><span class="chip" data-a="up">Azure</span>
        <span class="chip" data-a="up">Active Directory</span><span class="chip" data-a="up">Defender</span>
        <span class="chip" data-a="up">Teams</span><span class="chip" data-a="up">Exchange Online</span>
        <span class="chip" data-a="up">Autopilot</span><span class="chip" data-a="up">PowerShell</span>
        <span class="chip" data-a="up">Windows 11</span>
      </div>
    </section>
""" + nxt("projects", "Projects") + """  </main>
"""

# ================================ PROJECTS ================================
CASES = [
    ("01", "Endpoint · Rollout", "Dock standardisation",
     "Retail docks were failing constantly across the estate.",
     "Stop the stream of failing, costly docks across 400+ stores.",
     "Replaced docks with daisy-chained hub monitors; wrote the rollout playbook.",
     "Simpler desks, far fewer failures, a process anyone could run."),
    ("02", "ITSM · Knowledge", "Service-desk playbook",
     "The desk leaned on memory; the same issues kept returning.",
     "Turn tribal knowledge into a consistent, documented process.",
     "Documented SOPs, KBAs and escalation paths; became the L2 point.",
     "Faster resolutions and a knowledge base new starters pick up quickly."),
    ("03", "Identity · Devices", "Modern device builds",
     "Builds and access were manual and inconsistent.",
     "Secure, standardised devices with day-one access.",
     "SOE builds, AD and M365 admin, joiner/leaver end to end.",
     "Compliant endpoints and a tidy account lifecycle."),
]

def case_block(c):
    no, tag, title, ctx, obj, role, out = c
    return """      <article class="case" data-a="up">
        <header class="case__h"><em>%s</em><span>%s</span></header>
        <h3 data-a="mask">%s</h3>
        <p class="case__ctx">%s</p>
        <dl class="case__d">
          <div><dt>Objective</dt><dd>%s</dd></div>
          <div><dt>Role</dt><dd>%s</dd></div>
          <div><dt>Outcome</dt><dd>%s</dd></div>
        </dl>
      </article>""" % (no, tag, title, ctx, obj, role, out)

PROJECTS = """
  <main id="main">
""" + poster(
    "Projects — owned end to end",
    ["THE", "PROOF"],
    "Three case files and a standing lab. Find what broke, fix it once, write it down.") + """
    <section class="casefiles" id="next" data-stock="sun">
      <p class="sec__k" data-a="up">Case files</p>
""" + "\n".join(case_block(c) for c in CASES) + """
    </section>

    <section class="grid4" data-stock="moss" aria-label="Home lab">
      <p class="sec__k" data-a="up">The lab</p>
      <div class="grid4__g">
        <div class="cell" data-a="up"><em>01</em><h3>M365 dev tenant</h3><p>Conditional access and policy testing away from production.</p></div>
        <div class="cell" data-a="up"><em>02</em><h3>Entra ID &amp; Intune</h3><p>Identity governance and endpoint policy, straight off the SC-300 syllabus.</p></div>
        <div class="cell" data-a="up"><em>03</em><h3>Azure account</h3><p>Standing up resources to learn how the pieces fit.</p></div>
        <div class="cell" data-a="up"><em>04</em><h3>VMs &amp; PowerShell</h3><p>Hyper-V and Sandbox for break-fix; scripts for the repetitive bits.</p></div>
      </div>
    </section>
""" + nxt("credentials", "Credentials") + """  </main>
"""

# ================================ CREDENTIALS ================================
CREDENTIALS = """
  <main id="main">
""" + poster(
    "Credentials — earned working full-time",
    ["SEALED"],
    "MD-102, AZ-900, SC-900 and Google IT Support — with SC-300 in progress, backed by a live lab, not flashcards.") + """
    <section class="seals" id="next" data-stock="sun">
      <p class="sec__k" data-a="up">Certifications</p>
      <div class="seals__g">
        <article class="seal" data-a="up" data-px-z="-40"><b>MD-102</b><h3>Endpoint Administrator</h3><p>Intune, Autopilot, compliance, app delivery.</p><span>Microsoft</span></article>
        <article class="seal" data-a="up" data-px-z="-70"><b>AZ-900</b><h3>Azure Fundamentals</h3><p>Core cloud concepts, services, governance.</p><span>Microsoft</span></article>
        <article class="seal" data-a="up" data-px-z="-100"><b>SC-900</b><h3>Security &amp; Identity</h3><p>Zero Trust, Entra ID, Defender, Purview.</p><span>Microsoft</span></article>
        <article class="seal" data-a="up" data-px-z="-130"><b>IT</b><h3>IT Support Professional</h3><p>Networking, OS, sysadmin, security.</p><span>Google</span></article>
      </div>
      <p class="seals__note" data-a="up">SC-300 · Identity &amp; Access Administrator — in progress.</p>
    </section>

    <section class="list" data-stock="persimmon" aria-label="Education">
      <p class="sec__k" data-a="up">Study</p>
      <div class="list__rows">
        <div class="lrow" data-a="up"><strong>BBus, Information Systems</strong><span>RMIT University · 2019—2021</span></div>
        <div class="lrow" data-a="up"><strong>Diploma, IT</strong><span>RMIT University · 2018</span></div>
        <div class="lrow" data-a="up"><strong>Foundation, IT</strong><span>Trinity College, UniMelb · 2016—2017</span></div>
      </div>
    </section>
""" + nxt("contact", "Contact") + """  </main>
"""

# ================================ CONTACT ================================
CONTACT = """
  <main id="main">
    <section class="poster poster--contact" data-stock="persimmon">
      <p class="poster__k" data-a="up"><b class="pulse"></b> Available — 2026</p>
      <h1 class="poster__t">
        <span class="ln"><b data-a="mask">LET'S</b></span>
        <span class="ln"><b data-a="mask">WORK.</b></span>
      </h1>
      <a class="poster__mail" href="mailto:myatgeorgethu@gmail.com" data-mag="0.2" data-cur="email">myatgeorgethu@gmail.com <i>→</i></a>
      <div class="poster__chips" data-a="up">
        <span>Full-time &amp; contract</span><span>Melbourne, AU</span><span>Replies within a day</span>
      </div>
      <p class="poster__cv" data-a="up"><a href="assets/Myat-Thu-CV.pdf" download data-cur="download">Download CV ↓</a></p>
      <span class="geo geo--ring" data-px="0.4" data-px-z="-120" aria-hidden="true"></span>
      <span class="geo geo--cross" data-px="0.6" data-px-z="-180" aria-hidden="true">+</span>
    </section>
""" + nxt("index", "Cover") + """  </main>
"""

def build():
    pages = {
        "index.html": ("Myat Thu — Modern Workplace & Cloud",
                       "Myat Thu — IT professional in the Microsoft ecosystem: Intune, Entra ID, cloud. Melbourne, Australia.",
                       BASE, "index", True, INDEX),
        "about.html": ("About — Myat Thu",
                       "The person and the brief — scale, escalation, device lifecycle, documentation. Plus how he switches off.",
                       BASE + "about.html", "about", False, ABOUT),
        "work.html": ("Work — Myat Thu",
                      "Seven years, four roles: MYER, Azured Consulting, The Reject Shop, IPH Limited.",
                      BASE + "work.html", "work", False, WORK),
        "projects.html": ("Projects — Myat Thu",
                          "Case files and the home lab — dock standardisation, the desk playbook, modern device builds.",
                          BASE + "projects.html", "projects", False, PROJECTS),
        "credentials.html": ("Credentials — Myat Thu",
                             "MD-102, AZ-900, SC-900, Google IT Support. SC-300 in progress. RMIT and Trinity.",
                             BASE + "credentials.html", "credentials", False, CREDENTIALS),
        "contact.html": ("Contact — Myat Thu",
                         "Open to full-time and contract in Melbourne. Usually replies within a day.",
                         BASE + "contact.html", "contact", False, CONTACT),
    }
    for fname, (title, desc, canon, active, loader, main) in pages.items():
        html = head(title, desc, canon) + chrome(active, loader) + main + FOOT
        open(os.path.join(REPO, fname), "w").write(html)
        print("wrote %s (%d bytes)" % (fname, len(html)))

if __name__ == "__main__":
    build()
