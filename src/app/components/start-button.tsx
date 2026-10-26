'use client';

import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';
import { useMode, usePhase, useRunning } from '@/context/speedtest';
import { useGeo } from '@/hooks/use-geo';
import { useSpeedtestControls } from '@/hooks/use-speedtest';
import { useTarget } from '@/hooks/use-target';
import type { Target } from '@/lib/targets';

const ring = stylex.keyframes({
  '50%': { borderColor: 'rgba(235,240,248,0.3)' }
});

const ping = stylex.keyframes({
  '50%': { transform: 'scale(1.1)' }
});

const call = stylex.keyframes({
  '0%': { opacity: 0.7, transform: 'scale(1)' },
  '100%': { opacity: 0, transform: 'scale(1.55)' }
});

const breath = stylex.keyframes({
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
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: 'rgba(235,240,248,0.7)',
    borderRadius: '50%',
    background: 'none',
    backgroundColor: 'transparent',
    display: 'grid',
    placeItems: 'center',
    cursor: { default: 'pointer', ':disabled': 'default' },
    transitionProperty: 'border-color, transform',
    transitionDuration: '300ms',
    animationName: {
      default: ring,
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    animationDuration: '3.6s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite'
  },
  // A transparent ring expands the hit area beyond the visible border.
  hit: {
    content: '""',
    position: 'absolute',
    inset: -10,
    borderRadius: '50%'
  },
  // The intro pulse ring, shown once on the first visit.
  pulse: {
    content: '""',
    position: 'absolute',
    inset: -1.5,
    borderRadius: '50%',
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: 'rgba(235,240,248,0.6)',
    opacity: 0,
    pointerEvents: 'none'
  },
  pulseIntro: {
    animationName: call,
    animationDuration: '2.6s',
    animationTimingFunction: 'ease-out',
    animationDelay: '1.9s',
    animationFillMode: 'both'
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
  discIntro: {
    animationName: breath,
    animationDuration: '2.6s',
    animationTimingFunction: 'ease-in-out',
    animationDelay: '1.9s',
    animationFillMode: 'both'
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
  goRunning: {
    animationName: 'none',
    borderColor: '#fff'
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
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('inshadow:speed-seen')) {
        localStorage.setItem('inshadow:speed-seen', '1');
        setIntro(true);
        const t = setTimeout(() => setIntro(false), 5200);
        return () => clearTimeout(t);
      }
    } catch { /* storage unavailable */ }
  }, []);

  return (
    <button
      type="button"
      disabled={locating}
      onClick={running ? stop : start}
      aria-label={running ? 'Stop speed test' : phase === 'done' ? 'Test again' : 'Start speed test'}
      title={running ? 'Stop' : phase === 'done' ? 'Test again' : 'Start test'}
      {...stylex.props(
        styles.go,
        running && styles.goRunning
      )}
    >
      <span aria-hidden {...stylex.props(styles.hit)} />
      <span aria-hidden {...stylex.props(styles.pulse, intro && styles.pulseIntro)} />
      <span {...stylex.props(styles.disc, intro && styles.discIntro, running && styles.discRunning)}>
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
