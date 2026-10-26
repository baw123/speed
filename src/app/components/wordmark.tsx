'use client';

import * as stylex from '@stylexjs/stylex';
import { bp } from '../../styles/breakpoints.stylex';
import { colors } from '../../styles/tokens.stylex';

// The inshadow.uk homepage mark is lettering, not type: every glyph is a 15-unit monoline stroke on
// a 801x168 grid (x-height 100-188, ascender 32, bowls r=37.5). These paths keep that system — the
// n, s, h, a, d, o and w are the homepage's own geometry, and p, e, u, k follow the same rules.
const PATHS = [
  // s
  'M55 119C50 111 40 107.5 28 107.5C11 107.5 0 115 0 126C0 137 13 141 28 144C44 147 56 152 56 163C56 174 44 180.5 28 180.5C16 180.5 5 176 0 168',
  // p
  'M89 100V236M89 144a37.5 37.5 0 1 0 75 0a37.5 37.5 0 1 0 -75 0Z',
  // e
  'M272 144A37.5 37.5 0 1 1 258.6 115.3M272 144H197',
  // e
  'M380 144A37.5 37.5 0 1 1 366.6 115.3M380 144H305',
  // d
  'M413 144a37.5 37.5 0 1 0 75 0a37.5 37.5 0 1 0 -75 0ZM488 32V188',
  // i
  'M576.5 100V188',
  // n
  'M617 100V188M617 144A37.5 37.5 0 0 1 692 144V188',
  // s
  'M780 119C775 111 765 107.5 753 107.5C736 107.5 725 115 725 126C725 137 738 141 753 144C769 147 781 152 781 163C781 174 769 180.5 753 180.5C741 180.5 730 176 725 168',
  // h
  'M814 32V188M814 144A37.5 37.5 0 0 1 889 144V188',
  // a
  'M922 144a37.5 37.5 0 1 0 75 0a37.5 37.5 0 1 0 -75 0ZM997 100V188',
  // d
  'M1030 144a37.5 37.5 0 1 0 75 0a37.5 37.5 0 1 0 -75 0ZM1105 32V188',
  // o
  'M1138 144a37.5 37.5 0 1 0 75 0a37.5 37.5 0 1 0 -75 0Z',
  // w
  'M1250 100L1280 192L1310 100L1340 192L1370 100',
  // u
  'M1451 100V144A37.5 37.5 0 0 0 1526 144V100',
  // k
  'M1559 32V188M1609 100L1559 144L1615 192'
];

const DOTS: ReadonlyArray<readonly [number, number, number]> = [
  [528.5, 180.5, 7.5]
];

/** The last dot belongs to the fading "inshadow.uk" run, so it takes the gradient too. */
const TAIL_DOTS: ReadonlyArray<readonly [number, number, number]> = [
  [1410.5, 180.5, 7.5]
];

const styles = stylex.create({
  mark: {
    display: 'block',
    height: { default: 30, [bp.large]: 36 },
    width: 'auto',
    color: colors.ink,
    overflow: 'visible'
  }
});

/** The wordmark, drawn as the homepage's monoline lettering so both sites read the same. */
export function Wordmark() {
  return (
    <svg viewBox="-40 -10 1695 253.5" role="img" aria-label="speed.inshadow.uk" {...stylex.props(styles.mark)}>
      <defs>
        {/* The dot of the "i" is a light source on the homepage: hot core inside a soft halo. */}
        <radialGradient id="wordmark-glow">
          <stop offset="0%" stopColor="#F7FAFC" stopOpacity={0.5} />
          <stop offset="30%" stopColor="#F7FAFC" stopOpacity={0.18} />
          <stop offset="100%" stopColor="#F7FAFC" stopOpacity={0} />
        </radialGradient>
        {/* "inshadow.uk" dims as it walks away from the light, exactly like the homepage mark. */}
        <linearGradient id="wordmark-fade" gradientUnits="userSpaceOnUse" x1={560} y1={0} x2={1600} y2={0}>
          <stop offset="0%" stopColor="#EDF2F7" />
          <stop offset="35%" stopColor="#8E97A3" />
          <stop offset="100%" stopColor="#22262D" />
        </linearGradient>
      </defs>
      {/* "speed." stays at full ink. */}
      <g fill="none" stroke="currentColor" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round">
        {PATHS.slice(0, 5).map((d) => <path key={d} d={d} />)}
      </g>
      {/* "inshadow.uk" fades into the dark. */}
      <g fill="none" stroke="url(#wordmark-fade)" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round">
        {PATHS.slice(5).map((d) => <path key={d} d={d} />)}
      </g>
      <circle cx={576.5} cy={70} r={64} fill="url(#wordmark-glow)" style={{ mixBlendMode: 'screen' }} />
      <g fill="#F7FAFC">
        {DOTS.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
        <circle cx={576.5} cy={70} r={10} />
      </g>
      <g fill="url(#wordmark-fade)">
        {TAIL_DOTS.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
      </g>
    </svg>
  );
}
