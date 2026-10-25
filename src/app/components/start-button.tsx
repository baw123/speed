'use client';

import * as stylex from '@stylexjs/stylex';
import { use } from 'react';
import { Button } from '@base-ui/react/button';
import { DownloadContext, UploadContext, useMode, usePhase, useRunning } from '@/context/speedtest';
import { useGeo } from '@/hooks/use-geo';
import { useSpeedtestControls } from '@/hooks/use-speedtest';
import { useTarget } from '@/hooks/use-target';
import { LATENCY_BUDGET } from '@/lib/engine';
import type { Phase } from '@/lib/engine';
import { MAX_DURATION, MIN_DURATION, SAMPLE_INTERVAL } from '@/lib/stability';
import type { Target } from '@/lib/targets';
import { bp } from '../../styles/breakpoints.stylex';
import { colors } from '../../styles/tokens.stylex';

const STAGES: readonly Phase[] = ['latency', 'download', 'upload'];
const MAX_SAMPLES = Math.round(MAX_DURATION / SAMPLE_INTERVAL);
// Each phase's share of the fill is how long it usually takes, in seconds: latency spends its
// budget, and most transfers stop soon after the minimum.
const LATENCY_SHARE = LATENCY_BUDGET / 1000;
const TRANSFER_SHARE = MIN_DURATION;

/**
 * How far through its share a transfer is, read off the stop rule's own clock (one trend point per
 * sample): about 81% by the earliest it can stop. It never reaches the end, since the engine still
 * settles after the last sample; the next phase is what completes it.
 */
function transferProgress(samples: number) {
  const remaining = 1 - Math.min(1, samples / MAX_SAMPLES);
  return 0.95 * (1 - (remaining ** 3));
}

const styles = stylex.create({
  // A small-caps line with a hairline underline; no box, no fill.
  button: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    paddingTop: 0,
    paddingInline: 0,
    paddingBottom: 6,
    borderStyle: 'none',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: { default: colors.line, ':hover': colors.ink },
    backgroundColor: 'transparent',
    color: colors.ink,
    fontFamily: 'inherit',
    fontSize: { default: 13, [bp.large]: 15 },
    fontWeight: 400,
    fontVariantCaps: 'all-small-caps',
    lineHeight: 1.4,
    letterSpacing: '0.16em',
    cursor: { default: 'pointer', ':disabled': 'default' },
    opacity: { default: 1, ':disabled': 0.5 },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 4,
    transitionProperty: 'border-color, color',
    transitionDuration: '150ms'
  },
  buttonQuiet: { color: colors.inkMuted },
  // Progress is the underline itself, growing from the left as the run advances.
  progress: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 1,
    transformOrigin: 'left',
    transform: 'scaleX(0)',
    backgroundColor: colors.ink
  },
  progressTo: (transform: string, duration: string, easing: string) => ({
    transform,
    transitionProperty: 'transform',
    transitionDuration: duration,
    transitionTimingFunction: easing
  })
});

interface StartButtonProps {
  targets: readonly Target[],
  idleSlot: React.ReactNode,
  runningSlot: React.ReactNode,
  doneSlot: React.ReactNode
}

export function StartButton({ targets, idleSlot, runningSlot, doneSlot }: StartButtonProps) {
  const phase = usePhase();
  const running = useRunning();
  // The region is not settled until the lookup has answered.
  const { isLoading: locating } = useGeo();
  const target = useTarget(targets);
  const { start, stop } = useSpeedtestControls(useMode(), target);
  const stages = target.upload.length > 0 ? STAGES : STAGES.slice(0, 2);
  return (
    <Button
      disabled={locating}
      onClick={running ? stop : start}
      {...stylex.props(styles.button, running && styles.buttonQuiet)}
    >
      <Progress stages={stages} />
      {phase === 'idle' && idleSlot}
      {running && runningSlot}
      {phase === 'done' && doneSlot}
    </Button>
  );
}

/** Latency fills its share over its time budget; a transfer is retargeted on every sample. */
function Progress({ stages }: { stages: readonly Phase[] }) {
  const phase = usePhase();
  const { trend } = use(phase === 'upload' ? UploadContext : DownloadContext);
  const current = stages.indexOf(phase);
  const total = LATENCY_SHARE + (TRANSFER_SHARE * (stages.length - 1));
  const transferStart = LATENCY_SHARE + (TRANSFER_SHARE * (current - 1));
  return (
    <span
      aria-hidden
      {...stylex.props(
        styles.progress,
        phase === 'latency' && styles.progressTo(`scaleX(${LATENCY_SHARE / total})`, `${LATENCY_BUDGET}ms`, 'linear'),
        // Spans two samples, so the fill keeps moving between them.
        current > 0 && styles.progressTo(`scaleX(${(transferStart + (TRANSFER_SHARE * transferProgress(trend.length))) / total})`, '200ms', 'linear')
      )}
    />
  );
}
