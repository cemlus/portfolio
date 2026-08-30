export type Metric = { k: string; v: string; s?: string };

export type Attempt = {
  /** false = a hypothesis that was ruled out, true = the one that survived */
  held: boolean;
  /** the hypothesis itself — struck through when held is false */
  claim: string;
  /** what the measurement said */
  note: string;
};

export type ProofLink = { label: string; href: string };

export type Figure = {
  /** file under public/ */
  src: string;
  alt: string;
  caption: string;
};

export type Entry = {
  id: string;
  /** serif numeral at the top of the gutter; '—' for the Experience ledger */
  numeral: string;
  name: string;
  meta: string[];
  /** roles are jobs; projects are things I built on my own time. Absent on the ledger. */
  kind?: 'role' | 'project';
  annotation?: string;
  date: string;
  title: string;
  /** supports ~~strikethrough~~ */
  verdict: string;
  attempts?: Attempt[];
  plot?: boolean;
  figures?: Figure[];
  metrics?: Metric[];
  body?: string[];
  links?: ProofLink[];
  stack?: string;
  /** extra search terms not present in the visible copy */
  keywords: string;
};

export const entries: Entry[] = [
  {
    id: 'gridnode',
    numeral: '01',
    name: 'GridNode',
    meta: ['Mar 2026', 'Solo build · empty repo → deployed in 14 days'],
    kind: 'project',
    annotation: 'Assumed nodes would mostly stay up. They mostly don’t.',
    date: '2026-03',
    title: 'Scheduling work onto unreliable machines',
    verdict:
      '→ Best Fit placement, Trust Score tiebreak, heartbeat-based failure detection and job requeue.',
    attempts: [
      {
        held: false,
        claim: 'Round-robin across available nodes',
        note: 'simple distribution, but ignores heterogeneous capacity and job requirements.',
      },
      {
        held: false,
        claim: 'Choose the node with the most free capacity',
        note: 'works for individual placements, but can leave fragmentation and does not account for node reliability.',
      },
      {
        held: true,
        claim: 'Best Fit with Trust Score tie-breaking',
        note: 'packs work more efficiently while preferring historically reliable machines when capacity is comparable.',
      },
    ],
    figures: [],
    metrics: [
      { k: 'Repo → deployed', v: '17 days', s: 'including infra' },
      { k: 'Static CI secrets', v: '0', s: 'OIDC only' },
      { k: 'Alerting on', v: 'lag, pool', s: 'before user impact' },
    ],
    body: [
      'Built a decentralized compute-sharing platform for ML and video-rendering workloads, with Best Fit scheduling, Trust Score tie-breaking and heartbeat-based machine failure detection.',
      'Jobs execute inside Docker and gVisor isolation, while Redis/BullMQ handles asynchronous work and email processing. Completed artifacts are transferred through presigned object-storage uploads and execution logs are streamed over Socket.IO.',
      'I owned the deployment layer too: Terraform-provisioned VPC, EC2, RDS and least-privilege IAM, with Prometheus and Grafana watching event-loop lag and connection-pool saturation.',
    ],
    links: [
      { label: 'Source', href: 'https://github.com/cemlus/gridNode' },
      { label: 'Terraform', href: 'https://github.com/cemlus/gridNode/tree/main/infra' },
    ],
    stack:
      'node.js · redis · bullmq · socket.io · postgresql · docker · gvisor · terraform · aws · prometheus',
    keywords:
      'gridnode distributed scheduling best fit bin packing trust score heartbeat gvisor sandbox security redis bullmq socket.io postgres docker terraform aws s3 iam oidc prometheus grafana infrastructure devops concurrency isolation',
  },
  {
    id: 'hostelbite',
    numeral: '02',
    name: 'HostelBite',
    meta: ['May 2026', 'Solo build · live, in daily use'],
    kind: 'project',
    annotation: 'The obvious index was the wrong one. Field order decides everything.',
    date: '2026-05',
    title: 'Checkout was taking thirteen seconds',
    verdict: '→ A query-shaped compound index changed the access path: peak latency fell from 13.08s to 2.62s.',
    attempts: [
      {
        held: false,
        claim: 'Index on shopId',
        note: 'the query still did not have an efficient access path for its full filter.',
      },
      {
        held: false,
        claim: 'Separate indexes on individual fields',
        note: 'multiple indexes still did not match the query shape efficiently.',
      },
      {
        held: true,
        claim: 'One compound index matching the query pattern',
        note: 'the planner moved to an index-backed execution path and the latency cliff disappeared.',
      },
    ],
    figures: [],
    plot: true,
    metrics: [
      { k: 'Peak latency', v: '2.62s', s: 'from 13.08s' },
      { k: 'Peak failure rate', v: '0.00%', s: 'from 24.98%' },
      { k: 'Throughput', v: '+27%', s: 'same hardware' },
      { k: 'Load tested', v: '4,900+', s: 'requests' },
      { k: 'Concurrent checkouts', v: '30', s: 'zero oversells' },
    ],
    body: [
      'Diagnosed a MongoDB query bottleneck responsible for 13.08s peak latency under load. After replacing the ineffective indexing strategy with a query-aligned compound index, peak latency dropped to 2.62s and throughput increased 27%, validated through 4,900+ k6 requests.',
      'Separately, engineered atomic inventory decrements with MongoDB $inc and rollback handling for failed checkouts, then stress-tested 30 concurrent checkout transactions without race conditions or overselling.',
      'Implemented JWT authentication and RBAC for Students, Shop Owners and Admins, with Helmet.js, CORS controls, rate limiting and OpenRouter/Gemini-assisted product listing generation.',],
    links: [
      { label: 'Live', href: 'https://hostel-bite-kohl.vercel.app' },
      { label: 'Source', href: 'https://github.com/cemlus/hostel-bite' },
      { label: 'k6 scripts', href: 'https://github.com/cemlus/hostel-bite/tree/main/load_tests' },
    ],
    stack: 'node.js · express · mongodb · jwt · k6 · helmet.js',
    keywords:
      'hostelbite mongodb compound index latency k6 load test concurrency race condition inventory oversell query plan collscan ixscan jwt node express live throughput databases indexing',
  },
  {
    id: 'cosmicattire',
    numeral: '03',
    name: 'CosmicAttire',
    meta: ['Apr – Aug 2026', 'Backend Lead · early-stage startup'],
    kind: 'role',
    annotation: 'The network is allowed to disappear. The transaction still cannot happen twice.',
    date: '2026-06',
    title: 'Making hardware payments survive bad networks',
    verdict:
      '→ Buffer events, attach stable idempotency keys, validate from cache when necessary, and reconcile once connectivity returns.',
    attempts: [
      {
        held: false,
        claim: 'Retry failed transactions directly',
        note: 'a retry can duplicate the same business operation when the original response is lost.',
      },
      {
        held: true,
        claim: 'Buffer events and process them idempotently',
        note: 'the same transaction can be delivered multiple times without being applied multiple times.',
      },
    ],
    body: [
      'Owned backend architecture for an IoT-to-server synchronization flow connecting distributed ESP32 readers to the backend through MQTT, including buffered NFC events, transaction identifiers and retry-safe processing.',
      'Designed a three-layer offline-first verification pipeline using server validation, LRU caching and batch reconciliation so degraded connectivity did not immediately break verification.',
      'Protected device payloads with AES-256-GCM and maintained indexed PostgreSQL state for hardware telemetry and synchronization.',
    ],
    links: [],
    stack:
      'express · postgresql · supabase · redis · mqtt · esp32 · aes-256-gcm',
    keywords:
      'cosmicattire iot esp32 nfc mqtt payments idempotency retries offline first synchronization lru cache postgres redis encryption distributed systems backend security',
  },
  {
    id: 'goodmeetings',
    numeral: '04',
    name: 'Goodmeetings.ai',
    meta: ['Jul – Aug 2025', 'Product Development Intern'],
    kind: 'role',
    annotation: 'Voice UX fails when any one stage blocks the entire pipeline.',
    date: '2025-08',
    title: 'Building a real-time voice interface for dashboards',
    verdict:
      '→ WebSocket sessions, queued transcript processing, LLM generation and per-turn TTS streaming kept the voice pipeline interactive.',
    attempts: [
      {
        held: false,
        claim: 'Process every transcript immediately',
        note: 'overlapping LLM/TTS work can cause responses to race and audio state to leak between turns.',
      },
      {
        held: true,
        claim: 'Queue final transcripts and process them serially',
        note: 'one conversational turn completes before the next begins, keeping state and TTS sessions isolated.',
      },
    ],
    body: [
      'Built a voice-driven onboarding bot that let customers configure and query dashboards using natural language.',
      'Implemented the real-time path around WebSockets, Deepgram speech-to-text, LLM response generation and per-turn text-to-speech streaming, with a transcript queue to serialize conversational turns.',
    ],
    figures: [],
    stack:
      'node.js · websockets · deepgram · llm · tts · aws · nginx',
    keywords:
      'goodmeetings voice bot speech to text llm text to speech websockets realtime streaming latency onboarding dashboards',
  },
  {
    id: 'experience',
    numeral: '—',
    name: 'Experience',
    meta: [],
    date: '2026-08',
    title: 'Experience',
    verdict: '',
    keywords:
      'experience employment work history roles jobs internship intern cosmicattire goodmeetings backend owner product development early stage startup 2025 2026',
  },
];

/** The three numbers in the cover band. Kept here, not in the component. */
export const headline = [
  { v: '2.62s', k: 'Peak latency', s: 'down from 13.08s' },
  { v: '0.00%', k: 'Error rate', s: 'down from 24.98%' },
  { v: '+27%', k: 'Throughput', s: 'same hardware' },
];

/**
 * The two paid roles, for the ledger entry. Every note here is a compression of
 * that project entry's own verdict and body — nothing is asserted that the page
 * does not already say at length.
 */
export const roles = [
  {
    when: 'Apr - Aug 2026',
    what: 'Backend Lead — CosmicAttire',
    note: 'Owned the backend for an IoT-to-server sync flow: buffered NFC events over MQTT from distributed ESP32 readers, idempotency keys for retry-safe processing, three-layer offline-first verification, AES-256-GCM device payloads over indexed PostgreSQL.',
  },
  {
    when: 'Jul - Aug 2025',
    what: 'Product Development Intern — Goodmeetings.ai',
    note: 'Built a voice-driven onboarding bot for configuring and querying dashboards in natural language — WebSockets, Deepgram speech-to-text, LLM generation and per-turn TTS streaming, with a transcript queue serialising conversational turns.',
  },
];

export const profile = {
  name: 'Siddhant Bhardwaj',
  role: 'Software engineer',
  location: 'New Delhi, IN',
  cohort: 'B.Tech CSE ’27',
  email: 'siddhantbhardwaj47@gmail.com',
  github: 'https://github.com/cemlus',
  linkedin: 'https://www.linkedin.com/in/sidbhardwaj47',
  leetcode: 'https://leetcode.com/u/siddhantbh',
  resume: '/resume.pdf',
};
