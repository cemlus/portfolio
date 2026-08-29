'use client';

import { useEffect, useRef, useState } from 'react';

const BEFORE = [
  0.4, 0.5, 0.7, 0.9, 1.4, 2.2, 3.1, 4.4, 5.9, 7.2, 8.6, 9.8, 11.1, 12.0, 12.6,
  13.08, 12.9, 12.4, 12.7, 13.0, 12.2, 11.8, 12.1, 11.5,
];
const AFTER = [
  0.28, 0.3, 0.35, 0.4, 0.48, 0.55, 0.62, 0.7, 0.85, 0.95, 1.1, 1.3, 1.5, 1.75,
  1.95, 2.2, 2.4, 2.62, 2.5, 2.45, 2.55, 2.38, 2.42, 2.3,
];

const X0 = 38;
const X1 = 612;
const YT = 16;
const YB = 150;
const MAX = 14;

const px = (i: number) => X0 + ((X1 - X0) * i) / (BEFORE.length - 1);
const py = (v: number) => YB - ((YB - YT) * Math.min(v, MAX)) / MAX;

function toPoints(values: number[]) {
  return values.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
}

export default function LatencyPlot() {
  const [indexed, setIndexed] = useState(false);
  const lineRef = useRef<SVGPolylineElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const frame = useRef<number | null>(null);
  const current = useRef<number[]>([...BEFORE]);

  useEffect(() => {
    const target = indexed ? AFTER : BEFORE;
    const from = [...current.current];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const paint = (values: number[]) => {
      const pts = toPoints(values);
      lineRef.current?.setAttribute('points', pts);
      areaRef.current?.setAttribute(
        'd',
        `M${X0},${YB} L${pts.split(' ').join(' L')} L${X1},${YB} Z`
      );
    };

    if (reduce) {
      current.current = [...target];
      paint(target);
      return;
    }

    const start = performance.now();
    const DURATION = 600;

    const step = (now: number) => {
      const k = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - k, 3);
      current.current = from.map((v, i) => v + (target[i] - v) * eased);
      paint(current.current);
      if (k < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [indexed]);

  const stroke = indexed ? 'var(--line-cool)' : 'var(--line-warm)';
  const fill = indexed ? 'var(--plot-cool)' : 'var(--plot-warm)';

  return (
    <div className="plotwrap">
      <p className="plothead">
        <span>POST /checkout · response time</span>
        <span className="sw" role="group" aria-label="Index state">
          <button
            type="button"
            aria-pressed={!indexed}
            onClick={() => setIndexed(false)}
          >
            before
          </button>
          <button
            type="button"
            aria-pressed={indexed}
            onClick={() => setIndexed(true)}
          >
            after
          </button>
        </span>
      </p>

      <svg
        className="plot"
        viewBox="0 0 620 176"
        role="img"
        aria-label={
          indexed
            ? 'Response time holding near two seconds for the whole run with the compound index in place'
            : 'Response time climbing to thirteen seconds and staying there without the index'
        }
      >
        <g className="gl">
          <line x1="38" y1="16" x2="612" y2="16" />
          <line x1="38" y1="56" x2="612" y2="56" />
          <line x1="38" y1="96" x2="612" y2="96" />
          <line x1="38" y1="150" x2="612" y2="150" />
        </g>
        <g className="ax" textAnchor="end">
          <text x="31" y="20">14s</text>
          <text x="31" y="60">10s</text>
          <text x="31" y="100">6s</text>
          <text x="31" y="154">0</text>
        </g>
        <path ref={areaRef} fill={fill} d={`M${X0},${YB} L${toPoints(BEFORE).split(' ').join(' L')} L${X1},${YB} Z`} />
        <polyline
          ref={lineRef}
          fill="none"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
          points={toPoints(BEFORE)}
        />
        <g className="ax">
          <text x="38" y="170">start</text>
          <text x="612" y="170" textAnchor="end">5 min</text>
        </g>
      </svg>

      <p className="plotnote" aria-live="polite">
        {indexed
          ? 'Same load, same hardware. Peak 2.62s, zero failures, 27% more throughput.'
          : 'Latency climbs with virtual users and never recovers — 24.98% of requests fail outright.'}
      </p>
      <p className="method">
        Method — k6, 60 virtual users ramped over 30s and held for 5 min, 4,900+
        requests against a single t3.micro app node and a shared Atlas M0. Same
        seed data and same machine for both runs; the only change is the index.
      </p>
    </div>
  );
}
