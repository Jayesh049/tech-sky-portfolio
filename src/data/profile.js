// Content taken from jayesh049.github.io/portfolio and the resume behind it.
export const profile = {
  name: 'Jayesh Singh',
  first: 'Jayesh',
  role: 'Full-Stack Engineer',
  available: 'Open to new roles',
  heroLine: 'One developer, the whole problem.',
  heroSub:
    'I write the code, read the numbers behind it, work the ticket queue and take the client call while the thing is still broken. System design, OOP and data structures underneath, so what ships is structured instead of stitched together.',
  aboutHead: 'Breadth is only worth anything when the fundamentals hold.',
  about: [
    'Most days I am somewhere between a feature branch and a support ticket. Enterprise inspection workflows, approval chains, and the database underneath them. Angular and Node on one screen, Oracle and MySQL on the other. I read the query plan before I blame the network, and I get on the call with the client myself rather than waiting for a summary of it.',
    'The fundamentals are the part I will not skip. System design before the first file. Objects that model the actual domain instead of the first noun in the spec. Data structures picked for how the data behaves, not for whatever was closest to hand. That is what keeps a codebase readable in month nine, when the person reading it is someone else.',
    'I build with AI models too, and I am direct about how. Vibe coding is quick when the problem is shaped well enough for it. I write prompts the way I write functions: a clear contract, a known input, a checked output. It stays quick because I can tell when the model is wrong.',
  ],
  facts: [
    { k: '4 yrs', v: 'shipping production software' },
    { k: '8.6', v: 'CGPA, B.Tech Information Technology' },
    { k: '100+', v: 'audit findings driven to closure' },
    { k: '5', v: 'teams, from startup to enterprise' },
  ],
  cta: {
    label: 'Start a conversation',
    href: 'mailto:jayesh.singh431@gmail.com?subject=About%20a%20role',
  },
  links: [
    { label: 'Email', short: 'jayesh.singh431@gmail.com', href: 'mailto:jayesh.singh431@gmail.com' },
    { label: 'LinkedIn', short: 'in/singhkjayesh', href: 'https://www.linkedin.com/in/singhkjayesh/' },
    { label: 'GitHub', short: 'Jayesh049', href: 'https://github.com/Jayesh049' },
    { label: 'Resume', short: 'PDF, one page', href: 'Resume.pdf' },
  ],
};

// The header over the six cards. `hi` is the part of the title set in gold.
export const skillsHead = {
  eyebrow: 'Skills and expertise',
  title: 'Full-stack capabilities, real-world impact.',
  hi: 'real-world impact.',
  lede: 'Six disciplines I work across every week, from the interface a user touches to the query plan underneath it, and the client call when it breaks.',
};

// Each card's `more` link goes to the part of the page that shows the work.
export const disciplines = [
  {
    title: 'Frontend',
    more: { label: 'See the work', href: '#work' },
    line: 'Interfaces that stay quick once the data is real.',
    skills: [
      'React.js and Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Redux, component-driven UI',
      'REST integration, responsive UX',
    ],
  },
  {
    title: 'Backend',
    more: { label: 'See the work', href: '#work' },
    line: 'APIs, auth and the schema they sit on.',
    skills: [
      'Node.js, Express.js, Spring Boot',
      'JWT auth and Spring Security',
      'MySQL, MongoDB, Prisma',
      'File uploads, aggregations',
      'Query and API performance',
    ],
  },
  {
    title: 'Design and structure',
    more: { label: 'See it in a fix', href: '#film' },
    line: 'Decided before the first file, not after the first bug.',
    skills: [
      'System design and service boundaries',
      'OOP that models the real domain',
      'Data structures and algorithms',
      'Schema design and normalisation',
      'Code review and refactoring',
    ],
  },
  {
    title: 'Data and analysis',
    more: { label: 'See the roles', href: '#experience' },
    line: 'Reading what the system is actually doing.',
    skills: [
      'SQL, joins and window functions',
      'MongoDB aggregation pipelines',
      'Query plans and index tuning',
      'Reporting dashboards from live data',
      'Turning logs into a number someone can act on',
    ],
  },
  {
    title: 'Tickets and clients',
    more: { label: 'See the roles', href: '#experience' },
    line: 'The part most developers hand to someone else.',
    skills: [
      'Live triage and root cause',
      'Client calls during the incident',
      'SLA timers and approval routing',
      'Audit trails and verify or reject flows',
      '100+ audit findings driven to closure',
    ],
  },
  {
    title: 'AI in the loop',
    more: { label: 'See it in a fix', href: '#film' },
    line: 'Fast when it helps, checked because it can be wrong.',
    skills: [
      'Prompt engineering as a real contract',
      'AI-assisted build, reviewed line by line',
      'Model output tested, never trusted raw',
      'Scaffolding and migration at speed',
      'Knowing which problems to keep by hand',
    ],
  },
];

export const work = [
  {
    name: 'SPECTRA Remediate',
    year: '2026',
    kind: 'AI security command',
    description:
      'Private AppSec product that runs detect, explain, fix, human review and verify. A finding is not closed until it is proven fixed. Multi-tenant console with posture scoring, severity-ranked findings, ZIP or folder upload, and GitHub App PRs per finding over a Fastify API, Next.js console and Postgres.',
    stack: ['Next.js', 'Fastify', 'PostgreSQL', 'Python', 'Docker', '.NET'],
    image: 'work/spectra.webp',
    code: 'https://github.com/Jayesh049/spectra-remediate',
    live: 'https://spectra-remediate-site.onrender.com/',
  },
  {
    name: 'Agents Assemble',
    year: '2026',
    kind: 'Healthcare AI agent platform',
    description:
      'Agentic AI over medical knowledge: 36+ MCP tools, RAG over medical textbooks with embeddings and pgvector, dual MCP transports plus a mirrored REST API, and a Next.js product UI with a Python Flask ML sidecar. Synthetic and educational, built end to end.',
    stack: ['Next.js', 'TypeScript', 'MCP', 'RAG', 'PostgreSQL', 'Python'],
    image: 'work/soft-wellness.webp',
    code: 'https://github.com/Jayesh049/MCPServer',
    live: 'https://mcp-server-amber-two.vercel.app/',
  },
  {
    name: 'Eat Fit',
    year: '2023',
    kind: 'Food ordering, end to end',
    description:
      'Sign up, browse and buy meal plans, leave and edit reviews, manage a profile. The full loop, including the parts people skip in a portfolio project: auth, payment and transactional email.',
    stack: ['React', 'MongoDB', 'Express', 'Node'],
    image: 'work/eatfit.webp',
    code: 'https://github.com/Jayesh049/FoodApp_Frontend',
    live: 'https://foodapp-frontend-z1zg.onrender.com/',
  },
];

export const experience = [
  {
    title: 'Consultant — IT (Full-Stack AI Engineer)',
    company: 'Utility Powertech Limited',
    date: 'Aug 2026 to now',
    current: true,
    points: [
      'Own prompt engineering end to end for OpenAI and Claude integrations on a client-facing product feature: design, test and iterate templates until output is consistently reliable and production-ready.',
      'Integrated an LLM-powered assistant into .NET (C#) backend services, reducing manual review effort before output reached users, from prompt design through API integration.',
      'Built and shipped Angular UI components consuming .NET REST APIs for core client-facing screens, working directly with product and design to ship iteratively.',
      'Contributed React components that extend the product AI-assisted feature set, working across both Angular and React front ends on the same platform.',
    ],
  },
  {
    title: 'Consultant — IT (Full-Stack Engineer, Contract)',
    company: 'GA Digital Web Word Pvt. Ltd.',
    date: 'Apr 2026 to Aug 2026',
    points: [
      'Cut repeat support queries about 30% by building a RAG layer over internal documents (embeddings and vector search) exposed via REST APIs, tuning chunking against measured retrieval hit rates.',
      'Cut document lookup and review time about 70% by shipping a multi-agent LLM (OpenAI/Claude) document-search and summarization assistant into the Node.js/.NET stack, with prompt templating, output validation and RBAC-gated access.',
      'Delivered 3 production modules end to end (requirements to deploy) on Node.js/Express, .NET (C#) and React/Angular for Energy Efficiency Services Limited (EESL), a Government of India PSU, with zero missed release deadlines using AWS, Docker and GitHub Actions CI/CD.',
      'Designed 6+ JWT-secured REST endpoints per module over MySQL, MSSQL and PostgreSQL, paired with reusable React/Angular components.',
    ],
  },
  {
    title: 'Consultant — IT (Full-Stack Engineer)',
    company: 'SISL Infotech Pvt. Ltd.',
    date: 'Feb 2025 to Mar 2026',
    points: [
      'Cut notification failures about 90% by building Dockerized email-notification microservices with retry logic, health monitoring and structured logging.',
      'Cut manual compliance-review time about 60% by shipping LLM-powered auto-summarization of compliance findings and notification drafting into the production email-microservice pipeline.',
      'Resolved 100+ compliance findings across 15+ enterprise site audits, building React/Angular dashboards over Node.js/.NET REST APIs backed by MySQL/MSSQL.',
      'Secured 4 enterprise modules with JWT and Azure AD RBAC; delivered a compliance/approval system (SLA tracking, audit logs) and a role-based Bill Tracking System.',
    ],
  },
  {
    title: 'Database Engineer',
    company: 'iONE IT Solution Pvt. Ltd.',
    date: 'May 2024 to Jan 2025',
    points: [
      'Sustained about 99% uptime engineering production database HA: schema design, indexing, backups, point-in-time recovery and standby replication.',
      'Cut query times about 70% via EXPLAIN ANALYZE-driven tuning and indexing; automated backup, recovery and migration pipelines across environments.',
      'Applied scikit-learn to production database telemetry for anomaly detection and query-performance forecasting, building feature pipelines for downstream ML and vector-search workloads.',
    ],
  },
  {
    title: 'Backend Engineer',
    company: 'AAL Infotech Pvt. Ltd.',
    date: 'Jul 2023 to Apr 2024',
    points: [
      'Improved API response times about 60% building Node.js/Express REST APIs over MongoDB with schema and aggregation-pipeline design.',
      'Built backend data pipelines and integrated AI/LLM APIs into Node.js/Express endpoints to power AI-driven product features.',
    ],
  },
];

// SPECTRA FILM. The section now runs the six-stage film from the AISecurity
// site (site/index.html, the .hero-six "watch-film" hero) instead of the older
// four-step 720p cut. Play-driven rather than scroll-scrubbed: the reference
// maps scroll position to currentTime over an 1100vh sticky stage and runs a
// rAF loop that scrolls the page itself, which would add a second scroll
// authority beside the page peel and useScrollMotion. Same pixels, own clock.
//
// `at`/`out` are seconds. The source expresses band edges as scroll progress
// and converts through data-knots; these are that knot function evaluated at
// each edge, so every caption still sits exactly on its plateau. The gaps
// between bands are deliberate: that is where the camera moves and the cuts
// happen, and no caption is allowed on top of one.
// THE FILM SECTION IS NO LONGER A FILM. It is a four-card deck: the same four
// steps the heading and the lede above it have always claimed, one card each,
// with auth.py in its state at that step. Drag or swipe the top card away and
// the next rises; the buttons do the same thing without a pointer.
//
// The SPECTRA six-stage player it replaces is commented out below, and its
// assets stay on disk per the standing rule: public/film/spectra-film.mp4 (8 MB)
// and spectra-poster.jpg are referenced ONLY by that commented block and by the
// commented component body at the bottom of src/ui/Film.jsx. Uncomment both and
// the player returns with its footage intact.
export const film = {
  source: 'db.execute(query, (username,))',
  head: 'How a bug goes from found to shipped.',
  // The part of the heading set in gold, and the cue at the foot of the column.
  headHi: 'found to shipped.',
  scroll: 'Scroll to keep reading',
  lede: [
    // The video is gone, so "Thirty-three seconds here" became a lie about the
    // section. Same sentence, counting cards instead of seconds.
    // 'Same four steps every time. ... Thirty-three seconds here, one real SQL injection in auth.py.',
    'Same four steps every time. Read the whole file before touching it, name the fault precisely enough to search for it, fix the cause instead of the symptom, then prove it with a test that fails without the fix. Four cards here, one real SQL injection in auth.py.',
    'The step most people skip is the first one. A ticket names a symptom, and the line it points at is usually not the line at fault. I read the code around it until I can say what is wrong in one sentence, because a fix I cannot explain is a fix I cannot defend in review.',
  ],
  label: 'One SQL injection in auth.py: read, found, fixed and shipped',
  // Shortened to fit inside the top card beside the buttons, as the reference
  // has it. Was: 'Drag or swipe a card away. The buttons do the same.'
  hint: 'Drag or swipe a card away',
  file: 'auth.py',

  // `alt` is read instead of the code by a screen reader. .fs-vh uses clip
  // rather than display:none, so these strings are in body.innerText and go
  // through the copy gate too.
  steps: [
    {
      no: '01', title: 'Read', snippet: 'auth:bad', mark: null, note: null,
      say: 'Open the whole file, not the line in the ticket.',
      hi: 'whole file',
      tip: 'Read the code around the reported line first. The fault is rarely on the line the ticket points at.',
      alt: 'auth.py as found: three lines, a function that builds a query from a username and runs it.',
    },
    {
      no: '02', title: 'Found', snippet: 'auth:bad', mark: 'bad',
      note: 'line 2 · SQL injection, CWE-89',
      say: 'Name it exactly. A concatenated query: SQL injection, CWE-89.',
      hi: 'SQL injection',
      tip: 'If searching the exact name of the fault turns up the fix, it has been named precisely enough.',
      alt: 'auth.py with line 2 called out: the username is joined straight into the SQL string.',
    },
    {
      no: '03', title: 'Fixed', snippet: 'auth:good', mark: 'good',
      note: 'line 2 · bound parameter, tests green',
      say: 'Fix the cause. A bound parameter, not an escaped string, and the tests go green.',
      hi: 'bound parameter',
      tip: 'Change the shape of the query, not the input. Escaping closes one path; a parameter closes all of them.',
      alt: 'auth.py with line 2 replaced: the query carries a placeholder and the username travels as a parameter.',
    },
    {
      no: '04', title: 'Shipped', snippet: 'auth:good', mark: null,
      note: 'diff · one line changed, nothing else touched',
      say: 'Leave it readable. The next person to open this file is the real reviewer.',
      hi: 'readable',
      tip: 'One line changed, one test added, nothing else touched. A small diff is the easiest one to trust.',
      alt: 'auth.py after the fix, with no line called out: it is just the file now.',
    },
  ],

  // The closing beat, once the deck is empty. Same words and the same green the
  // SPECTRA player ended on.
  closing: { line: 'Fixed.', sub: 'One query closed, on real code.', again: 'Start again' },

  notes: [
    { k: '4', v: 'steps, same order, every bug' },
    { k: '1', v: 'root cause named before the first edit' },
    { k: '0', v: 'symptom patches left in the codebase' },
  ],
};

// PREVIOUS: the SPECTRA six-stage player.
// WHERE THE FOOTAGE WENT: every film asset moved to media-retired/film/ at the
// repo root. Nothing under public/ is optional -- Vite copies it verbatim into
// dist -- and these six files were 42 MB of a 47 MB build with not one live
// reference between them. Moved, not deleted: copy them back into public/film/
// and uncomment the block below to restore either player.
// export const film = {
//   video: 'film/spectra-film.mp4',
//   poster: 'film/spectra-poster.jpg',
//   duration: 33,
//   label: 'The SPECTRA film: one SQL injection in auth.py, from scan to shipped fix.',
//   failNote: 'The film could not load.',
//
//   // The section's own framing, unchanged. These sit above the stage and stay
//   // in Ciridae's registers; only the player below them is SPECTRA.
//   source: 'db.execute(query, (username,))',
//   head: 'How a bug goes from found to shipped.',
//   lede: [
//     'Same four steps every time. Read the whole file before touching it, name the fault precisely enough to search for it, fix the cause instead of the symptom, then prove it with a test that fails without the fix. Thirty-three seconds here, one real SQL injection in auth.py.',
//     'The step most people skip is the first one. A ticket names a symptom, and the line it points at is usually not the line at fault. I read the code around it until I can say what is wrong in one sentence, because a fix I cannot explain is a fix I cannot defend in review.',
//   ],
//   notes: [
//     { k: '4', v: 'steps, same order, every bug' },
//     { k: '1', v: 'root cause named before the first edit' },
//     { k: '0', v: 'symptom patches left in the codebase' },
//   ],
//   stages: [
//     { at: 0,     out: 7.17,  hud: 'ANALYZE',    num: '01/06', kicker: '01 · Analyze',
//       line: 'One flagged query, fixed on screen',
//       sub: 'auth.py from scan to fix: the joined string is flagged, then replaced with a placeholder.' },
//     { at: 8.33,  out: 15.6,  hud: 'VIEW',       num: '02/06', kicker: '02 · View',
//       line: 'Line 2 is flagged as SQL injection',
//       sub: 'CWE-89. The name is joined straight into the query text.' },
//     { at: 16,    out: 20.83, hud: 'GENERATE',   num: '03/06', kicker: '03 · Generate',
//       line: 'A placeholder replaces the joined string',
//       sub: 'The fix is written into that one line and nowhere else.' },
//     { at: 21.07, out: 23.2,  hud: 'REVIEW',     num: '04/06', kicker: '04 · Review changes',
//       line: 'The name now travels as data, never as SQL',
//       sub: 'Check the before and after, then approve.' },
//     { at: 23.4,  out: 27.27, hud: 'DELIVER',    num: '05/06', kicker: '05 · Deliver',
//       line: 'One line changed, the rest left alone',
//       sub: 'Take the fixed files as a separate set.' },
//     { at: 27.53, out: 31.27, hud: 'REGENERATE', num: '06/06', kicker: '06 · Regenerate',
//       line: 'Not the fix you wanted? Redo just this one',
//       sub: 'Redo one fix without redoing the rest.' },
//     // `fixed` drives three things the source also keys off it: the HUD dot goes
//     // green, the caption takes the green glow, and the rail mark shows a tick.
//     { at: 31.53, out: 33,    hud: 'FIXED',      num: '06/06', fixed: true,
//       line: 'Fixed.',
//       sub: 'One query closed, on real code.' },
//   ],
// };

// PREVIOUS FILM SECTION, kept for reference. Its assets are still on disk
// (public/film/auth-py-film-720p.mp4, -1080p.mp4, poster.webp).
// export const film = {
//   source: 'db.execute(query, (username,))',
//   // REFRAMED. This section used to sell itself as a making-of about the video
//   // (how it was directed, what the model got wrong). The footage was always the
//   // right footage -- it is literally find-then-fix -- but the copy argued for
//   // craft with AI tooling instead of for a method. It now argues for the
//   // method. Originals kept below each replacement.
//   // head: 'Thirty-three seconds about one line of SQL.',
//   head: 'How a bug goes from found to shipped.',
//   lede: [
//     // 'A codebase appears, an injection hides in one line of it, the fix gets typed in, and the fixed code is shown like finished work. Four shots, one story, and the code stays readable from the first frame to the last.',
//     'Same four steps every time. Read the whole file before touching it, name the fault precisely enough to search for it, fix the cause instead of the symptom, then prove it with a test that fails without the fix. Thirty-three seconds here, one real SQL injection in auth.py.',
//     // 'I directed it with Higgsfield and Seedance 2.0, and I checked it the way I check any model output. Every take came back with something nobody asked for: a mouse pointer, a taskbar, a badge that read CEE-89. None of it made the cut.',
//     'The step most people skip is the first one. A ticket names a symptom, and the line it points at is usually not the line at fault. I read the code around it until I can say what is wrong in one sentence, because a fix I cannot explain is a fix I cannot defend in review.',
//   ],
//   video: 'film/auth-py-film-720p.mp4',
//   videoHd: 'film/auth-py-film-1080p.mp4',
//   poster: 'film/poster.webp',
//   // label: 'Film: an SQL injection in auth.py is found, fixed and shown as finished code',
//   label: 'An SQL injection in auth.py: read, found, fixed and shipped',
//   // 'Reveal' was the one film word in the set; the other three already read as
//   // method. The lines were shot descriptions and are now the steps themselves.
//   // { at: 0, stamp: '0:00', label: 'Reveal', line: 'The file tree wakes up and a scan starts on auth.py.' },
//   // { at: 7.84, stamp: '0:08', label: 'Found', line: 'The concatenated query is flagged: SQL Injection, CWE-89.' },
//   // { at: 15.48, stamp: '0:15', label: 'Fixed', line: 'A placeholder replaces the concatenation and the tests pass.' },
//   // { at: 23.12, stamp: '0:23', label: 'Shipped', line: 'The fixed code floats in dark space and holds still.' },
//   chapters: [
//     { at: 0, stamp: '0:00', label: 'Read', line: 'Open the whole file, not the line in the ticket.' },
//     { at: 7.84, stamp: '0:08', label: 'Found', line: 'Name it exactly. A concatenated query: SQL injection, CWE-89.' },
//     { at: 15.48, stamp: '0:15', label: 'Fixed', line: 'Fix the cause. A bound parameter, not an escaped string, and the tests go green.' },
//     { at: 23.12, stamp: '0:23', label: 'Shipped', line: 'Leave it readable. The next person to open this file is the real reviewer.' },
//   ],
//   // Film-production stats became method facts, same numeric rhythm.
//   // { k: '4', v: 'shots, each anchored to a rendered still of the real code' },
//   // { k: '1', v: 'camera move per shot, never two' },
//   // { k: '0', v: 'invented characters left on screen' },
//   notes: [
//     { k: '4', v: 'steps, same order, every bug' },
//     { k: '1', v: 'root cause named before the first edit' },
//     { k: '0', v: 'symptom patches left in the codebase' },
//   ],
//   hdLabel: 'Watch it at 1080p, 31 MB',
// };
