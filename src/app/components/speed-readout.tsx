'use client';

import * as stylex from '@stylexjs/stylex';
import { use } from 'react';
import { prettyBandwidth } from 'xbits';
import { DownloadContext, UploadContext } from '@/context/speedtest';
import { splitUnit } from '@/lib/split-unit';
import { bp } from '../../styles/breakpoints.stylex';
import { colors, fonts } from '../../styles/tokens.stylex';
import { TrendChart } from './trend-chart';
import { TREND_SAMPLES } from '@/hooks/use-speedtest';

const styles = stylex.create({
  value: {
    fontFamily: fonts.condensed,
    fontSize: { default: 64, [bp.mobile]: 52, [bp.large]: 88 },
    fontWeight: 300,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    // Cormorant defaults to old-style figures; lining figures keep a readout level.
    fontVariantNumeric: 'lining-nums tabular-nums',
    color: colors.ink
  },
  unit: {
    marginLeft: 10,
    fontFamily: fonts.sans,
    fontSize: { default: 16, [bp.large]: 22 },
    fontWeight: 300,
    letterSpacing: '0.02em',
    color: colors.inkMuted
  },
  empty: { color: colors.inkFaint }
});

/** Headline speed of one direction: live while its phase runs, the result afterwards. */
export function SpeedReadout({ direction }: { direction: 'download' | 'upload' }) {
  const { speed } = use(direction === 'download' ? DownloadContext : UploadContext);
  const figure = speed == null ? null : splitUnit(prettyBandwidth(speed * 1e6, { locale: 'en-US', minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  return (
    <p {...stylex.props(styles.value, figure === null && styles.empty)}>
      {figure?.value ?? '0.00'}
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
