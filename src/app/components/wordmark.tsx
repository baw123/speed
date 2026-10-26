'use client';

import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';
import { usePhase } from '@/context/speedtest';

// The "inshadow" lettering copied from the reference: 15-unit monoline strokes on a 801×168 grid
// (x-height 100–188, ascender 32, bowls r=37.5). The mark fades from a lit radial gradient centred
// on the dot of the "i", and the "w" keeps only its x-height strokes via a clip path.
const PATHS = [
  // i
  'M7.5 100V188',
  // n
  'M46.5 100V188M46.5 144A37.5 37.5 0 0 1 121.5 144V188',
  // s
  'M211.5 119C206.5 111 196.5 107.5 184.5 107.5C167.5 107.5 156.5 115 156.5 126C156.5 137 169.5 141 184.5 144C200.5 147 212.5 152 212.5 163C212.5 174 200.5 180.5 184.5 180.5C172.5 180.5 161.5 176 156.5 168',
  // h
  'M247.5 32V188M247.5 144A37.5 37.5 0 0 1 322.5 144V188',
  // a
  'M356 144a37.5 37.5 0 1 0 75 0a37.5 37.5 0 1 0 -75 0ZM431 100V188',
  // d
  'M464.5 144a37.5 37.5 0 1 0 75 0a37.5 37.5 0 1 0 -75 0ZM539.5 32V188',
  // o
  'M573 144a37.5 37.5 0 1 0 75 0a37.5 37.5 0 1 0 -75 0Z',
  // w
  'M670.6 86L673.7 96L703.7 192L733.7 96L763.7 192L793.7 96L796.8 86'
];

const drift = stylex.keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.3 }
});

const rise = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 }
});

const styles = stylex.create({
  brand: {
    position: 'relative',
    width: 'min(100%, 60rem)',
    lineHeight: 0,
    animationName: {
      default: 'none',
      '@media (prefers-reduced-motion: no-preference)': rise
    },
    animationDuration: '1.8s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both'
  },
  mark: {
    display: 'block',
    width: '100%',
    height: 'auto',
    overflow: 'visible'
  },
  strokes: {
    fill: 'none',
    stroke: 'url(#wordmark-lit)',
    strokeWidth: 15,
    strokeLinecap: 'butt',
    strokeLinejoin: 'miter',
    strokeMiterlimit: 8
  },
  drift: {
    animationName: {
      default: 'none',
      '@media (prefers-reduced-motion: no-preference)': drift
    },
    animationDuration: '11s',
    animationTimingFunction: 'ease-in-out',
    animationDelay: '4.6s',
    animationIterationCount: 'infinite'
  }
});

interface WordmarkProps {
  /** The start/stop button, absolutely positioned over the dot of the "i" by its own styles. */
  button?: React.ReactNode
}

/** The "inshadow" wordmark; the light source of the page sits on the dot of the "i". */
export function Wordmark({ button }: WordmarkProps) {
  const phase = usePhase();
  const gradRef = useRef<SVGRadialGradientElement>(null);
  // The lit gradient's radius grows while a run is in progress and settles once it ends,
  // mirroring the reference's expanding glow.
  useEffect(() => {
    const el = gradRef.current;
    if (el === null) return;
    const running = phase === 'latency' || phase === 'download' || phase === 'upload';
    el.setAttribute('r', running ? '1260' : phase === 'done' ? '700' : '360');
  }, [phase]);

  return (
    <div {...stylex.props(styles.brand)} role="img" aria-label="inshadow">
      <svg viewBox="0 26 801 168" aria-hidden="true" focusable="false" {...stylex.props(styles.mark)}>
        <defs>
          <radialGradient
            id="wordmark-lit"
            ref={gradRef}
            gradientUnits="userSpaceOnUse"
            cx="7.5"
            cy="50"
            r="360"
            style={{ transition: 'r 4s ease' }}
          >
            <stop offset="0" stopColor="#bcc4cd" />
            <stop offset="0.06" stopColor="#848f9a" />
            <stop offset="0.18" stopColor="#49525c" />
            <stop offset="0.36" stopColor="#2a323a" />
            <stop offset="0.62" stopColor="#1a2027" />
            <stop offset="1" stopColor="#14191f" />
          </radialGradient>
          <clipPath id="wordmark-xh"><rect x="-10" y="100" width="1100" height="88" /></clipPath>
        </defs>
        <g {...stylex.props(styles.strokes)}>
          {PATHS.slice(0, 3).map((d) => <path key={d} d={d} />)}
          <g {...stylex.props(styles.drift)}>
            {PATHS.slice(3, 7).map((d) => <path key={d} d={d} />)}
            <g clipPath="url(#wordmark-xh)"><path d={PATHS[7]} /></g>
          </g>
        </g>
      </svg>
      {button}
    </div>
  );
}
