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

export type Shot = {
  /** file under public/shots/ */
  src: string;
  /** what a screen reader hears: describe the content, not "a screenshot of X" */
  alt: string;
  /** the caption under the frame, in the margin-note voice */
  caption: string;
  /** natural pixel size, so the browser reserves space and the page never reflows */
  w: number;
  h: number;
  /** object-position, for when the default centre crop cuts the important part */
  focus?: string;
};

export type Entry = {
  id: string;
  label: string;
  name: string;
  meta: string[];
  annotation?: string;
  date: string;
  title: string;
  /** supports ~~strikethrough~~ */
  verdict: string;
  attempts?: Attempt[];
  plot?: boolean;
  shots?: Shot[];
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
    label: 'Entry 01',
    name: 'GridNode',
    meta: ['Empty repo → deployed', '14 days'],
    annotation: 'Assumed nodes would mostly stay up. They mostly don’t.',
    date: '2026-03',
    title: 'Scheduling work onto machines that vanish',
    verdict:
      '→ Best Fit placement, Trust Score tiebreak, heartbeat requeue. Flaky nodes starve themselves.',
    attempts: [
      {
        held: false,
        claim: 'Round-robin across available nodes',
        note: 'fragmented capacity; large jobs starved behind small ones.',
      },
      {
        held: false,
        claim: 'Rank purely on free capacity',
        note: 'the fastest node was also the flakiest, and kept winning.',
      },
      {
        held: true,
        claim: 'Best Fit, ties broken on completion history',
        note: 'reputation costs an unreliable machine its next job.',
      },
    ],
    shots: [
      {
        src: '/shots/placeholder-gridnode-ui.svg',
        alt: 'The GridNode scheduler view, with jobs distributed across the node pool.',
        caption: 'Jobs landing on the pool',
        w: 800,
        h: 600,
      },
      {
        src: '/shots/placeholder-gridnode-grafana.svg',
        alt: 'A Grafana dashboard tracking event-loop lag and connection-pool saturation.',
        caption: 'Grafana — lag and pool saturation',
        w: 800,
        h: 600,
      },
    ],
    metrics: [
      { k: 'Repo → deployed', v: '14 days', s: 'including infra' },
      { k: 'Static CI secrets', v: '0', s: 'OIDC only' },
      { k: 'Alerting on', v: 'lag, pool', s: 'before user impact' },
    ],
    body: [
      'Every workload is third-party code, so every workload runs inside a gVisor sandbox — the threat model assumes it’s hostile, not merely careless. Missed heartbeats requeue the job automatically, which turns a node dropping mid-run into a status change rather than an error.',
      'I owned the deployment layer too: Terraform-provisioned VPC, EC2, RDS and least-privilege IAM, with Prometheus and Grafana watching event-loop lag and connection-pool saturation.',
    ],
    links: [
      { label: 'Source', href: 'https://github.com/cemlus/gridNode' },
      { label: 'Terraform', href: 'https://github.com/cemlus/gridNode/tree/main/infra' },
      { label: 'Scheduler', href: 'https://github.com/cemlus/gridNode/tree/main/scheduler' },
    ],
    stack:
      'node.js · redis · bullmq · socket.io · postgresql · docker · gvisor · terraform · aws · prometheus',
    keywords:
      'gridnode distributed scheduling best fit bin packing trust score heartbeat gvisor sandbox security redis bullmq socket.io postgres docker terraform aws iam oidc prometheus grafana infrastructure devops concurrency isolation',
  },
  {
    id: 'hostelbite',
    label: 'Entry 02',
    name: 'HostelBite',
    meta: ['Live · daily use', 'Node · Mongo'],
    annotation: 'The obvious index was the wrong one. Field order decides everything.',
    date: '2026-05',
    title: 'Checkout was taking thirteen seconds',
    verdict: '→ one compound index, equality-then-range. ~~13.08s~~ 2.62s, errors gone.',
    attempts: [
      {
        held: false,
        claim: 'Index on shopId',
        note: 'planner still chose COLLSCAN. The filter spans three fields.',
      },
      {
        held: false,
        claim: 'Index each field separately',
        note: 'Mongo picks one and ignores the rest.',
      },
      {
        held: true,
        claim: 'One compound index, ordered to match the query',
        note: 'IXSCAN, and the cliff disappeared.',
      },
    ],
    shots: [
      {
        src: '/shots/placeholder-hostelbite-ui.svg',
        alt: 'The HostelBite checkout screen as a student sees it.',
        caption: 'Checkout, the thirteen-second one',
        w: 800,
        h: 600,
      },
      {
        src: '/shots/placeholder-hostelbite-explain.svg',
        alt: 'MongoDB explain() output showing an IXSCAN stage where a COLLSCAN used to be.',
        caption: 'explain() — IXSCAN, at last',
        w: 800,
        h: 600,
      },
    ],
    plot: true,
    metrics: [
      { k: 'Peak latency', v: '2.62s', s: 'from 13.08s' },
      { k: 'Error rate', v: '0.00%', s: 'from 24.98%' },
      { k: 'Throughput', v: '+27%', s: 'same hardware' },
    ],
    body: [
      'Same system, quieter bug: two students could both buy the last unit. Inventory now decrements atomically with rollback on partial failure — thirty concurrent checkouts, zero oversells.',
    ],
    links: [
      { label: 'Live', href: 'https://github.com/cemlus/hostel-bite' },
      { label: 'Source', href: 'https://github.com/cemlus/hostel-bite' },
      { label: 'k6 script', href: 'https://github.com/cemlus/hostel-bite/tree/main/loadtest' },
    ],
    stack: 'node.js · express · mongodb · jwt · k6 · helmet.js',
    keywords:
      'hostelbite mongodb compound index latency k6 load test concurrency race condition inventory oversell query plan collscan ixscan jwt node express live throughput databases indexing',
  },
  {
    id: 'cosmicattire',
    label: 'Entry 03',
    name: 'CosmicAttire',
    meta: ['Apr – Aug 2026', 'Sole backend owner'],
    annotation: 'Treating the network as reliable was the bug. Venue wi-fi is a partition generator.',
    date: '2026-06',
    title: 'Payments where the network keeps dropping',
    verdict: '→ buffer on-device, sync with idempotency keys. Exactly-once through a partition.',
    attempts: [
      {
        held: false,
        claim: 'Retry the tap on failure',
        note: 'duplicate charges. Retries need identity, not just persistence.',
      },
      {
        held: true,
        claim: 'Idempotency keys on buffered events',
        note: 'a resend is recognised, not re-charged.',
      },
    ],
    body: [
      'Verification degrades through three layers: server check, LRU edge cache, then batch reconciliation once the link returns. Payloads are AES-256-GCM with MAC-based device authentication, over indexed PostgreSQL schemas for hardware telemetry and sync state.',
    ],
    stack: 'express · postgresql · supabase · esp32 · aes-256-gcm',
    keywords:
      'cosmicattire iot esp32 nfc payments idempotency exactly once partition offline lru cache supabase postgres aes encryption security startup backend owner databases',
  },
  {
    id: 'goodmeetings',
    label: 'Entry 04',
    name: 'Goodmeetings.ai',
    meta: ['Jul – Aug 2025', 'Intern'],
    date: '2025-08',
    title: 'Talking to a dashboard',
    verdict: '→ shipped a voice onboarding bot inside production latency budget.',
    body: [
      'Speech to text, LLM, text to speech. Most of the work was budgeting latency across the three stages, and scoping open-ended requirements with product managers into something that could actually ship.',
    ],
    stack: 'python · llm pipelines · latency tuning',
    keywords:
      'goodmeetings intern voice bot stt llm tts latency pipeline product natural language dashboards',
  },
  {
    id: 'record',
    label: 'Log',
    name: 'Record',
    meta: [],
    date: '2023-09',
    title: 'Record',
    verdict: '',
    keywords:
      'thapar education btech cse cgpa leetcode c++ dsa algorithms backslash society general secretary hackathon bis roles record languages tools',
  },
];

export const record = [
  {
    when: '2023 – 2027',
    what: 'B.Tech CSE — Thapar Institute',
    note: 'CGPA 8.35 · Finalist, BIS Hackathon · 340+ problems in C++.',
  },
  {
    when: '2024 – 2025',
    what: 'General Secretary — Backslash Computing Society',
    note: '40+ members; events reaching 400+ participants.',
  },
];

export const toolset =
  'typescript · javascript · python · c++ · sql · bash — aws · terraform · docker · github actions · prometheus · grafana · k6 · linux';

export const profile = {
  name: 'Siddhant Bhardwaj',
  role: 'Backend engineer',
  location: 'New Delhi, IN',
  cohort: 'B.Tech CSE ’27',
  email: 'siddhantbhardwaj47@gmail.com',
  github: 'https://github.com/cemlus',
  linkedin: 'https://www.linkedin.com/in/sidbhardwaj47',
  leetcode: 'https://leetcode.com/u/siddhantbh',
  resume: '/resume.pdf',
};
