'use client';

import * as stylex from '@stylexjs/stylex';
import { useMode, usePhase, useRunning } from '@/context/speedtest';
import { useGeo } from '@/hooks/use-geo';
import { useSpeedtestControls } from '@/hooks/use-speedtest';
import { useTarget } from '@/hooks/use-target';
import type { Target } from '@/lib/targets';

const breathe = stylex.keyframes({
  '50%': { borderColor: 'rgba(235,240,248,0.3)' }
});

// On load the button grows out of the dot of the "i" (about 16% of the button width),
// brightening as it goes, so it reads as the point the page's light comes from.
const grow = stylex.keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.16)' },
  '45%': { opacity: 1 },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
});

// One ripple of light travelling outward once the button has settled.
const call = stylex.keyframes({
  '0%': { opacity: 0, transform: 'scale(1)' },
  '30%': { opacity: 0.55 },
  '100%': { opacity: 0, transform: 'scale(1.6)' }
});

const ping = stylex.keyframes({
  '50%': { transform: 'scale(1.1)' }
});

const styles = stylex.create({
  // The button is anchored over the dot of the "i"; its size is a share of the wordmark width.
  go: {
    position: 'absolute',
    left: '0.936%',
    top: { default: '14.3%', '@media (max-width: 760px)': '6%' },
    width: { default: '11.5%', '@media (max-width: 760px)': '15%' },
    aspectRatio: '1',
    transform: 'translate(-50%, -50%)',
    padding: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    display: 'grid',
    placeItems: 'center',
    cursor: { default: 'pointer', ':disabled': 'default' },
    animationName: {
      default: grow,
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    animationDuration: '1.9s',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    animationDelay: '0.35s',
    animationFillMode: 'backwards'
  },
  // A transparent ring expands the hit area beyond the visible border.
  hit: {
    content: '""',
    position: 'absolute',
    inset: -10,
    borderRadius: '50%'
  },
  // The visible hairline ring, breathing slowly while the test is idle.
  circle: {
    position: 'absolute',
    inset: 0,
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: 'rgba(235,240,248,0.7)',
    borderRadius: '50%',
    pointerEvents: 'none',
    transitionProperty: 'border-color',
    transitionDuration: '300ms',
    animationName: {
      default: breathe,
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    animationDuration: '3.6s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite'
  },
  circleRunning: {
    animationName: 'none',
    borderColor: '#fff'
  },
  // The ripple ring, travelling outward once on load.
  pulse: {
    content: '""',
    position: 'absolute',
    inset: -1.5,
    borderRadius: '50%',
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: 'rgba(235,240,248,0.6)',
    opacity: 0,
    pointerEvents: 'none',
    animationName: {
      default: call,
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    animationDuration: '2.4s',
    animationTimingFunction: 'ease-out',
    animationDelay: '1.5s',
    animationFillMode: 'backwards'
  },
  disc: {
    width: '60%',
    aspectRatio: '1',
    borderRadius: '50%',
    backgroundColor: '#f4f6fa',
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 0 6px 1px rgba(255,255,255,0.9), 0 0 28px 6px rgba(170,185,210,0.35), 0 0 90px 24px rgba(110,125,150,0.12)'
  },
  icon: {
    width: '56%',
    height: '56%',
    pointerEvents: 'none',
    overflow: 'visible'
  },
  play: { display: 'block' },
  pause: { display: 'none' },
  goHover: {
    borderColor: '#fff',
    transform: 'translate(-50%, -50%) scale(1.04)'
  },
  discRunning: {
    animationName: {
      default: ping,
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    animationDuration: '1.1s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite'
  }
});

interface StartButtonProps {
  targets: readonly Target[]
}

/** The glowing dot on the "i": starts the test, stops it, and starts again once done. */
export function StartButton({ targets }: StartButtonProps) {
  const phase = usePhase();
  const running = useRunning();
  const { isLoading: locating } = useGeo();
  const target = useTarget(targets);
  const { start, stop } = useSpeedtestControls(useMode(), target);

  return (
    <button
      type="button"
      disabled={locating}
      onClick={running ? stop : start}
      aria-label={running ? 'Stop speed test' : phase === 'done' ? 'Test again' : 'Start speed test'}
      title={running ? 'Stop' : phase === 'done' ? 'Test again' : 'Start test'}
      {...stylex.props(styles.go)}
    >
      <span aria-hidden {...stylex.props(styles.hit)} />
      <span aria-hidden {...stylex.props(styles.circle, running && styles.circleRunning)} />
      <span aria-hidden {...stylex.props(styles.pulse)} />
      <span {...stylex.props(styles.disc, running && styles.discRunning)}>
        <svg viewBox="0 0 24 24" aria-hidden="true" {...stylex.props(styles.icon)}>
          <path
            d="M8.5 5.5v13l11-6.5z"
            fill="#0b0d11"
            {...stylex.props(styles.play, running && styles.pause)}
          />
          <g fill="#0b0d11" {...stylex.props(styles.pause, running && styles.play)}>
            <rect x="6.5" y="5.5" width="4" height="13" rx="1" />
            <rect x="13.5" y="5.5" width="4" height="13" rx="1" />
          </g>
        </svg>
      </span>
    </button>
  );
}
