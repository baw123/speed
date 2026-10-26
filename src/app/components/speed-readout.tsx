'use client';

import * as stylex from '@stylexjs/stylex';
import { use } from 'react';
import { prettyBandwidth } from 'xbits';
import { DownloadContext, UploadContext, usePhase } from '@/context/speedtest';
import { splitUnit } from '@/lib/split-unit';
import { colors, fonts } from '../../styles/tokens.stylex';
import { TrendChart } from './trend-chart';
import { TREND_SAMPLES } from '@/hooks/use-speedtest';

const styles = stylex.create({
  value: {
    fontFamily: fonts.condensed,
    fontSize: 'clamp(72px, 9vw, 128px)',
    fontWeight: 300,
    lineHeight: 1,
    letterSpacing: '0',
    paddingBottom: 28,
    fontVariantNumeric: 'lining-nums tabular-nums',
    color: colors.lit
  },
  unit: {
    marginLeft: 14,
    fontFamily: fonts.sans,
    fontSize: 'clamp(20px, 2vw, 28px)',
    fontWeight: 300,
    letterSpacing: '0.02em',
    color: colors.inkMuted
  },
  idle: { color: colors.inkFaint }
});

/** Headline speed of one direction: live while its phase runs, the result afterwards. */
export function SpeedReadout({ direction }: { direction: 'download' | 'upload' }) {
  const phase = usePhase();
  const { speed } = use(direction === 'download' ? DownloadContext : UploadContext);
  const figure = speed == null ? null : splitUnit(prettyBandwidth(speed * 1e6, { locale: 'en-US', minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const idle = phase === 'idle';
  return (
    <p {...stylex.props(styles.value, idle && styles.idle)}>
      {figure?.value ?? '0'}
      <span {...stylex.props(styles.unit)}>{figure?.unit ?? 'Mbps'}</span>
    </p>
  );
}

/** The full-width trend line under the hero. */
export function SpeedTrend({ direction }: { direction: 'download' | 'upload' }) {
  const { sustained, trend } = use(direction === 'download' ? DownloadContext : UploadContext);
  return (
    <TrendChart samples={trend} capacity={Math.max(trend.length, TREND_SAMPLES)} marker={sustained} markerLabel="Sustained" tone={direction} />
  );
}
