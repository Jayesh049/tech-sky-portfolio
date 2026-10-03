// What each technology builds when it is picked in the skills sky.
//
// One entry per id in techs.js. Each field feeds one beat of the sequence:
//   code       CODE_REVEAL    representative code, typed line by line
//   build      LIVE_BUILD     the steps of the small system the code builds;
//                             `lines` are the 0-based code lines each step
//                             highlights, so the visitor sees which code made
//                             which part
//   compile    COMPILING      that tool's own build or run steps
//   expertise  EXPERTISE      what Jayesh does with it
//
// The build scenes are demonstrations, and every one is labelled DEMO on
// screen. Claims about experience live only in `expertise.evidence`, and each
// one is taken from profile.js (the resume). Nothing there is invented.
//
// `code.src` is tokenised at build time by scripts/tokenize.mjs into
// tokens.generated.json under `<id>:story`. After editing a snippet, run
// `npm run tokens`.
//
// ADDING ANOTHER TECHNOLOGY
//   1. techs.js: add the entry (id, name, color, 3D settings), then
//      `npm run logos` for its mark.
//   2. Here: add an entry with the same id.
//   3. `npm run tokens`.
//   4. Optional: a bespoke build scene in src/ui/scenes/ registered in
//      scenes/index.js. Without one, the generic pipeline scene draws the
//      `build.steps` labels as a working pipeline, so the sequence still runs.

export const techStory = {
  react: {
    display: 'React.js',
    code: {
      file: 'Dashboard.jsx',
      lang: 'jsx',
      src: `import { useState } from 'react';

export default function Dashboard({ users }) {
  const [count, setCount] = useState(0);

  return (
    <section className="dashboard">
      <h2>Dashboard</h2>
      <Stat label="Total users" value={users.total} />
      <Stat label="Active" value={users.active + '%'} />
      <GrowthChart points={users.growth} />
      <ActivityList items={users.recent} />
      <button onClick={() => setCount(count + 1)}>
        Increment {count}
      </button>
    </section>
  );
}`,
    },
    build: {
      title: 'Dashboard',
      steps: [
        { label: 'Layout', lines: [6, 7] },
        { label: 'Stat cards', lines: [8, 9] },
        { label: 'Growth chart', lines: [10, 10] },
        { label: 'Activity feed', lines: [11, 11] },
        { label: 'State and events', lines: [3, 3, 12, 14] },
      ],
      ready: 'Live: state, props and events',
    },
    compile: {
      title: 'Compiling React.js',
      steps: ['Installing dependencies', 'Compiling components', 'Setting up state management', 'Connecting API', 'Optimizing build'],
    },
    expertise: {
      head: 'Building modern',
      hi: 'frontend experiences.',
      text: 'Responsive, maintainable interfaces in React, on projects with real APIs, authentication and multi-step flows.',
      caps: ['Component architecture', 'State management', 'API integration', 'Responsive UI', 'Performance optimization', 'Deployed projects'],
      evidence: 'React front-ends for the eBegin platform and the EESL modules; Eat Fit, Resume Builder and Genrich Restaurant.',
    },
  },

  typescript: {
    display: 'TypeScript',
    code: {
      file: 'user.ts',
      lang: 'ts',
      src: `// before: const user = { id: '42', name: 'Asha' };

interface User {
  id: number;
  name: string;
  role: 'admin' | 'viewer';
}

function getUser(id: number): User {
  const row = db.users.find(id);
  if (!row) throw new Error('No user ' + id);
  return { id: row.id, name: row.name, role: row.role };
}

getUser('42'); // error: string is not assignable to number
getUser(42);   // ok: number in, User out`,
    },
    build: {
      title: 'Type-safe flow',
      steps: [
        { label: 'Data', lines: [0, 0] },
        { label: 'Type', lines: [2, 6] },
        { label: 'Function', lines: [8, 8] },
        { label: 'Validation', lines: [9, 10] },
        { label: 'Safe output', lines: [11, 11] },
        { label: 'Error caught', lines: [14, 14] },
        { label: 'Fixed', lines: [15, 15] },
      ],
      ready: 'Checked at build time',
    },
    compile: {
      title: 'Type-checking TypeScript',
      steps: ['Reading tsconfig.json', 'Resolving imports', 'Checking types', 'Emitting JavaScript', 'Writing declarations'],
    },
    expertise: {
      head: 'Type-safe',
      hi: 'application architecture.',
      text: 'Interfaces and typed functions, so the contract between screens, services and data is checked before it runs instead of found in a ticket.',
      caps: ['Type-safe development', 'Interfaces', 'Generics', 'API contracts', 'Safer refactoring', 'Maintainable architecture'],
      evidence: 'Part of the frontend stack, alongside React and Next.js.',
    },
  },

  nodedotjs: {
    display: 'Node.js',
    code: {
      file: 'server.js',
      lang: 'js',
      src: `import { createServer } from 'node:http';
import { route } from './router.js';

const server = createServer(async (req, res) => {
  const { status, body } = await route(req);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
    },
    build: {
      title: 'node server.js',
      steps: [
        { label: 'Client', lines: [3, 3] },
        { label: 'Request', lines: [3, 3] },
        { label: 'Node.js', lines: [4, 4] },
        { label: 'Database', lines: [4, 4] },
        { label: 'Response', lines: [5, 6] },
        { label: 'Listening', lines: [9, 11] },
      ],
      ready: 'Server ready on :3000',
    },
    compile: {
      title: 'Starting Node.js',
      steps: ['Installing packages', 'Loading environment', 'Opening database pool', 'Registering routes', 'Listening on :3000'],
    },
    expertise: {
      head: 'Building reliable',
      hi: 'backend systems.',
      text: 'Node.js services behind enterprise dashboards and a food ordering app: APIs, auth, uploads, and the mail service the notifications ride on.',
      caps: ['REST APIs', 'Authentication', 'Async processing', 'Database integration', 'API performance', 'Production services'],
      evidence: 'Backend services at AAL Infotech; dashboards and the internal mail service at SISL Infotech.',
    },
  },

  express: {
    display: 'Express',
    code: {
      file: 'app.js',
      lang: 'js',
      src: `import express from 'express';
import { auth, validate } from './middleware.js';
import { getUsers, createUser } from './controllers/users.js';

const app = express();
app.use(express.json());

app.get('/api/users', auth, getUsers);
app.post('/api/users', auth, validate(userSchema), createUser);

app.use((err, req, res, next) => {
  res.status(err.status ?? 500).json({ error: err.message });
});

app.listen(3000);`,
    },
    build: {
      title: 'GET /api/users',
      steps: [
        { label: 'Request', lines: [7, 7] },
        { label: 'Middleware', lines: [5, 5] },
        { label: 'Auth', lines: [1, 1, 7, 7] },
        { label: 'Route', lines: [7, 8] },
        { label: 'Controller', lines: [2, 2] },
        { label: 'Response', lines: [10, 12] },
      ],
      ready: '200 OK',
    },
    compile: {
      title: 'Building the Express API',
      steps: ['Mounting middleware', 'Verifying the JWT secret', 'Registering /api routes', 'Wiring the error handler', 'Running the health check'],
    },
    expertise: {
      head: 'API routing &',
      hi: 'service layers.',
      text: 'REST APIs on Express with auth middleware, validation and upload handling, tuned for throughput and verified in Postman.',
      caps: ['REST APIs', 'Middleware', 'Authentication', 'Validation', 'Error handling', 'Service architecture'],
      evidence: 'REST APIs at AAL Infotech; JWT-secured endpoints for the EESL modules at GA Digital; the Eat Fit backend.',
    },
  },

  mongodb: {
    display: 'MongoDB',
    code: {
      file: 'usersByRole.js',
      lang: 'js',
      src: `// { userId: 1024, name: 'Jayesh', role: 'admin', active: true }

const byRole = await db.collection('users').aggregate([
  { $match: { active: true } },
  { $group: { _id: '$role', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]).toArray();

// [{ _id: 'user', count: 245 }, { _id: 'editor', count: 31 },
//  { _id: 'admin', count: 12 }]`,
    },
    build: {
      title: 'Aggregation pipeline',
      steps: [
        { label: 'Documents', lines: [0, 0] },
        { label: '$match', lines: [3, 3] },
        { label: '$group', lines: [4, 4] },
        { label: '$sort', lines: [5, 5] },
        { label: 'Result', lines: [8, 9] },
      ],
      ready: '3 groups from 288 documents',
    },
    compile: {
      title: 'Running the MongoDB pipeline',
      steps: ['Connecting to the cluster', 'Matching active users', 'Grouping by role', 'Sorting by count', 'Returning results'],
    },
    expertise: {
      head: 'Document data &',
      hi: 'aggregation.',
      text: 'Schemas and aggregation pipelines behind an ordering app and backend services, written to cut data retrieval time.',
      caps: ['Document modeling', 'Aggregation pipelines', 'Query design', 'Data transformation', 'Indexing', 'API integration'],
      evidence: 'Node.js/Express APIs over MongoDB at AAL Infotech, with aggregation design that improved response times ~60%; the Eat Fit data layer.',
    },
  },

  mysql: {
    display: 'MySQL',
    code: {
      file: 'orders_by_user.sql',
      lang: 'sql',
      src: `SELECT u.name,
       COUNT(o.id) AS orders
FROM users u
JOIN orders o     ON o.user_id = u.id
JOIN products pr  ON pr.id = o.product_id
JOIN payments p   ON p.order_id = o.id
WHERE p.status = 'paid'
GROUP BY u.name
ORDER BY orders DESC;`,
    },
    build: {
      title: 'Relational query',
      steps: [
        { label: 'Tables', lines: [2, 2] },
        { label: 'Joins', lines: [3, 5] },
        { label: 'Filter', lines: [6, 6] },
        { label: 'Group', lines: [0, 1, 7, 7] },
        { label: 'Result', lines: [8, 8] },
      ],
      ready: '3 rows in 4 ms',
    },
    compile: {
      title: 'Executing the MySQL query',
      steps: ['Parsing the statement', 'Choosing indexes', 'Planning the joins', 'Grouping rows', 'Returning the result set'],
    },
    expertise: {
      head: 'Relational data &',
      hi: 'query engineering.',
      text: 'Joins, window functions and index tuning behind audit dashboards and approval workflows, plus a year running Oracle Database in production.',
      caps: ['SQL', 'Joins', 'Aggregations', 'Query optimization', 'Indexing', 'Schema design'],
      evidence: 'Cut slow-query times ~70% with MySQL/MSSQL tuning at SISL Infotech; ~99% uptime database engineering at iONE.',
    },
  },

  tailwindcss: {
    display: 'Tailwind CSS',
    code: {
      file: 'ProfileCard.jsx',
      lang: 'jsx',
      src: `export function ProfileCard() {
  return (
    <article
      className="p-6 rounded-xl
                 grid gap-4 grid-cols-[auto_1fr]
                 text-lg font-semibold tracking-tight
                 bg-slate-900 text-white shadow-xl
                 w-full max-w-md sm:max-w-lg">
      <img className="size-14 rounded-full" src={avatar} alt="" />
      <div>
        <h3>Beautiful UI</h3>
        <button className="mt-3 rounded-lg bg-sky-500 px-4 py-2">
          Get started
        </button>
      </div>
    </article>
  );
}`,
    },
    build: {
      title: 'Utility classes',
      steps: [
        { label: 'Raw UI', lines: [2, 2, 8, 14] },
        { label: 'Spacing', lines: [3, 3] },
        { label: 'Layout', lines: [4, 4] },
        { label: 'Typography', lines: [5, 5] },
        { label: 'Colors', lines: [6, 6, 11, 11] },
        { label: 'Responsive', lines: [7, 7] },
      ],
      ready: 'Desktop, tablet, mobile',
    },
    compile: {
      title: 'Building Tailwind CSS',
      steps: ['Scanning templates for classes', 'Generating utilities', 'Applying responsive variants', 'Dropping unused styles', 'Minifying the stylesheet'],
    },
    expertise: {
      head: 'Design systems',
      hi: 'that ship fast.',
      text: 'Utility-first styling for responsive components, with spacing and type measured rather than guessed.',
      caps: ['Responsive UI', 'Utility architecture', 'Design systems', 'Component styling', 'Accessibility', 'Rapid UI development'],
      evidence: 'In the frontend stack. No public project on this page uses it yet, so the build above is a demo only.',
    },
  },

  redux: {
    display: 'Redux',
    code: {
      file: 'store.js',
      lang: 'js',
      src: `const initialState = { count: 0 };

function counter(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}

const store = createStore(counter);
store.subscribe(() => render(store.getState()));
store.dispatch({ type: 'INCREMENT' });`,
    },
    build: {
      title: 'State flow',
      steps: [
        { label: 'Action', lines: [12, 12] },
        { label: 'Reducer', lines: [2, 9] },
        { label: 'Store', lines: [0, 0, 11, 11] },
        { label: 'Components', lines: [12, 12] },
      ],
      ready: 'Every view in sync',
    },
    compile: {
      title: 'Wiring the Redux store',
      steps: ['Creating the reducer', 'Creating the store', 'Attaching middleware', 'Subscribing components', 'Dispatching the first action'],
    },
    expertise: {
      head: 'Predictable',
      hi: 'application state.',
      text: 'State in one place, so every view agrees and a half-written resume is still there tomorrow.',
      caps: ['Centralized state', 'Actions', 'Reducers', 'Store architecture', 'Predictable updates', 'UI synchronization'],
      evidence: 'Resume Builder keeps its state in Redux, persisted to Firebase.',
    },
  },

  threedotjs: {
    display: 'Three.js',
    code: {
      file: 'scene.js',
      lang: 'js',
      src: `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
camera.position.set(3, 2, 5);

const geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
const material = new THREE.MeshStandardMaterial({ color: '#4fc3ff' });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube, new THREE.PointLight('#ffffff', 40));

renderer.setAnimationLoop((t) => {
  cube.rotation.set(t / 2000, t / 1400, 0);
  renderer.render(scene, camera);
});`,
    },
    build: {
      title: '3D scene',
      steps: [
        { label: 'Scene', lines: [0, 0] },
        { label: 'Camera', lines: [1, 2] },
        { label: 'Geometry', lines: [4, 4] },
        { label: 'Material', lines: [5, 6] },
        { label: 'Light', lines: [7, 7] },
        { label: 'Animation', lines: [9, 12] },
      ],
      ready: 'Rendering',
    },
    compile: {
      title: 'Rendering the Three.js scene',
      steps: ['Creating the WebGL context', 'Compiling shaders', 'Uploading geometry', 'Lighting the scene', 'Starting the render loop'],
    },
    expertise: {
      head: 'Interactive',
      hi: '3D experiences.',
      text: 'The sky behind this section is Three.js: a physical sky model, volumetric clouds and logos extruded from SVG paths, driven by GSAP.',
      caps: ['WebGL', '3D scenes', 'Geometry', 'Materials', 'Lighting', 'Animation'],
      evidence: 'Built this section: React Three Fiber, a Preetham sky, drei clouds and extruded SVG logos.',
    },
  },

  springboot: {
    display: 'Spring Boot',
    code: {
      file: 'UserController.java',
      lang: 'java',
      src: `@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService service;

  @GetMapping("/{id}")
  public UserDto get(@PathVariable Long id) {
    return service.find(id);
  }
}

@Service
public class UserService {
  private final UserRepository repo;

  public UserDto find(Long id) {
    return repo.findById(id).map(UserDto::of).orElseThrow();
  }
}`,
    },
    build: {
      title: 'GET /api/users/42',
      steps: [
        { label: 'Request', lines: [5, 5] },
        { label: 'Controller', lines: [0, 2] },
        { label: 'Service', lines: [11, 12] },
        { label: 'Repository', lines: [13, 13] },
        { label: 'Database', lines: [16, 16] },
        { label: 'Response', lines: [7, 7] },
      ],
      ready: '200 OK',
    },
    compile: {
      title: 'Building Spring Boot',
      steps: ['Resolving Maven dependencies', 'Compiling classes', 'Wiring beans', 'Securing endpoints', 'Packaging the jar'],
    },
    expertise: {
      head: 'Enterprise backend',
      hi: 'architecture.',
      text: 'REST APIs in Spring Boot against MySQL, secured with Spring Security and JWT, and tuned for throughput.',
      caps: ['REST APIs', 'Spring Security', 'JWT', 'MySQL persistence', 'Layered services', 'Service architecture'],
      evidence: 'REST APIs in Spring Boot with Spring Security at AAL Infotech.',
    },
  },
  // ── From the 2026 resume ──────────────────────────────────────────────────

  dotnet: {
    display: '.NET (C#)',
    code: {
      file: 'FindingsController.cs',
      lang: 'csharp',
      src: `[ApiController]
[Route("api/findings")]
[Authorize(Roles = "Auditor")]
public class FindingsController : ControllerBase
{
    private readonly IFindingService _service;

    public FindingsController(IFindingService service) => _service = service;

    [HttpGet("{id}")]
    public async Task<ActionResult<FindingDto>> Get(int id)
    {
        var finding = await _service.FindAsync(id);
        return finding is null ? NotFound() : Ok(finding);
    }
}`,
    },
    build: {
      title: 'GET /api/findings/42',
      steps: [
        { label: 'Request', lines: [9, 10] },
        { label: 'Authentication', lines: [2, 2] },
        { label: 'Authorization', lines: [2, 2] },
        { label: 'Controller', lines: [0, 3] },
        { label: 'Service', lines: [5, 7, 12, 12] },
        { label: 'Response', lines: [13, 13] },
      ],
      ready: '200 OK, role checked',
    },
    compile: {
      title: 'Building the .NET API',
      steps: ['Restoring NuGet packages', 'Compiling FindingsApi.csproj', 'Running analyzers', 'Publishing the Release build', 'Starting Kestrel'],
    },
    expertise: {
      head: 'Typed services',
      hi: 'in C#.',
      text: 'ASP.NET Core REST APIs behind client-facing screens, secured with JWT and Azure AD roles, with an LLM assistant wired into the service layer.',
      caps: ['ASP.NET Core Web APIs', 'C# service layers', 'JWT and Azure AD RBAC', 'LLM integration', 'REST design', 'Angular and React clients'],
      evidence: '.NET (C#) services at Utility Powertech, GA Digital (EESL modules) and SISL Infotech, including an LLM assistant in the .NET backend.',
    },
  },

  angular: {
    display: 'Angular',
    code: {
      file: 'findings.component.ts',
      lang: 'ts',
      src: `@Component({
  selector: 'app-findings',
  standalone: true,
  template: \`
    <h2>Findings ({{ open() }} open)</h2>
    @for (f of findings(); track f.id) {
      <app-finding-row [finding]="f" (resolve)="resolve(f.id)" />
    }
  \`,
})
export class FindingsComponent {
  private api = inject(FindingsApi);
  findings = toSignal(this.api.list(), { initialValue: [] });
  open = computed(() => this.findings().filter((f) => !f.closed).length);

  resolve(id: number) {
    this.api.resolve(id).subscribe();
  }
}`,
    },
    build: {
      title: 'Findings',
      steps: [
        { label: 'Component', lines: [0, 2, 10, 10] },
        { label: 'Template', lines: [3, 8] },
        { label: 'Service', lines: [11, 12] },
        { label: 'Signals', lines: [13, 13] },
        { label: 'Events', lines: [6, 6, 15, 17] },
      ],
      ready: 'Live: signals recompute on every change',
    },
    compile: {
      title: 'Building with the Angular CLI',
      steps: ['Compiling TypeScript', 'Building standalone components', 'Compiling templates ahead of time', 'Bundling with esbuild', 'Serving on :4200'],
    },
    expertise: {
      head: 'Enterprise screens',
      hi: 'in Angular.',
      text: 'Angular components over .NET and Node REST APIs for compliance, approvals and client-facing features, built with product and design in short iterations.',
      caps: ['Standalone components', 'Signals and RxJS', 'Services and DI', 'REST integration', 'Role-based views', 'Dashboards'],
      evidence: 'Angular UI over .NET REST APIs at Utility Powertech; compliance dashboards at SISL Infotech; EESL modules at GA Digital.',
    },
  },

  nextdotjs: {
    display: 'Next.js',
    code: {
      file: 'page.tsx',
      lang: 'tsx',
      src: `// app/topics/[slug]/page.tsx: a server component
import { prisma } from '@/lib/db';
import { askAgent } from '@/lib/agent';

export default async function TopicPage({ params }) {
  const topic = await prisma.topic.findUnique({ where: { slug: params.slug } });
  const answer = await askAgent(topic.question);

  return (
    <article>
      <h1>{topic.title}</h1>
      <Sources items={answer.sources} />
      <p>{answer.text}</p>
    </article>
  );
}`,
    },
    build: {
      title: '/topics/insulin-basics',
      steps: [
        { label: 'Route', lines: [0, 0] },
        { label: 'Server component', lines: [4, 4] },
        { label: 'Data (Prisma)', lines: [5, 5] },
        { label: 'Agent answer', lines: [6, 6] },
        { label: 'Stream to client', lines: [8, 14] },
      ],
      ready: 'Rendered on the server, hydrated',
    },
    compile: {
      title: 'Running next build',
      steps: ['Compiling the app router', 'Collecting page data', 'Generating static pages', 'Optimizing the bundle', 'Ready on :3000'],
    },
    expertise: {
      head: 'React on',
      hi: 'the server.',
      text: 'Next.js with server components and API routes, Prisma for state and an agent behind the page, so answers render with their sources.',
      caps: ['App Router', 'Server components', 'API routes', 'Streaming', 'Prisma', 'Performance'],
      evidence: 'The Healthcare AI Agent Platform is a Next.js (React) product with a Python Flask ML sidecar and Prisma-backed state.',
    },
  },

  postgresql: {
    display: 'PostgreSQL + pgvector',
    code: {
      file: 'nearest_chunks.sql',
      lang: 'sql',
      src: `CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE chunks (
  id        bigserial PRIMARY KEY,
  book      text NOT NULL,
  content   text NOT NULL,
  embedding vector(384)
);

CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);

SELECT book, content
FROM chunks
ORDER BY embedding <=> $1
LIMIT 5;`,
    },
    build: {
      title: 'Vector search',
      steps: [
        { label: 'Extension', lines: [0, 0] },
        { label: 'Table', lines: [2, 7] },
        { label: 'Embeddings', lines: [6, 6] },
        { label: 'HNSW index', lines: [9, 9] },
        { label: 'Nearest 5', lines: [11, 14] },
      ],
      ready: '5 nearest chunks by cosine distance',
    },
    compile: {
      title: 'Querying PostgreSQL',
      steps: ['Connecting to PostgreSQL', 'Enabling pgvector', 'Building the HNSW index', 'Planning ORDER BY <=>', 'Returning the nearest chunks'],
    },
    expertise: {
      head: 'Relational rows',
      hi: 'and vectors.',
      text: 'PostgreSQL for schema, migrations and vector search with pgvector, so retrieval for an agent is one indexed query next to the rest of the data.',
      caps: ['PostgreSQL', 'pgvector', 'Vector search', 'HNSW indexing', 'Schema design', 'Migrations'],
      evidence: 'pgvector search over 37 medical textbooks in the Healthcare AI Agent Platform; schema design and migration across MySQL, MSSQL and PostgreSQL at SISL Infotech.',
    },
  },

  python: {
    display: 'Python',
    code: {
      file: 'anomalies.py',
      lang: 'python',
      src: `from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import IsolationForest

app = Flask(__name__)
model = IsolationForest(contamination=0.02, random_state=7)

@app.post("/anomalies")
def anomalies():
    df = pd.DataFrame(request.json["queries"])
    features = df[["duration_ms", "rows", "locks"]]
    df["anomaly"] = model.fit_predict(features) == -1
    return jsonify(df[df.anomaly].to_dict("records"))`,
    },
    build: {
      title: 'Query telemetry',
      steps: [
        { label: 'Flask app', lines: [4, 4, 7, 8] },
        { label: 'DataFrame', lines: [9, 9] },
        { label: 'Features', lines: [10, 10] },
        { label: 'Model', lines: [5, 5] },
        { label: 'Predict', lines: [11, 11] },
        { label: 'Response', lines: [12, 12] },
      ],
      ready: 'Anomalies flagged as they arrive',
    },
    compile: {
      title: 'Starting the Python service',
      steps: ['Creating the virtual environment', 'Installing Flask, pandas, scikit-learn', 'Loading telemetry', 'Fitting IsolationForest', 'Serving on :5001'],
    },
    expertise: {
      head: 'Data and models',
      hi: 'in Python.',
      text: 'Python for data pipelines and ML: scikit-learn on production telemetry, PyTorch prototypes on document data, and a Flask sidecar that serves models to the product.',
      caps: ['Python', 'Flask', 'Pandas and NumPy', 'scikit-learn', 'PyTorch fundamentals', 'Data pipelines'],
      evidence: 'scikit-learn anomaly detection on database telemetry at iONE; PyTorch embedding prototypes at SISL Infotech; a Flask ML sidecar in the Healthcare AI platform.',
    },
  },

  docker: {
    display: 'Docker',
    code: {
      file: 'Dockerfile',
      lang: 'dockerfile',
      src: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
HEALTHCHECK CMD wget -qO- http://localhost:3000/health || exit 1
EXPOSE 3000
CMD ["node", "dist/mailer.js"]`,
    },
    build: {
      title: 'mailer:1.4',
      steps: [
        { label: 'Base image', lines: [0, 1] },
        { label: 'Dependencies', lines: [2, 3] },
        { label: 'Build', lines: [4, 5] },
        { label: 'Runtime stage', lines: [7, 10] },
        { label: 'Healthcheck', lines: [11, 11] },
        { label: 'Containers up', lines: [12, 13] },
      ],
      ready: 'All containers healthy',
    },
    compile: {
      title: 'Building the image',
      steps: ['Sending the build context', 'Pulling node:20-alpine', 'Reusing the cached npm ci layer', 'Exporting mailer:1.4', 'Starting containers'],
    },
    expertise: {
      head: 'Ships the same',
      hi: 'everywhere.',
      text: 'Multi-stage images with health checks for Node and .NET services, so what passed on a laptop is what runs in production.',
      caps: ['Dockerfiles', 'Multi-stage builds', 'Health checks', 'Microservices', 'Compose', 'CI/CD images'],
      evidence: 'Dockerized email-notification microservices at SISL Infotech cut notification failures ~90%; Docker in production delivery at GA Digital.',
    },
  },

  githubactions: {
    display: 'GitHub Actions',
    code: {
      file: 'deploy.yml',
      lang: 'yaml',
      src: `name: deploy
on:
  push:
    branches: [main]

jobs:
  ship:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_DEPLOY_ROLE }}
          aws-region: ap-south-1
      - run: docker build -t $ECR_REPO:$GITHUB_SHA .
      - run: docker push $ECR_REPO:$GITHUB_SHA
      - run: aws ecs update-service --cluster prod --service api --force-new-deployment`,
    },
    build: {
      title: 'deploy #214',
      steps: [
        { label: 'Push', lines: [1, 3] },
        { label: 'Checkout', lines: [9, 9] },
        { label: 'Test', lines: [10, 10] },
        { label: 'Build image', lines: [15, 15] },
        { label: 'Push to ECR', lines: [11, 14, 16, 16] },
        { label: 'Deploy to ECS', lines: [17, 17] },
      ],
      ready: 'Deployed to AWS, ap-south-1',
    },
    compile: {
      title: 'Running the workflow',
      steps: ['Queued on ubuntu-latest', 'Restoring the npm cache', 'Running tests', 'Pushing the image to ECR', 'Rolling out on ECS'],
    },
    expertise: {
      head: 'CI/CD',
      hi: 'to AWS.',
      text: 'Pipelines that test, build an image and roll it out on every merge, so releases are routine rather than events.',
      caps: ['GitHub Actions', 'AWS', 'Docker images', 'Automated tests', 'Release discipline', 'Linux and Git'],
      evidence: 'AWS, Docker and GitHub Actions CI/CD for three EESL production modules at GA Digital, with zero missed release deadlines.',
    },
  },

  llm: {
    display: 'LLMs',
    code: {
      file: 'summarizeFinding.js',
      lang: 'js',
      src: `const prompt = template('summarize-finding', {
  finding: record.text,
  audience: 'site manager',
  maxWords: 80,
});

const res = await llm.messages.create({
  model: MODEL,
  system: SYSTEM_RULES,
  messages: [{ role: 'user', content: prompt }],
});

let summary = validate(res.content[0].text, SummarySchema);
if (!summary.ok) summary = await retryWithFeedback(summary.errors);
await mailer.queue(draftNotification(record, summary.value));`,
    },
    build: {
      title: 'Finding summary',
      steps: [
        { label: 'Template', lines: [0, 4] },
        { label: 'Model call', lines: [6, 10] },
        { label: 'Output', lines: [12, 12] },
        { label: 'Validation', lines: [12, 12] },
        { label: 'Retry with feedback', lines: [13, 13] },
        { label: 'Draft email', lines: [14, 14] },
      ],
      ready: 'Validated, then queued',
    },
    compile: {
      title: 'Running the prompt',
      steps: ['Loading prompt templates', 'Calling the model', 'Validating against the schema', 'Checking length and tone', 'Queuing the draft'],
    },
    expertise: {
      head: 'Prompts with',
      hi: 'a contract.',
      text: 'OpenAI and Claude integrations where the prompt has a clear input, the output is validated, and a failure gets a retry with feedback instead of reaching a user.',
      caps: ['Prompt engineering', 'OpenAI and Claude APIs', 'Output validation', 'Tool and function calling', 'RBAC-gated access', 'Iterating to reliable'],
      evidence: 'LLM summaries of compliance findings at SISL Infotech (~60% less manual review); prompt engineering for OpenAI and Claude at Utility Powertech.',
    },
  },

  rag: {
    display: 'RAG',
    code: {
      file: 'rag.ts',
      lang: 'ts',
      src: `// ingest
const chunks = split(doc, { size: 800, overlap: 120 });
const vectors = await embed(chunks.map((c) => c.text));
await store.upsert(chunks.map((c, i) => ({ ...c, embedding: vectors[i] })));

// answer
const hits = await store.search(await embed(question), { k: 5 });
const answer = await llm.complete({
  system: 'Answer only from the sources. Cite them.',
  context: hits.map((h) => h.text),
  question,
});
return { text: answer, sources: hits.map((h) => h.source) };`,
    },
    build: {
      title: 'Retrieval-augmented answer',
      steps: [
        { label: 'Documents', lines: [0, 0] },
        { label: 'Chunking', lines: [1, 1] },
        { label: 'Embeddings', lines: [2, 2] },
        { label: 'Vector store', lines: [3, 3] },
        { label: 'Retrieve top 5', lines: [6, 6] },
        { label: 'Grounded answer', lines: [7, 12] },
      ],
      ready: 'Answered from 5 sources, cited',
    },
    compile: {
      title: 'Indexing the documents',
      steps: ['Splitting documents into chunks', 'Embedding the chunks', 'Writing to the vector store', 'Measuring retrieval hit-rate', 'Serving the assistant'],
    },
    expertise: {
      head: 'Answers grounded',
      hi: 'in the source.',
      text: 'Retrieval-augmented generation with chunking tuned against measured hit-rates, embeddings and vector search, and answers that cite what they used.',
      caps: ['Chunking strategy', 'Embeddings', 'Vector search', 'Retrieval tuning', 'Cited answers', 'REST APIs'],
      evidence: 'A RAG layer over internal documents at GA Digital cut repeat support queries ~30%; RAG over 37 medical textbooks in the Healthcare AI platform.',
    },
  },

  mcp: {
    display: 'MCP',
    code: {
      file: 'server.ts',
      lang: 'ts',
      src: `const server = new McpServer({ name: 'clinical-edu', version: '1.0.0' });

server.tool(
  'search_textbooks',
  { query: z.string(), k: z.number().default(5) },
  async ({ query, k }) => {
    const hits = await rag.search(query, k);
    return { content: [{ type: 'text', text: format(hits) }] };
  },
);

server.tool('make_quiz', { topic: z.string() }, makeQuiz);

await server.connect(new StdioServerTransport());
// the same tools over Streamable HTTP, plus a mirrored REST API`,
    },
    build: {
      title: 'clinical-edu tools',
      steps: [
        { label: 'Server', lines: [0, 0] },
        { label: 'search_textbooks', lines: [2, 9] },
        { label: 'make_quiz', lines: [11, 11] },
        { label: 'stdio', lines: [13, 13] },
        { label: 'Streamable HTTP', lines: [14, 14] },
        { label: 'Agent calls a tool', lines: [3, 7] },
      ],
      ready: 'Agent working through tools',
    },
    compile: {
      title: 'Starting the MCP server',
      steps: ['Registering tools', 'Validating tool schemas', 'Opening the stdio transport', 'Opening Streamable HTTP', 'Agent connected'],
    },
    expertise: {
      head: 'Tools for',
      hi: 'agents.',
      text: 'Model Context Protocol servers that give agents structured tools instead of free-text prompts, served locally and over HTTP from one tool layer.',
      caps: ['Model Context Protocol', 'Tool and function calling', 'Agent orchestration', 'Multi-step workflows', 'stdio and HTTP transports', 'Mirrored REST API'],
      evidence: '36+ MCP tools behind agents in the Healthcare AI Agent Platform, over stdio and Streamable HTTP with a mirrored REST API.',
    },
  },
};

// Shown once every technology has been built.
export const finalStory = {
  kicker: 'Full stack',
  head: 'From interface',
  hi: 'to system.',
  areas: [
    { k: 'Frontend', v: 'React, Next.js, Angular, TypeScript' },
    { k: 'Backend', v: 'Node.js, Express, .NET (C#), Spring Boot' },
    { k: 'Data', v: 'PostgreSQL + pgvector, MySQL, MongoDB' },
    { k: 'AI', v: 'LLMs, RAG, MCP agents' },
    { k: 'Architecture', v: 'System design, OOP, microservices' },
    { k: 'Production engineering', v: 'Docker, CI/CD, AWS, incidents' },
  ],
};

export const storyFor = (id) => techStory[id] ?? null;
