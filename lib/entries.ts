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
        note:
          'spreading small jobs evenly leaves every node with a little room and none with enough, so large jobs starve behind them.',
      },
      {
        held: false,
        claim: 'Choose the node with the most free capacity',
        note:
          'the emptiest node is often the one that just dropped a job, so failure is indistinguishable from availability.',
      },
      {
        held: true,
        claim: 'Best Fit with Trust Score tie-breaking',
        note:
          'the tightest fit keeps large contiguous blocks intact, and ties go to completion history, so dropping a job costs a node its next one.',
      },
    ],
    figures: [],
    metrics: [
      { k: 'Repo → deployed', v: '14 days', s: 'including infra' },
      { k: 'Static CI secrets', v: '0', s: 'OIDC only' },
      { k: 'Alerting on', v: 'lag, pool', s: 'before user impact' },
    ],
    body: [
      'GridNode spreads compute across volunteered machines — laptops and spare boxes that take ML training and video-rendering jobs, then leave. Every job is someone else’s code, so it runs inside Docker under gVisor rather than against the host kernel.',
      'Redis and BullMQ carry the asynchronous work, finished artifacts move out through presigned object-storage uploads, and execution logs stream over Socket.IO while a job is still running. I owned the deployment layer too: VPC, EC2, RDS and least-privilege IAM, all Terraform-provisioned, with Prometheus and Grafana on top.',
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
        note: 'the planner still chose a collection scan.',
      },
      {
        held: false,
        claim: 'Separate indexes on individual fields',
        note:
          'Mongo will not usefully intersect separate indexes for this filter, so the scan stayed.',
      },
      {
        held: true,
        claim: 'One compound index matching the query pattern',
        note: 'the planner switched to an IXSCAN and the cliff disappeared.',
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
      'Underneath the latency problem was a correctness one. Inventory decrements go through MongoDB’s $inc so the decrement itself is atomic, with rollback handling for a checkout that fails partway.',
      'Access is JWT-based, with separate roles for students, shop owners and admins. Helmet.js, CORS rules and rate limiting sit in front of that, and product listings are drafted with OpenRouter and Gemini.',
    ],
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
        note:
          'a lost response is indistinguishable from a failure, so the retry applies the same charge a second time.',
      },
      {
        held: true,
        claim: 'Buffer events and process them idempotently',
        note:
          'the key makes a resend recognisable, so an event can be delivered many times and applied once.',
      },
    ],
    body: [
      'The readers are ESP32 units on venue wi-fi, talking to the backend over MQTT. That link is allowed to vanish mid-transaction, and every other decision here follows from taking that seriously rather than treating it as an edge case.',
      'Verification degrades in layers instead of failing outright — a server check first, an LRU cache at the edge behind it, then batch reconciliation once the link returns. Device payloads are AES-256-GCM, and telemetry and sync state live in indexed PostgreSQL.',
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
      'The bot let customers configure and query their dashboards by talking to them, rather than clicking through setup screens. Speech-to-text ran on Deepgram.',
    ],
    figures: [],
    stack:
      'node.js · websockets · deepgram · llm · tts · aws · nginx',
    keywords:
      'goodmeetings voice bot speech to text llm text to speech websockets realtime streaming latency onboarding dashboards',
  },
  {
    id: 'record',
    numeral: '—',
    name: 'Record',
    meta: [],
    date: '2026-08',
    title: 'Record',
    verdict: '',
    keywords:
      'record education thapar institute patiala b.tech btech cse computer science 2027 bis hackathon finalist competitive programming 350 problems c++ leetcode backslash computing society general secretary leadership workshops languages tools',
  },
];

/** The three numbers in the cover band. Kept here, not in the component. */
export const headline = [
  { v: '2.62s', k: 'Peak latency', s: 'down from 13.08s' },
  { v: '0.00%', k: 'Error rate', s: 'down from 24.98%' },
  { v: '+27%', k: 'Throughput', s: 'same hardware' },
];

/**
 * Education and society, for the Record entry. CosmicAttire and Goodmeetings are
 * deliberately absent: they are entries 03 and 04 in full, and listing them again
 * here was the same work told twice.
 */
export const record = [
  {
    when: '2023 – 2027',
    what: 'B.Tech CSE — Thapar Institute',
    note: '· Finalist, BIS Hackathon · 350+ problems solved in C++',
  },
  {
    when: '2024 – 2025',
    what: 'General Secretary — Backslash Computing Society',
    note: '40+ members; hackathons and workshops reaching 400+ participants',
  },
];

/** Rendered once, under the Record table. */
export const toolset =
  'typescript · python · c++ · sql · bash — aws · terraform · docker · github actions · prometheus · grafana · k6 · linux';

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
